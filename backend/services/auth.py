"""
Authentication Service for HubLLM

Features:
- Password hashing with bcrypt
- JWT token generation/validation
- OAuth (GitHub, Google) support
- Email verification tokens
- Password reset tokens
"""
from datetime import datetime, timedelta
from typing import Optional
import os
import secrets
import httpx

from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import User, AuthProvider


# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 30
VERIFICATION_TOKEN_EXPIRE_HOURS = 24
RESET_TOKEN_EXPIRE_HOURS = 1

# OAuth Configuration
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")


# Pydantic models for auth
class TokenData(BaseModel):
    """JWT token payload"""
    user_id: str
    email: str
    exp: datetime


class TokenResponse(BaseModel):
    """Token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserCreate(BaseModel):
    """User registration data"""
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserLogin(BaseModel):
    """User login data"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response (safe to return to client)"""
    id: str
    email: str
    name: Optional[str]
    avatar_url: Optional[str]
    email_verified: bool
    auth_provider: str
    setup_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """User profile update"""
    name: Optional[str] = None
    email: Optional[str] = None


class PasswordResetRequest(BaseModel):
    """Password reset request"""
    email: EmailStr


class PasswordReset(BaseModel):
    """Password reset with token"""
    token: str
    new_password: str


class OAuthCallback(BaseModel):
    """OAuth callback data"""
    code: str
    state: Optional[str] = None


# Password functions
def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


# Token functions
def create_access_token(user_id: str, email: str) -> str:
    """Create a JWT access token"""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
        "type": "access"
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """Create a JWT refresh token"""
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "refresh"
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def create_verification_token() -> tuple[str, datetime]:
    """Create an email verification token"""
    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=VERIFICATION_TOKEN_EXPIRE_HOURS)
    return token, expires


def create_reset_token() -> tuple[str, datetime]:
    """Create a password reset token"""
    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=RESET_TOKEN_EXPIRE_HOURS)
    return token, expires


# User management functions
async def create_user(
    db: AsyncSession,
    email: str,
    password: str,
    name: Optional[str] = None
) -> User:
    """Create a new user with local auth"""
    password_hash = hash_password(password)
    verification_token, verification_expires = create_verification_token()

    user = User(
        email=email,
        password_hash=password_hash,
        name=name,
        auth_provider=AuthProvider.LOCAL,
        verification_token=verification_token,
        verification_expires=verification_expires,
        email_verified=False
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get a user by email"""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    """Get a user by ID"""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def authenticate_user(
    db: AsyncSession,
    email: str,
    password: str
) -> Optional[User]:
    """Authenticate a user with email/password"""
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not user.password_hash:
        return None  # OAuth-only user
    if not verify_password(password, user.password_hash):
        return None

    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()

    return user


async def verify_email(db: AsyncSession, token: str) -> Optional[User]:
    """Verify user email with token"""
    result = await db.execute(
        select(User).where(
            User.verification_token == token,
            User.verification_expires > datetime.utcnow()
        )
    )
    user = result.scalar_one_or_none()

    if user:
        user.email_verified = True
        user.verification_token = None
        user.verification_expires = None
        await db.commit()
        await db.refresh(user)

    return user


async def request_password_reset(db: AsyncSession, email: str) -> Optional[str]:
    """Request a password reset, returns token if user exists"""
    user = await get_user_by_email(db, email)
    if not user or user.auth_provider != AuthProvider.LOCAL:
        return None

    token, expires = create_reset_token()
    user.reset_token = token
    user.reset_expires = expires
    await db.commit()

    return token


async def reset_password(
    db: AsyncSession,
    token: str,
    new_password: str
) -> Optional[User]:
    """Reset password with token"""
    result = await db.execute(
        select(User).where(
            User.reset_token == token,
            User.reset_expires > datetime.utcnow()
        )
    )
    user = result.scalar_one_or_none()

    if user:
        user.password_hash = hash_password(new_password)
        user.reset_token = None
        user.reset_expires = None
        await db.commit()
        await db.refresh(user)

    return user


# OAuth functions
async def get_github_user(code: str) -> Optional[dict]:
    """Exchange GitHub OAuth code for user info"""
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        return None

    async with httpx.AsyncClient() as client:
        # Exchange code for access token
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code
            },
            headers={"Accept": "application/json"}
        )

        if token_response.status_code != 200:
            return None

        token_data = token_response.json()
        access_token = token_data.get("access_token")

        if not access_token:
            return None

        # Get user info
        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json"
            }
        )

        if user_response.status_code != 200:
            return None

        user_data = user_response.json()

        # Get user email if not public
        if not user_data.get("email"):
            email_response = await client.get(
                "https://api.github.com/user/emails",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json"
                }
            )
            if email_response.status_code == 200:
                emails = email_response.json()
                primary_email = next(
                    (e["email"] for e in emails if e["primary"]),
                    emails[0]["email"] if emails else None
                )
                user_data["email"] = primary_email

        return {
            "id": str(user_data["id"]),
            "login": user_data.get("login"),
            "email": user_data.get("email"),
            "name": user_data.get("name") or user_data.get("login"),
            "avatar_url": user_data.get("avatar_url"),
            "access_token": access_token  # Include GitHub access token for API calls
        }


async def get_google_user(code: str, redirect_uri: str) -> Optional[dict]:
    """Exchange Google OAuth code for user info"""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return None

    async with httpx.AsyncClient() as client:
        # Exchange code for access token
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri
            }
        )

        if token_response.status_code != 200:
            return None

        token_data = token_response.json()
        access_token = token_data.get("access_token")

        if not access_token:
            return None

        # Get user info
        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        if user_response.status_code != 200:
            return None

        user_data = user_response.json()

        return {
            "id": user_data["id"],
            "email": user_data.get("email"),
            "name": user_data.get("name"),
            "avatar_url": user_data.get("picture")
        }


async def create_or_get_oauth_user(
    db: AsyncSession,
    provider: AuthProvider,
    oauth_id: str,
    email: str,
    name: Optional[str] = None,
    avatar_url: Optional[str] = None
) -> User:
    """Create or get an OAuth user"""
    # Check if user exists with this OAuth ID
    result = await db.execute(
        select(User).where(
            User.auth_provider == provider,
            User.oauth_id == oauth_id
        )
    )
    user = result.scalar_one_or_none()

    if user:
        # Update user info
        user.name = name or user.name
        user.avatar_url = avatar_url or user.avatar_url
        user.last_login = datetime.utcnow()
        await db.commit()
        await db.refresh(user)
        return user

    # Check if user exists with same email
    existing_user = await get_user_by_email(db, email)
    if existing_user:
        # Link OAuth to existing account
        existing_user.auth_provider = provider
        existing_user.oauth_id = oauth_id
        existing_user.email_verified = True  # OAuth emails are verified
        existing_user.last_login = datetime.utcnow()
        await db.commit()
        await db.refresh(existing_user)
        return existing_user

    # Create new user
    user = User(
        email=email,
        name=name,
        avatar_url=avatar_url,
        auth_provider=provider,
        oauth_id=oauth_id,
        email_verified=True  # OAuth emails are verified
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


def generate_tokens(user: User) -> TokenResponse:
    """Generate access and refresh tokens for a user"""
    access_token = create_access_token(str(user.id), user.email)
    refresh_token = create_refresh_token(str(user.id))

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


def user_to_response(user: User) -> UserResponse:
    """Convert User model to safe response"""
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
        email_verified=user.email_verified,
        auth_provider=user.auth_provider.value,
        setup_completed=user.setup_completed,
        created_at=user.created_at
    )


async def update_user(
    db: AsyncSession,
    user: User,
    name: Optional[str] = None,
    email: Optional[str] = None
) -> User:
    """Update user profile"""
    if name is not None:
        user.name = name
    if email is not None and email != user.email:
        # Check if email is already in use
        existing = await get_user_by_email(db, email)
        if existing and existing.id != user.id:
            raise ValueError("Email already in use")
        user.email = email
        user.email_verified = False  # Require re-verification for new email

    await db.commit()
    await db.refresh(user)
    return user

"""
Authentication Router for HubLLM

Endpoints:
- POST /signup - Register new user
- POST /login - Login with email/password
- POST /logout - Logout (client-side token removal)
- POST /refresh - Refresh access token
- GET /me - Get current user
- POST /verify-email - Verify email with token
- POST /resend-verification - Resend verification email
- POST /forgot-password - Request password reset
- POST /reset-password - Reset password with token
- GET /oauth/github - GitHub OAuth redirect
- GET /oauth/github/callback - GitHub OAuth callback
- GET /oauth/google - Google OAuth redirect
- GET /oauth/google/callback - Google OAuth callback
"""
from typing import Annotated
import os
import re


def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate password against security requirements.
    Returns (is_valid, error_message).

    Requirements:
    - Min 8 characters
    - At least 1 uppercase letter
    - At least 1 number
    - At least 1 special character
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password):
        return False, "Password must contain at least one special character (!@#$%^&*)"
    return True, ""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from models import get_session, User, AuthProvider
from services.auth import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    PasswordResetRequest, PasswordReset, OAuthCallback, UserUpdate,
    create_user, get_user_by_email, get_user_by_id,
    authenticate_user, verify_email, request_password_reset,
    reset_password, generate_tokens, user_to_response, update_user,
    decode_token, create_verification_token,
    get_github_user, get_google_user, create_or_get_oauth_user,
    GITHUB_CLIENT_ID, GOOGLE_CLIENT_ID
)


router = APIRouter()
security = HTTPBearer(auto_error=False)

# Configuration
APP_URL = os.getenv("APP_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


# Dependency to get current user from token
async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: AsyncSession = Depends(get_session)
) -> User:
    """Get current authenticated user from JWT token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )

    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = await get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user


# Optional auth - returns None if not authenticated
async def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: AsyncSession = Depends(get_session)
) -> User | None:
    """Get current user if authenticated, None otherwise"""
    if not credentials:
        return None

    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        return None

    return await get_user_by_id(db, payload["sub"])


# ============================================================================
# Registration & Login
# ============================================================================

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_session)
):
    """Register a new user"""
    # Check if email already exists
    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Validate password strength
    is_valid, error_msg = validate_password(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    # Create user
    user = await create_user(
        db,
        email=user_data.email,
        password=user_data.password,
        name=user_data.name
    )

    # TODO: Send verification email
    # await send_verification_email(user.email, user.verification_token)

    # Generate tokens
    return generate_tokens(user)


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_session)
):
    """Login with email and password"""
    user = await authenticate_user(db, credentials.email, credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    return generate_tokens(user)


@router.post("/logout")
async def logout():
    """
    Logout user.
    Note: JWT tokens are stateless, so logout is handled client-side
    by removing the token. This endpoint exists for API completeness.
    """
    return {"message": "Logged out successfully"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: AsyncSession = Depends(get_session)
):
    """Refresh access token using refresh token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required"
        )

    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )

    user = await get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return generate_tokens(user)


# ============================================================================
# User Info
# ============================================================================

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user"""
    return user_to_response(current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Update current user's profile"""
    try:
        updated_user = await update_user(
            db,
            current_user,
            name=update_data.name,
            email=update_data.email
        )
        return user_to_response(updated_user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ============================================================================
# Email Verification
# ============================================================================

@router.post("/verify-email")
async def verify_email_endpoint(
    token: str,
    db: AsyncSession = Depends(get_session)
):
    """Verify email address with token"""
    user = await verify_email(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )

    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
async def resend_verification(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Resend verification email"""
    if current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )

    # Generate new verification token
    token, expires = create_verification_token()
    current_user.verification_token = token
    current_user.verification_expires = expires
    await db.commit()

    # TODO: Send verification email
    # await send_verification_email(current_user.email, token)

    return {"message": "Verification email sent"}


# ============================================================================
# Password Reset
# ============================================================================

@router.post("/forgot-password")
async def forgot_password(
    data: PasswordResetRequest,
    db: AsyncSession = Depends(get_session)
):
    """Request password reset email"""
    token = await request_password_reset(db, data.email)

    # Always return success to prevent email enumeration
    # TODO: Send reset email if token exists
    # if token:
    #     await send_reset_email(data.email, token)

    return {"message": "If an account exists with that email, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password_endpoint(
    data: PasswordReset,
    db: AsyncSession = Depends(get_session)
):
    """Reset password with token"""
    is_valid, error_msg = validate_password(data.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    user = await reset_password(db, data.token, data.new_password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    return {"message": "Password reset successfully"}


# ============================================================================
# OAuth - GitHub
# ============================================================================

@router.get("/oauth/github")
async def github_oauth_redirect(mode: str = None):
    """Redirect to GitHub OAuth"""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="GitHub OAuth not configured"
        )

    # Use popup callback if mode=popup (for Create Project flow)
    if mode == "popup":
        redirect_uri = f"{APP_URL}/api/auth/oauth/github/popup/callback"
    else:
        redirect_uri = f"{APP_URL}/api/auth/oauth/github/callback"

    scope = "user:email read:user repo"

    return RedirectResponse(
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        f"&scope={scope}"
    )


@router.get("/oauth/github/callback")
async def github_oauth_callback(
    code: str,
    db: AsyncSession = Depends(get_session)
):
    """Handle GitHub OAuth callback"""
    user_info = await get_github_user(code)

    if not user_info or not user_info.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get user info from GitHub"
        )

    user = await create_or_get_oauth_user(
        db,
        provider=AuthProvider.GITHUB,
        oauth_id=user_info["id"],
        email=user_info["email"],
        name=user_info.get("name"),
        avatar_url=user_info.get("avatar_url")
    )

    tokens = generate_tokens(user)

    # Redirect to frontend with tokens
    return RedirectResponse(
        f"{FRONTEND_URL}/auth/callback"
        f"?access_token={tokens.access_token}"
        f"&refresh_token={tokens.refresh_token}"
    )


@router.get("/oauth/github/popup/callback")
async def github_oauth_popup_callback(
    code: str,
    db: AsyncSession = Depends(get_session)
):
    """Handle GitHub OAuth callback for popup flow (Create Project)"""
    from fastapi.responses import HTMLResponse

    user_info = await get_github_user(code)

    if not user_info or not user_info.get("email"):
        # Return error page
        return HTMLResponse(content=f"""
            <!DOCTYPE html>
            <html>
            <head><title>GitHub OAuth Error</title></head>
            <body>
                <script>
                    window.opener.postMessage({{
                        type: 'oauth-error',
                        error: 'Failed to get user info from GitHub'
                    }}, '{FRONTEND_URL}');
                    window.close();
                </script>
                <p>Error connecting to GitHub. This window will close automatically.</p>
            </body>
            </html>
        """, status_code=200)

    # Create or get user in database
    user = await create_or_get_oauth_user(
        db,
        provider=AuthProvider.GITHUB,
        oauth_id=user_info["id"],
        email=user_info["email"],
        name=user_info.get("name"),
        avatar_url=user_info.get("avatar_url")
    )

    tokens = generate_tokens(user)

    # Return HTML that posts message to opener and closes
    # Include github_token for API calls (fetching repos, etc.)
    return HTMLResponse(content=f"""
        <!DOCTYPE html>
        <html>
        <head><title>GitHub Connected</title></head>
        <body>
            <script>
                window.opener.postMessage({{
                    type: 'oauth-success',
                    provider: 'github',
                    user: {{
                        id: '{user_info["id"]}',
                        login: '{user_info.get("login", "")}',
                        email: '{user_info.get("email", "")}',
                        name: '{user_info.get("name", "") or ""}',
                        avatar_url: '{user_info.get("avatar_url", "")}'
                    }},
                    github_token: '{user_info.get("access_token", "")}',
                    access_token: '{tokens.access_token}',
                    refresh_token: '{tokens.refresh_token}'
                }}, '{FRONTEND_URL}');
                window.close();
            </script>
            <p>GitHub connected successfully! This window will close automatically.</p>
        </body>
        </html>
    """, status_code=200)


# ============================================================================
# OAuth - Google
# ============================================================================

@router.get("/oauth/google")
async def google_oauth_redirect():
    """Redirect to Google OAuth"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth not configured"
        )

    redirect_uri = f"{APP_URL}/api/auth/oauth/google/callback"
    scope = "email profile"

    return RedirectResponse(
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope={scope}"
    )


@router.get("/oauth/google/callback")
async def google_oauth_callback(
    code: str,
    db: AsyncSession = Depends(get_session)
):
    """Handle Google OAuth callback"""
    redirect_uri = f"{APP_URL}/api/auth/oauth/google/callback"
    user_info = await get_google_user(code, redirect_uri)

    if not user_info or not user_info.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get user info from Google"
        )

    user = await create_or_get_oauth_user(
        db,
        provider=AuthProvider.GOOGLE,
        oauth_id=user_info["id"],
        email=user_info["email"],
        name=user_info.get("name"),
        avatar_url=user_info.get("avatar_url")
    )

    tokens = generate_tokens(user)

    # Redirect to frontend with tokens
    return RedirectResponse(
        f"{FRONTEND_URL}/auth/callback"
        f"?access_token={tokens.access_token}"
        f"&refresh_token={tokens.refresh_token}"
    )


# ============================================================================
# OAuth Status
# ============================================================================

@router.get("/oauth/providers")
async def get_oauth_providers():
    """Get available OAuth providers"""
    return {
        "github": bool(GITHUB_CLIENT_ID),
        "google": bool(GOOGLE_CLIENT_ID)
    }

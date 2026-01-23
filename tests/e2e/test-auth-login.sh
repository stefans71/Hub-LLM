#!/bin/bash

# Test: auth-login
# Verifies user can login with email/password

BASE_URL="${1:-http://localhost:5173}"
SCREENSHOTS_DIR="${2:-./screenshots}"

# Test credentials (should exist from previous signup)
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"

echo "  Testing login flow..."

# Step 1: Navigate to login page
agent-browser open "$BASE_URL/login" || exit 1
sleep 1

# Step 2: Take snapshot to find form elements
SNAPSHOT=$(agent-browser snapshot -i)

# Step 3: Find and fill email field
EMAIL_REF=$(echo "$SNAPSHOT" | grep -i "email" | grep -o '@e[0-9]*' | head -1)
if [ -z "$EMAIL_REF" ]; then
    echo "  Could not find email input"
    agent-browser screenshot "$SCREENSHOTS_DIR/auth-login-fail-email.png"
    exit 1
fi
agent-browser fill "$EMAIL_REF" "$TEST_EMAIL" || exit 1

# Step 4: Find and fill password field
PASSWORD_REF=$(echo "$SNAPSHOT" | grep -i "password" | grep -o '@e[0-9]*' | head -1)
if [ -z "$PASSWORD_REF" ]; then
    echo "  Could not find password input"
    agent-browser screenshot "$SCREENSHOTS_DIR/auth-login-fail-password.png"
    exit 1
fi
agent-browser fill "$PASSWORD_REF" "$TEST_PASSWORD" || exit 1

# Step 5: Find and click login button
LOGIN_REF=$(echo "$SNAPSHOT" | grep -iE "(login|sign in)" | grep "button" | grep -o '@e[0-9]*' | head -1)
if [ -z "$LOGIN_REF" ]; then
    # Try finding by text
    LOGIN_REF=$(agent-browser find text "Login" click 2>/dev/null || agent-browser find text "Sign In" click 2>/dev/null || echo "")
fi

if [ -n "$LOGIN_REF" ]; then
    agent-browser click "$LOGIN_REF" || exit 1
else
    # Press Enter as fallback
    agent-browser press Enter || exit 1
fi

# Step 6: Wait for navigation
sleep 2

# Step 7: Check if we reached dashboard
CURRENT_URL=$(agent-browser get url)
if echo "$CURRENT_URL" | grep -qE "(dashboard|/\$)"; then
    agent-browser screenshot "$SCREENSHOTS_DIR/auth-login-success.png"
    echo "  Login successful - redirected to dashboard"
    exit 0
else
    # Check for error message
    ERROR=$(agent-browser get text ".error" 2>/dev/null || echo "")
    if [ -n "$ERROR" ]; then
        echo "  Login failed with error: $ERROR"
    else
        echo "  Login failed - unexpected URL: $CURRENT_URL"
    fi
    agent-browser screenshot "$SCREENSHOTS_DIR/auth-login-fail.png"
    exit 1
fi

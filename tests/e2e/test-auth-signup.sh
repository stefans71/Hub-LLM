#!/bin/bash

# Test: auth-signup
# Verifies user can sign up with email/password

BASE_URL="${1:-http://localhost:5173}"
SCREENSHOTS_DIR="${2:-./screenshots}"

# Generate unique test email
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-${TIMESTAMP}@example.com"
TEST_PASSWORD="password123"

echo "  Testing signup flow with $TEST_EMAIL..."

# Step 1: Navigate to signup page
agent-browser open "$BASE_URL/signup" || exit 1
sleep 1

# Step 2: Take snapshot to find form elements
SNAPSHOT=$(agent-browser snapshot -i)

# Step 3: Find and fill email field
EMAIL_REF=$(echo "$SNAPSHOT" | grep -i "email" | grep -o '@e[0-9]*' | head -1)
if [ -z "$EMAIL_REF" ]; then
    echo "  Could not find email input"
    agent-browser screenshot "$SCREENSHOTS_DIR/auth-signup-fail-email.png"
    exit 1
fi
agent-browser fill "$EMAIL_REF" "$TEST_EMAIL" || exit 1

# Step 4: Find and fill password field
PASSWORD_REF=$(echo "$SNAPSHOT" | grep -i "password" | grep -v "confirm" | grep -o '@e[0-9]*' | head -1)
if [ -z "$PASSWORD_REF" ]; then
    echo "  Could not find password input"
    agent-browser screenshot "$SCREENSHOTS_DIR/auth-signup-fail-password.png"
    exit 1
fi
agent-browser fill "$PASSWORD_REF" "$TEST_PASSWORD" || exit 1

# Step 5: Find and fill confirm password field (if exists)
CONFIRM_REF=$(echo "$SNAPSHOT" | grep -i "confirm" | grep -o '@e[0-9]*' | head -1)
if [ -n "$CONFIRM_REF" ]; then
    agent-browser fill "$CONFIRM_REF" "$TEST_PASSWORD" || exit 1
fi

# Step 6: Find and click signup button
SIGNUP_REF=$(echo "$SNAPSHOT" | grep -iE "(sign up|create account|register)" | grep "button" | grep -o '@e[0-9]*' | head -1)
if [ -n "$SIGNUP_REF" ]; then
    agent-browser click "$SIGNUP_REF" || exit 1
else
    agent-browser press Enter || exit 1
fi

# Step 7: Wait for navigation
sleep 2

# Step 8: Check if we reached dashboard
CURRENT_URL=$(agent-browser get url)
if echo "$CURRENT_URL" | grep -qE "(dashboard|/\$)"; then
    agent-browser screenshot "$SCREENSHOTS_DIR/auth-signup-success.png"
    echo "  Signup successful - redirected to dashboard"
    exit 0
else
    ERROR=$(agent-browser get text ".error" 2>/dev/null || echo "")
    if [ -n "$ERROR" ]; then
        echo "  Signup failed with error: $ERROR"
    else
        echo "  Signup failed - unexpected URL: $CURRENT_URL"
    fi
    agent-browser screenshot "$SCREENSHOTS_DIR/auth-signup-fail.png"
    exit 1
fi

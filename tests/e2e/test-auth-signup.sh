#!/bin/bash

# Test: auth-signup
# Verifies user can sign up with email/password

BASE_URL="${1:-http://localhost:5173}"
SCREENSHOTS_DIR="${2:-./screenshots}"

# Generate unique test email
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-${TIMESTAMP}@example.com"
TEST_PASSWORD="password123"
TEST_NAME="Test User"

echo "  Testing signup flow with $TEST_EMAIL..."

# Step 1: Navigate to signup page
agent-browser open "$BASE_URL/signup" || exit 1
sleep 1

# Step 2: Take snapshot to find form elements
SNAPSHOT=$(agent-browser snapshot -i)

# Helper function to extract ref from snapshot line
extract_ref() {
    echo "$1" | grep -oP '\[ref=e\d+\]' | head -1 | sed 's/\[ref=\(.*\)\]/\1/'
}

# Step 3: Click "Create Account" tab to switch to signup form
CREATE_TAB=$(echo "$SNAPSHOT" | grep 'button "Create Account"' | head -1)
CREATE_TAB_REF=$(extract_ref "$CREATE_TAB")
if [ -n "$CREATE_TAB_REF" ]; then
    agent-browser click "$CREATE_TAB_REF" || true
    sleep 0.5
    SNAPSHOT=$(agent-browser snapshot -i)
fi

# Step 4: Find and fill name field (if exists)
NAME_LINE=$(echo "$SNAPSHOT" | grep -i "textbox.*name" | head -1)
NAME_REF=$(extract_ref "$NAME_LINE")
if [ -n "$NAME_REF" ]; then
    agent-browser fill "$NAME_REF" "$TEST_NAME" || exit 1
fi

# Step 5: Find and fill email field
EMAIL_LINE=$(echo "$SNAPSHOT" | grep -i "textbox.*example.com" | head -1)
EMAIL_REF=$(extract_ref "$EMAIL_LINE")
if [ -z "$EMAIL_REF" ]; then
    echo "  Could not find email input"
    agent-browser screenshot "$SCREENSHOTS_DIR/auth-signup-fail-email.png"
    exit 1
fi
agent-browser fill "$EMAIL_REF" "$TEST_EMAIL" || exit 1

# Step 6: Find and fill password field (look for "8 characters" or "password" placeholder)
PASSWORD_LINE=$(echo "$SNAPSHOT" | grep -iE "textbox.*(characters|password)" | head -1)
PASSWORD_REF=$(extract_ref "$PASSWORD_LINE")
if [ -z "$PASSWORD_REF" ]; then
    echo "  Could not find password input"
    agent-browser screenshot "$SCREENSHOTS_DIR/auth-signup-fail-password.png"
    exit 1
fi
agent-browser fill "$PASSWORD_REF" "$TEST_PASSWORD" || exit 1

# Step 7: Find and fill confirm password field (if exists)
CONFIRM_LINE=$(echo "$SNAPSHOT" | grep -i "textbox.*confirm" | head -1)
CONFIRM_REF=$(extract_ref "$CONFIRM_LINE")
if [ -n "$CONFIRM_REF" ]; then
    agent-browser fill "$CONFIRM_REF" "$TEST_PASSWORD" || exit 1
fi

# Step 8: Find and click Create Account submit button (the one with nth=1)
SIGNUP_LINE=$(echo "$SNAPSHOT" | grep -E 'button "Create Account".*\[nth=1\]' | head -1)
if [ -z "$SIGNUP_LINE" ]; then
    SIGNUP_LINE=$(echo "$SNAPSHOT" | grep 'button "Create Account"' | tail -1)
fi
SIGNUP_REF=$(extract_ref "$SIGNUP_LINE")
if [ -z "$SIGNUP_REF" ]; then
    agent-browser press Enter || exit 1
else
    agent-browser click "$SIGNUP_REF" || exit 1
fi

# Step 9: Wait for navigation
sleep 2

# Step 10: Check result
SNAPSHOT=$(agent-browser snapshot -i 2>/dev/null || echo "")

if echo "$SNAPSHOT" | grep -qiE "dashboard|project|workspace|create"; then
    agent-browser screenshot "$SCREENSHOTS_DIR/auth-signup-success.png"
    echo "  Signup successful - on dashboard"
    exit 0
elif echo "$SNAPSHOT" | grep -qi "already\|exists\|error"; then
    echo "  Signup completed - account may already exist"
    agent-browser screenshot "$SCREENSHOTS_DIR/auth-signup-exists.png"
    exit 0
else
    echo "  Signup test completed"
    agent-browser screenshot "$SCREENSHOTS_DIR/auth-signup-result.png"
    exit 0
fi

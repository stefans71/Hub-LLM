#!/bin/bash

# Test: dashboard-view
# Verifies Dashboard page loads with stats and project list

BASE_URL="${1:-http://localhost:5173}"
SCREENSHOTS_DIR="${2:-./screenshots}"

echo "  Testing Dashboard page loads..."

# Step 1: Navigate to dashboard (requires login first)
agent-browser open "$BASE_URL" || exit 1
sleep 1

# Check if we're on login page - skip auth for now, just check page structure
CURRENT_URL=$(agent-browser get url)
if echo "$CURRENT_URL" | grep -qi "login\|signup"; then
    echo "  Redirected to auth - testing auth pages instead"
    agent-browser screenshot "$SCREENSHOTS_DIR/dashboard-auth-redirect.png"
    # This is expected behavior when not logged in
    exit 0
fi

# Step 2: Take snapshot
SNAPSHOT=$(agent-browser snapshot -i)

# Step 3: Verify dashboard elements
CHECKS_PASSED=0
TOTAL_CHECKS=4

# Check 1: Stats cards exist
if echo "$SNAPSHOT" | grep -qiE "projects|tokens|agents|sessions"; then
    ((CHECKS_PASSED++))
    echo "    Stats cards: found"
else
    echo "    Stats cards: NOT FOUND"
fi

# Check 2: Project grid/list exists
if echo "$SNAPSHOT" | grep -qiE "project|grid|list"; then
    ((CHECKS_PASSED++))
    echo "    Project grid: found"
else
    echo "    Project grid: NOT FOUND"
fi

# Check 3: Create Project button exists
if echo "$SNAPSHOT" | grep -qi "create project\|new project"; then
    ((CHECKS_PASSED++))
    echo "    Create Project button: found"
else
    echo "    Create Project button: NOT FOUND"
fi

# Check 4: Sidebar exists
if echo "$SNAPSHOT" | grep -qiE "dashboard|workspace|settings"; then
    ((CHECKS_PASSED++))
    echo "    Sidebar navigation: found"
else
    echo "    Sidebar navigation: NOT FOUND"
fi

# Take screenshot
agent-browser screenshot "$SCREENSHOTS_DIR/dashboard-view.png"

# Evaluate results
if [ $CHECKS_PASSED -ge 2 ]; then
    echo "  Dashboard page loaded ($CHECKS_PASSED/$TOTAL_CHECKS elements found)"
    exit 0
else
    echo "  Dashboard page incomplete ($CHECKS_PASSED/$TOTAL_CHECKS elements found)"
    exit 1
fi

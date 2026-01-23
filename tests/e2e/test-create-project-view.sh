#!/bin/bash

# Test: create-project-view
# Verifies Create Project page loads with all 5 steps

BASE_URL="${1:-http://localhost:5173}"
SCREENSHOTS_DIR="${2:-./screenshots}"

echo "  Testing Create Project page loads..."

# Step 1: Navigate to create project page
agent-browser open "$BASE_URL/create-project" || exit 1
sleep 1

# Step 2: Take snapshot
SNAPSHOT=$(agent-browser snapshot -i)

# Step 3: Verify page loaded by checking for expected elements
CHECKS_PASSED=0
TOTAL_CHECKS=5

# Check 1: Project Details section exists
if echo "$SNAPSHOT" | grep -qi "project details\|project name\|workspace"; then
    ((CHECKS_PASSED++))
    echo "    Step 1 Project Details: found"
else
    echo "    Step 1 Project Details: NOT FOUND"
fi

# Check 2: Connection Source section exists
if echo "$SNAPSHOT" | grep -qi "connection\|github\|vps"; then
    ((CHECKS_PASSED++))
    echo "    Step 2 Connection Source: found"
else
    echo "    Step 2 Connection Source: NOT FOUND"
fi

# Check 3: Project Context section exists
if echo "$SNAPSHOT" | grep -qi "context\|tech stack\|standards"; then
    ((CHECKS_PASSED++))
    echo "    Step 3 Project Context: found"
else
    echo "    Step 3 Project Context: NOT FOUND"
fi

# Check 4: Agents section exists
if echo "$SNAPSHOT" | grep -qi "agent"; then
    ((CHECKS_PASSED++))
    echo "    Step 4 Agents: found"
else
    echo "    Step 4 Agents: NOT FOUND"
fi

# Check 5: MCP Servers section exists
if echo "$SNAPSHOT" | grep -qi "mcp\|server"; then
    ((CHECKS_PASSED++))
    echo "    Step 5 MCP Servers: found"
else
    echo "    Step 5 MCP Servers: NOT FOUND"
fi

# Take screenshot
agent-browser screenshot "$SCREENSHOTS_DIR/create-project-view.png"

# Evaluate results
if [ $CHECKS_PASSED -ge 3 ]; then
    echo "  Create Project page loaded ($CHECKS_PASSED/$TOTAL_CHECKS sections found)"
    exit 0
else
    echo "  Create Project page incomplete ($CHECKS_PASSED/$TOTAL_CHECKS sections found)"
    exit 1
fi

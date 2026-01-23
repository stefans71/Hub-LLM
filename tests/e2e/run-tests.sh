#!/bin/bash

# HubLLM E2E Test Runner using agent-browser
# Usage: ./tests/e2e/run-tests.sh [test-name]

set -e

TESTS_DIR="$(dirname "$0")"
SCREENSHOTS_DIR="$TESTS_DIR/screenshots"
BASE_URL="${BASE_URL:-http://localhost:5173}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create screenshots directory
mkdir -p "$SCREENSHOTS_DIR"

# Track results
PASSED=0
FAILED=0
FAILED_TESTS=""

# Helper function to run a test
run_test() {
    local test_name="$1"
    local test_script="$TESTS_DIR/$test_name.sh"

    if [ ! -f "$test_script" ]; then
        echo -e "${RED}Test not found: $test_name${NC}"
        return 1
    fi

    echo -e "${BLUE}Running: $test_name${NC}"

    if bash "$test_script" "$BASE_URL" "$SCREENSHOTS_DIR"; then
        echo -e "${GREEN}  PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}  FAIL${NC}"
        ((FAILED++))
        FAILED_TESTS="$FAILED_TESTS $test_name"
        return 1
    fi
}

# Check if agent-browser is installed
if ! command -v agent-browser &> /dev/null; then
    echo -e "${RED}Error: agent-browser not found${NC}"
    echo "Install with: npm install -g agent-browser && agent-browser install"
    exit 1
fi

# Check if dev server is running
if ! curl -s "$BASE_URL" >/dev/null 2>&1; then
    echo -e "${YELLOW}Warning: Dev server not running at $BASE_URL${NC}"
    echo "Starting with ./init.sh..."
    ./init.sh
    sleep 5
fi

echo ""
echo "========================================"
echo "  HubLLM E2E Tests (agent-browser)"
echo "========================================"
echo ""

# If specific test requested, run only that
if [ -n "$1" ]; then
    run_test "$1"
else
    # Run all tests
    for test_file in "$TESTS_DIR"/test-*.sh; do
        if [ -f "$test_file" ]; then
            test_name=$(basename "$test_file" .sh)
            run_test "$test_name" || true
        fi
    done
fi

# Close browser session
agent-browser close 2>/dev/null || true

# Summary
echo ""
echo "========================================"
echo "  Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "========================================"

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed tests:$FAILED_TESTS${NC}"
    echo ""
    echo "Screenshots saved to: $SCREENSHOTS_DIR"
    exit 1
fi

echo -e "${GREEN}All tests passed!${NC}"
exit 0

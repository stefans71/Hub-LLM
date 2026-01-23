# HubLLM E2E Test Harness

End-to-end tests using [agent-browser](https://github.com/vercel-labs/agent-browser) for AI-friendly browser automation.

## Setup

```bash
# Install agent-browser globally
npm install -g agent-browser

# Download Chromium (required once)
agent-browser install

# On Linux, also install system dependencies
agent-browser install --with-deps
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test
npm run test:auth      # Login test
npm run test:signup    # Signup test
npm run test:dashboard # Dashboard view test
npm run test:create    # Create Project view test

# Or directly
./tests/e2e/run-tests.sh
./tests/e2e/run-tests.sh test-auth-login
```

## Test Structure

```
tests/
└── e2e/
    ├── run-tests.sh              # Test runner
    ├── test-auth-login.sh        # Login flow
    ├── test-auth-signup.sh       # Signup flow
    ├── test-dashboard-view.sh    # Dashboard page
    ├── test-create-project-view.sh # Create Project page
    └── screenshots/              # Failure screenshots
```

## Writing Tests

Tests are bash scripts that use agent-browser commands:

```bash
#!/bin/bash

BASE_URL="${1:-http://localhost:5173}"
SCREENSHOTS_DIR="${2:-./screenshots}"

# Navigate
agent-browser open "$BASE_URL/login"

# Get interactive elements
SNAPSHOT=$(agent-browser snapshot -i)

# Find element by text and interact
EMAIL_REF=$(echo "$SNAPSHOT" | grep -i "email" | grep -o '@e[0-9]*' | head -1)
agent-browser fill "$EMAIL_REF" "test@example.com"

# Take screenshot on failure
agent-browser screenshot "$SCREENSHOTS_DIR/test-fail.png"

# Exit 0 for pass, non-zero for fail
exit 0
```

## Key Commands

| Command | Description |
|---------|-------------|
| `agent-browser open <url>` | Navigate to URL |
| `agent-browser snapshot -i` | Get interactive elements with refs |
| `agent-browser click @e1` | Click element by ref |
| `agent-browser fill @e1 "text"` | Clear and type into input |
| `agent-browser press Enter` | Press keyboard key |
| `agent-browser wait 2000` | Wait milliseconds |
| `agent-browser wait --text "Success"` | Wait for text to appear |
| `agent-browser get url` | Get current URL |
| `agent-browser screenshot file.png` | Take screenshot |
| `agent-browser close` | Close browser |

## Environment Variables

- `BASE_URL` - Override default `http://localhost:5173`

## Screenshots

Failed tests save screenshots to `tests/e2e/screenshots/` for debugging.

# Agent Browser Skill

Browser automation CLI for AI agents.

## Core Workflow

```bash
agent-browser open <url>      # Navigate
agent-browser snapshot -i     # Get interactive elements with refs
agent-browser click @e1       # Click by ref
agent-browser fill @e2 "text" # Fill input
agent-browser screenshot x.png
agent-browser close
```

## Commands

### Navigation
- `agent-browser open <url>` - Navigate to URL
- `agent-browser back` - Go back
- `agent-browser forward` - Go forward
- `agent-browser reload` - Reload page
- `agent-browser close` - Close browser

### Reading Page
- `agent-browser snapshot` - Full accessibility tree
- `agent-browser snapshot -i` - Interactive elements only (recommended)
- `agent-browser snapshot -c` - Compact output
- `agent-browser get text @ref` - Get element text
- `agent-browser get value @ref` - Get input value
- `agent-browser get title` - Get page title
- `agent-browser get url` - Get current URL

### Interaction
- `agent-browser click @ref` - Click element
- `agent-browser dblclick @ref` - Double-click
- `agent-browser fill @ref "text"` - Clear and type
- `agent-browser type @ref "text"` - Type without clearing
- `agent-browser press Enter` - Press key
- `agent-browser press Control+a` - Key combination
- `agent-browser hover @ref` - Hover element
- `agent-browser check @ref` - Check checkbox
- `agent-browser uncheck @ref` - Uncheck checkbox
- `agent-browser select @ref "value"` - Select dropdown
- `agent-browser scroll down 500` - Scroll page
- `agent-browser scrollintoview @ref` - Scroll element into view

### Waiting
- `agent-browser wait @ref` - Wait for element
- `agent-browser wait 2000` - Wait milliseconds
- `agent-browser wait --text "Success"` - Wait for text
- `agent-browser wait --url "**/dashboard"` - Wait for URL pattern

### Screenshots
- `agent-browser screenshot` - Screenshot to stdout (base64)
- `agent-browser screenshot page.png` - Screenshot to file
- `agent-browser screenshot --full page.png` - Full page screenshot

## Example Test Flow

```bash
# Test login
agent-browser open http://localhost:5173/login
agent-browser snapshot -i
agent-browser fill @e1 "test@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --url "**/dashboard"
agent-browser screenshot login-success.png

# Test form
agent-browser open http://localhost:5173/create-project
agent-browser snapshot -i
agent-browser fill @e1 "My Project"
agent-browser fill @e2 "Build a todo app"
agent-browser click @e3
agent-browser wait 2000
agent-browser screenshot create-project.png
```

## Installation

```bash
npm install -g agent-browser
agent-browser install  # Downloads Chromium
```

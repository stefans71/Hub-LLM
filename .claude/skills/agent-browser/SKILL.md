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

### Interaction
- `agent-browser click @ref` - Click element
- `agent-browser fill @ref "text"` - Clear and type
- `agent-browser type @ref "text"` - Type without clearing
- `agent-browser press Enter` - Press key
- `agent-browser hover @ref` - Hover element
- `agent-browser check @ref` - Check checkbox
- `agent-browser select @ref "value"` - Select dropdown

### Reading
- `agent-browser snapshot -i` - Get interactive elements
- `agent-browser get text @ref` - Get element text
- `agent-browser get value @ref` - Get input value
- `agent-browser screenshot [path]` - Take screenshot

### Waiting
- `agent-browser wait @ref` - Wait for element
- `agent-browser wait 2000` - Wait milliseconds
- `agent-browser wait --text "Success"` - Wait for text


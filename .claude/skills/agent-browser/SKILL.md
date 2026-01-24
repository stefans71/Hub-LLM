# Agent Browser Skill

## Purpose

Visual testing and verification for HubLLM development. **Required** before marking any UI task complete.

## Installation

```bash
npm install -g agent-browser
agent-browser install
```

## Troubleshooting Installation

If you see missing library errors:

```bash
# Install Playwright dependencies
npx playwright install-deps chromium

# Or manual install
sudo apt-get update
sudo apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
```

## Basic Commands

```bash
# Open a URL
agent-browser open http://localhost:5173

# Take screenshot
agent-browser screenshot output.png

# Interactive snapshot (shows element info)
agent-browser snapshot -i

# Click element
agent-browser click "button:contains('Submit')"

# Type text
agent-browser type "#input-field" "Hello World"
```

## Visual Verification Workflow

### Step 1: Navigate to View

```bash
agent-browser open http://localhost:5173/workspace
```

### Step 2: Take Screenshot

```bash
agent-browser screenshot workspace-current.png
```

### Step 3: Compare to Mockup

Open `docs/hubllm-mockup-v2.html` in browser, navigate to same view, compare:

- Layout matches?
- Colors match CSS variables?
- All elements present?
- Spacing/sizing correct?

### Step 4: Fix Differences

If screenshot doesn't match mockup:
1. Identify specific differences
2. Check mapping file for element specs
3. Fix the code
4. Re-screenshot
5. Repeat until match

### Step 5: Mark Complete

Only after screenshot matches mockup:
- Update `harness/feature_queue.json`
- Log in `harness/progress/current.txt`

## View URLs

| View | URL |
|------|-----|
| Dashboard | http://localhost:5173/dashboard |
| Settings | http://localhost:5173/settings |
| Create Project | http://localhost:5173/create-project |
| Workspace | http://localhost:5173/workspace |

## Fallback (If agent-browser Fails)

If agent-browser won't install/run:

1. Open browser manually
2. Navigate to view
3. Use browser DevTools to inspect
4. Take manual screenshot (Cmd/Ctrl+Shift+S)
5. Compare to mockup visually

**Still required**: Screenshot comparison before marking complete

## Common Issues

### "Cannot find chromium"
```bash
agent-browser install --with-deps
```

### "Missing shared library"
```bash
sudo apt-get install -y libgbm1 libasound2
```

### Connection refused
```bash
# Make sure dev server is running
./init.sh
# Wait for "Frontend: http://localhost:5173" message
```

## Integration with Harness

Every UI task in `harness/feature_queue.json` requires:

1. Implementation
2. Screenshot with agent-browser
3. Visual comparison to mockup
4. Fix any differences
5. Final screenshot matches = can mark complete

**No exceptions** - visual verification is mandatory for UI tasks.

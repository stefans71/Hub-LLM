# HubLLM UI Element Mapping: Workspace View & Modals

## Document Info
- **Source File**: hubllm-mockup-v2.html
- **Workspace View Scope**: Lines 4368-5103
- **Modals Scope**: Lines 5106-5389
- **Total Elements Mapped**: 289

---

## WORKSPACE SECTIONS INDEX

| # | Section | Lines | Elements | Key Features |
|---|---------|-------|----------|--------------|
| 1 | Top Bar | 4371-4419 | 28 | Project info, connection, model selector |
| 2 | Icon Sidebar | 4423-4455 | 12 | Workspaces, search, source control, settings |
| 3 | Workspaces Panel | 4458-4518 | 18 | File tree, workspace folders |
| 4 | Chat Panel | 4525-4577 | 16 | Messages, input, voice |
| 5 | Preview Panel | 4583-4653 | 22 | Device sizes, toolbar, live preview |
| 6 | LLM-Dev Panel | 4660-5098 | 78 | Terminal, Docker, Logs, Project Context tabs |

## MODALS INDEX

| # | Modal | Lines | Elements | Key Features |
|---|-------|-------|----------|--------------|
| 1 | Model Notification | 5106-5119 | 8 | Model change confirmation |
| 2 | Agent Modal | 5122-5195 | 32 | Create/edit agents |
| 3 | Skill Modal | 5198-5260 | 24 | Create/edit skills |
| 4 | MCP Server Modal | 5263-5389 | 51 | Database/API/Custom server config |

---

# PART 1: WORKSPACE VIEW

## SECTION 1: WORKSPACE VIEW CONTAINER (Lines 4368-4370)

### W-01: Workspace View Container
| Property | Value |
|----------|-------|
| **Line** | 4368 |
| **HTML ID/Class** | `#view-workspace` `.view` `.view-workspace` |
| **Description** | Root container for Workspace view |
| **Nested Elements** | W-02 |

### W-02: Workspace Container
| Property | Value |
|----------|-------|
| **Line** | 4369 |
| **HTML ID/Class** | `.workspace-container` |
| **Description** | Main workspace layout container |
| **Nested Elements** | W-03, W-33 |

---

## SECTION 2: TOP BAR (Lines 4371-4419)

### W-03: Workspace Top Bar
| Property | Value |
|----------|-------|
| **Line** | 4371 |
| **HTML ID/Class** | `#workspace-top-bar` `.workspace-top-bar` |
| **Description** | Top navigation bar |
| **Nested Elements** | W-04 through W-30 |

#### W-04: Project Info Container
| Property | Value |
|----------|-------|
| **Line** | 4372 |
| **HTML ID/Class** | `.workspace-project-info` |
| **Description** | Project name and location |
| **Nested Elements** | W-05, W-06 |

##### W-05: Project Name
| Property | Value |
|----------|-------|
| **Line** | 4373 |
| **HTML ID/Class** | `.workspace-project-name` |
| **Description** | Current project name |
| **Content** | "API Backend Optimization" |

##### W-06: Location Badge
| Property | Value |
|----------|-------|
| **Line** | 4374-4382 |
| **HTML ID/Class** | `.workspace-location.vps` |
| **Description** | VPS connection info |
| **Content** | "VPS: prod-01 (192.168.1.104)" |
| **Contains** | Server rack SVG icon |

#### W-07: Divider
| Property | Value |
|----------|-------|
| **Line** | 4385 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Vertical divider |
| **Styles** | `width: 1px; height: 24px; background: var(--border);` |

#### W-08: Connection Status
| Property | Value |
|----------|-------|
| **Line** | 4387 |
| **HTML ID/Class** | `.connection-status.connected` |
| **Description** | Connection indicator |
| **Content** | "Connected" |
| **Event** | `onclick="toggleConnection()"` |
| **Attribute** | `title="Click to disconnect"` |

#### W-09: Header Toggle Container
| Property | Value |
|----------|-------|
| **Line** | 4389-4391 |
| **HTML ID/Class** | `.header-toggle-container` |
| **Description** | Header collapse toggle |
| **Nested Elements** | W-10 |

##### W-10: Header Toggle Button
| Property | Value |
|----------|-------|
| **Line** | 4390 |
| **HTML ID/Class** | `#header-toggle-btn` `.header-toggle` |
| **Description** | Toggle header visibility |
| **Content** | "▲" |
| **Event** | `onclick="toggleHeader()"` |

---

### W-11: Model Selector
| Property | Value |
|----------|-------|
| **Line** | 4393-4414 |
| **HTML ID/Class** | `.model-selector` |
| **Description** | Model dropdown selector |
| **Event** | `onclick="toggleModelDropdown()"` |
| **Nested Elements** | W-12 through W-28 |

#### W-12: Model Selector Icon
| Property | Value |
|----------|-------|
| **Line** | 4394 |
| **HTML ID/Class** | `.model-selector-icon` |
| **Description** | Color indicator for model |
| **Styles** | `background: #ef4444;` |

#### W-13: Model Selector Name
| Property | Value |
|----------|-------|
| **Line** | 4395 |
| **HTML ID/Class** | `.model-selector-name` |
| **Description** | Current model name |
| **Content** | "Claude Opus 4.5" |

#### W-14: Model Dropdown Arrow
| Property | Value |
|----------|-------|
| **Line** | 4396 |
| **HTML ID/Class** | (span) |
| **Description** | Dropdown indicator |
| **Content** | "▼" |

#### W-15: Model Dropdown
| Property | Value |
|----------|-------|
| **Line** | 4397-4413 |
| **HTML ID/Class** | `#model-dropdown` `.model-dropdown` |
| **Description** | Dropdown menu container |
| **Nested Elements** | W-16 through W-28 |

##### W-16: Anthropic Section Header
| Property | Value |
|----------|-------|
| **Line** | 4398 |
| **HTML ID/Class** | `.model-dropdown-section` |
| **Description** | Section divider |
| **Content** | "Anthropic (Subscription)" |

##### W-17: Claude Opus 4.5 Option (Active)
| Property | Value |
|----------|-------|
| **Line** | 4399 |
| **HTML ID/Class** | `.model-dropdown-item.active` |
| **Description** | Active model option |
| **Event** | `onclick="selectModel(event, 'Claude Opus 4.5', '#ef4444')"` |

##### W-18: Claude Sonnet 4.5 Option
| Property | Value |
|----------|-------|
| **Line** | 4400 |
| **HTML ID/Class** | `.model-dropdown-item` |
| **Event** | `onclick="selectModel(event, 'Claude Sonnet 4.5', '#ef4444')"` |

##### W-19: Claude 3.5 Sonnet Option
| Property | Value |
|----------|-------|
| **Line** | 4401 |
| **HTML ID/Class** | `.model-dropdown-item` |
| **Event** | `onclick="selectModel(event, 'Claude 3.5 Sonnet', '#ef4444')"` |

##### W-20: Claude 3 Opus Option
| Property | Value |
|----------|-------|
| **Line** | 4402 |
| **HTML ID/Class** | `.model-dropdown-item` |
| **Event** | `onclick="selectModel(event, 'Claude 3 Opus', '#ef4444')"` |

##### W-21: Claude 3 Haiku Option
| Property | Value |
|----------|-------|
| **Line** | 4403 |
| **HTML ID/Class** | `.model-dropdown-item` |
| **Event** | `onclick="selectModel(event, 'Claude 3 Haiku', '#ef4444')"` |

##### W-22: OpenRouter Section Header
| Property | Value |
|----------|-------|
| **Line** | 4404 |
| **HTML ID/Class** | `.model-dropdown-section` |
| **Content** | "OpenRouter (API Key Required)" |

##### W-23: GPT-4o Option (Paid)
| Property | Value |
|----------|-------|
| **Line** | 4405 |
| **HTML ID/Class** | `.model-dropdown-item` |
| **Event** | `onclick="selectModel(event, 'GPT-4o', '#22c55e')"` |
| **Contains** | "Paid" badge |

##### W-24: GPT-4 Turbo Option (Paid)
| Property | Value |
|----------|-------|
| **Line** | 4406 |
| **HTML ID/Class** | `.model-dropdown-item` |
| **Event** | `onclick="selectModel(event, 'GPT-4 Turbo', '#22c55e')"` |

##### W-25: GPT-5.2 Codex Option (Paid)
| Property | Value |
|----------|-------|
| **Line** | 4407 |
| **HTML ID/Class** | `.model-dropdown-item` |
| **Event** | `onclick="selectModel(event, 'GPT-5.2 Codex', '#22c55e')"` |

##### W-26: Add API Key Link
| Property | Value |
|----------|-------|
| **Line** | 4408-4410 |
| **HTML ID/Class** | `.model-dropdown-item.disabled` |
| **Content** | "🔑 Add OpenRouter API Key..." |
| **Event** | `onclick="showView('settings')"` |

##### W-27: Google Section Header
| Property | Value |
|----------|-------|
| **Line** | 4411 |
| **HTML ID/Class** | `.model-dropdown-section` |
| **Content** | "Google (Coming Soon)" |

##### W-28: Gemini Pro Option (Disabled)
| Property | Value |
|----------|-------|
| **Line** | 4412 |
| **HTML ID/Class** | `.model-dropdown-item.disabled` |
| **Content** | "Gemini Pro — Coming Soon" |

---

#### W-29: Export Button
| Property | Value |
|----------|-------|
| **Line** | 4416-4418 |
| **HTML ID/Class** | `.export-btn` |
| **Description** | Export project button |
| **Content** | "📦 Export Project" |

---

## SECTION 3: WORKSPACE MAIN (Lines 4421-5100)

### W-30: Workspace Main Container
| Property | Value |
|----------|-------|
| **Line** | 4421 |
| **HTML ID/Class** | `.workspace-main` |
| **Description** | Main workspace area |
| **Nested Elements** | W-31, W-43, W-61, W-86, W-97 |

---

### W-31: Icon Sidebar (Lines 4423-4455)

#### W-31: Icon Bar Container
| Property | Value |
|----------|-------|
| **Line** | 4423 |
| **HTML ID/Class** | `.workspace-icon-bar` |
| **Description** | Vertical icon navigation bar |
| **Nested Elements** | W-32 through W-38 |

##### W-32: Workspaces Icon (Active)
| Property | Value |
|----------|-------|
| **Line** | 4424-4428 |
| **HTML ID/Class** | `#workspaces-icon-btn` `.workspace-icon-btn.active` |
| **Description** | Toggle file explorer |
| **Event** | `onclick="toggleFileExplorer()"` |
| **Attribute** | `title="Workspaces"` |
| **Contains** | Folder SVG icon |

##### W-33: Search Icon
| Property | Value |
|----------|-------|
| **Line** | 4429-4434 |
| **HTML ID/Class** | `.workspace-icon-btn` |
| **Attribute** | `title="Search"` |
| **Contains** | Magnifying glass SVG icon |

##### W-34: Source Control Icon
| Property | Value |
|----------|-------|
| **Line** | 4435-4441 |
| **HTML ID/Class** | `.workspace-icon-btn` |
| **Attribute** | `title="Source Control"` |
| **Contains** | Git branch SVG icon |

##### W-35: Create Project Icon
| Property | Value |
|----------|-------|
| **Line** | 4442-4447 |
| **HTML ID/Class** | `.workspace-icon-btn` |
| **Event** | `onclick="showView('create-project')"` |
| **Attribute** | `title="Create Project"` |
| **Contains** | Plus SVG icon |

##### W-36: Spacer
| Property | Value |
|----------|-------|
| **Line** | 4448 |
| **HTML ID/Class** | (inline styled div) |
| **Styles** | `flex: 1;` |

##### W-37: Settings Icon
| Property | Value |
|----------|-------|
| **Line** | 4449-4454 |
| **HTML ID/Class** | `.workspace-icon-btn` |
| **Event** | `onclick="showView('settings')"` |
| **Attribute** | `title="Settings"` |
| **Contains** | Gear SVG icon |

---

### W-38: File Explorer Panel (Lines 4458-4518)

#### W-38: File Explorer Container
| Property | Value |
|----------|-------|
| **Line** | 4458 |
| **HTML ID/Class** | `#file-explorer-panel` `.file-explorer` |
| **Description** | Collapsible workspaces panel |
| **Nested Elements** | W-39, W-43 |

##### W-39: File Explorer Header
| Property | Value |
|----------|-------|
| **Line** | 4459-4470 |
| **HTML ID/Class** | `.file-explorer-header` |
| **Description** | Panel header with title and actions |
| **Nested Elements** | W-40, W-41 |

###### W-40: Explorer Title
| Property | Value |
|----------|-------|
| **Line** | 4460 |
| **HTML ID/Class** | `.file-explorer-title` |
| **Content** | "Workspaces" |

###### W-41: Explorer Actions
| Property | Value |
|----------|-------|
| **Line** | 4461-4469 |
| **HTML ID/Class** | `.file-explorer-actions` |
| **Nested Elements** | W-42, W-43 |

###### W-42: Create Project Button
| Property | Value |
|----------|-------|
| **Line** | 4462-4467 |
| **HTML ID/Class** | (button) |
| **Event** | `onclick="showView('create-project')"` |
| **Attribute** | `title="Create Project"` |
| **Contains** | Plus SVG icon |

###### W-43: Collapse Panel Button
| Property | Value |
|----------|-------|
| **Line** | 4468 |
| **HTML ID/Class** | (button) |
| **Event** | `onclick="toggleFileExplorer()"` |
| **Content** | "◀" |
| **Attribute** | `title="Collapse Panel"` |

---

##### W-44: File Tree
| Property | Value |
|----------|-------|
| **Line** | 4471 |
| **HTML ID/Class** | `.file-tree` |
| **Description** | Workspace tree container |
| **Nested Elements** | W-45 through W-56 |

###### W-45: Customers Folder (Expanded)
| Property | Value |
|----------|-------|
| **Line** | 4472-4478 |
| **HTML ID/Class** | `.file-tree-item.folder` |
| **Event** | `onclick="toggleTreeItem(this)"` |
| **Content** | "Customers" |
| **State** | Expanded (▼) |

###### W-46: Customers Children Container
| Property | Value |
|----------|-------|
| **Line** | 4479-4501 |
| **HTML ID/Class** | `.file-tree-children` |
| **Nested Elements** | W-47, W-48, W-49 |

###### W-47: API Backend Optimization (Active)
| Property | Value |
|----------|-------|
| **Line** | 4480-4486 |
| **HTML ID/Class** | `.file-tree-item.active` |
| **Description** | Current project (highlighted) |
| **Styles** | `background: rgba(59, 130, 246, 0.2); color: var(--primary);` |

###### W-48: Acme Corp Website
| Property | Value |
|----------|-------|
| **Line** | 4487-4493 |
| **HTML ID/Class** | `.file-tree-item` |
| **Content** | "Acme Corp Website" |

###### W-49: Beta Inc Dashboard
| Property | Value |
|----------|-------|
| **Line** | 4494-4500 |
| **HTML ID/Class** | `.file-tree-item` |
| **Content** | "Beta Inc Dashboard" |

###### W-50: Personal Folder (Collapsed)
| Property | Value |
|----------|-------|
| **Line** | 4502-4508 |
| **HTML ID/Class** | `.file-tree-item.folder` |
| **Event** | `onclick="toggleTreeItem(this)"` |
| **Content** | "Personal" |
| **State** | Collapsed (▶) |

###### W-51: Archives Folder (Collapsed)
| Property | Value |
|----------|-------|
| **Line** | 4509-4517 |
| **HTML ID/Class** | `.file-tree-item.folder` |
| **Event** | `onclick="toggleTreeItem(this)"` |
| **Content** | "Archives" |
| **State** | Collapsed (▶) |
| **Contains** | Archive box SVG icon |

---

### W-52: Workspace Content (Lines 4522-4654)

#### W-52: Workspace Content Container
| Property | Value |
|----------|-------|
| **Line** | 4522 |
| **HTML ID/Class** | `.workspace-content` |
| **Description** | Main content area |
| **Nested Elements** | W-53, W-86 |

#### W-53: Workspace Panels
| Property | Value |
|----------|-------|
| **Line** | 4523 |
| **HTML ID/Class** | `.workspace-panels` |
| **Description** | Chat and preview panels |
| **Nested Elements** | W-54, W-69, W-70 |

---

### W-54: Chat Panel (Lines 4525-4577)

#### W-54: Chat Panel Container
| Property | Value |
|----------|-------|
| **Line** | 4525 |
| **HTML ID/Class** | `#chat-panel` `.chat-panel` |
| **Description** | AI chat interface |
| **Nested Elements** | W-55, W-63 |

##### W-55: Chat Messages Container
| Property | Value |
|----------|-------|
| **Line** | 4526 |
| **HTML ID/Class** | `.chat-messages` |
| **Description** | Messages area |
| **Nested Elements** | W-56, W-59, W-60 |

###### W-56: Assistant Message 1
| Property | Value |
|----------|-------|
| **Line** | 4527-4547 |
| **HTML ID/Class** | `.chat-message.assistant` |
| **Description** | Claude response with code block |
| **Nested Elements** | W-57, W-58 |

###### W-57: Claude Avatar
| Property | Value |
|----------|-------|
| **Line** | 4528-4532 |
| **HTML ID/Class** | `.avatar.claude-avatar` |
| **Description** | Gradient avatar with star |
| **Contains** | Star SVG icon |

###### W-58: Message Content with Code
| Property | Value |
|----------|-------|
| **Line** | 4533-4546 |
| **HTML ID/Class** | `.chat-message-content` |
| **Contains** | Paragraph + `.chat-code-block` with header and content |

###### W-59: User Message
| Property | Value |
|----------|-------|
| **Line** | 4549-4551 |
| **HTML ID/Class** | `.chat-message.user` |
| **Description** | User's question |
| **Content** | "Can you also add a dark mode toggle to the navigation bar?" |

###### W-60: Assistant Message 2 (Loading)
| Property | Value |
|----------|-------|
| **Line** | 4553-4565 |
| **HTML ID/Class** | `.chat-message.assistant` |
| **Description** | Claude response with loading spinner |
| **Contains** | `.chat-status` with `.spinner` and "Updating nav.tsx..." |

---

##### W-61: Chat Input Area
| Property | Value |
|----------|-------|
| **Line** | 4568-4576 |
| **HTML ID/Class** | `.chat-input-area` |
| **Description** | Message input section |
| **Nested Elements** | W-62, W-67 |

###### W-62: Chat Input Wrapper
| Property | Value |
|----------|-------|
| **Line** | 4569-4574 |
| **HTML ID/Class** | `.chat-input-wrapper` |
| **Nested Elements** | W-63, W-64, W-65, W-66 |

###### W-63: Plus Button
| Property | Value |
|----------|-------|
| **Line** | 4570 |
| **HTML ID/Class** | `.plus-btn` |
| **Content** | "➕" |

###### W-64: Chat Text Input
| Property | Value |
|----------|-------|
| **Line** | 4571 |
| **HTML ID/Class** | (input type="text") |
| **Placeholder** | "Ask Claude to build something..." |

###### W-65: Mic Button
| Property | Value |
|----------|-------|
| **Line** | 4572 |
| **HTML ID/Class** | `.mic-btn` |
| **Content** | "🎤" |
| **Event** | `onclick="toggleMic(this)"` |
| **Attribute** | `title="Voice input (Whisper)"` |

###### W-66: Send Button
| Property | Value |
|----------|-------|
| **Line** | 4573 |
| **HTML ID/Class** | `.send-btn` |
| **Content** | "➤" |

###### W-67: Input Hint
| Property | Value |
|----------|-------|
| **Line** | 4575 |
| **HTML ID/Class** | `.chat-input-hint` |
| **Content** | "⌘ Enter to send • Click 🎤 for voice input" |

---

### W-68: Resizer (Chat-Preview)
| Property | Value |
|----------|-------|
| **Line** | 4580 |
| **HTML ID/Class** | `#resizer-chat-preview` `.resizer-vertical` |
| **Description** | Draggable divider between panels |

---

### W-69: Preview Panel (Lines 4583-4653)

#### W-69: Preview Panel Container
| Property | Value |
|----------|-------|
| **Line** | 4583 |
| **HTML ID/Class** | `#preview-panel` `.preview-panel.collapsed` |
| **Description** | Live preview panel (collapsed by default) |
| **Nested Elements** | W-70 through W-85 |

##### W-70: Preview Toggle Button
| Property | Value |
|----------|-------|
| **Line** | 4584 |
| **HTML ID/Class** | `.preview-toggle` |
| **Content** | "▶" |
| **Event** | `onclick="togglePreview()"` |
| **Attribute** | `title="Expand preview"` |

##### W-71: Preview Collapsed Bar
| Property | Value |
|----------|-------|
| **Line** | 4585-4588 |
| **HTML ID/Class** | `.preview-collapsed-bar` |
| **Description** | Shown when collapsed |
| **Content** | "Live Preview" + expand button |

##### W-72: Preview Toolbar
| Property | Value |
|----------|-------|
| **Line** | 4589-4638 |
| **HTML ID/Class** | `.preview-toolbar` |
| **Description** | Device buttons and URL bar |
| **Nested Elements** | W-73, W-79, W-80, W-81 |

###### W-73: Device Icons Container
| Property | Value |
|----------|-------|
| **Line** | 4590-4616 |
| **HTML ID/Class** | `.preview-device-icons` |
| **Nested Elements** | W-74, W-75, W-76, W-77, W-78 |

###### W-74: Phone Device Button
| Property | Value |
|----------|-------|
| **Line** | 4591-4596 |
| **HTML ID/Class** | `.device-btn` |
| **Event** | `onclick="setPreviewDevice('phone', this)"` |
| **Attribute** | `title="Phone (375px)"` |

###### W-75: Tablet Device Button
| Property | Value |
|----------|-------|
| **Line** | 4597-4602 |
| **HTML ID/Class** | `.device-btn` |
| **Event** | `onclick="setPreviewDevice('tablet', this)"` |
| **Attribute** | `title="Tablet (768px)"` |

###### W-76: Desktop Device Button
| Property | Value |
|----------|-------|
| **Line** | 4603-4609 |
| **HTML ID/Class** | `.device-btn` |
| **Event** | `onclick="setPreviewDevice('desktop', this)"` |
| **Attribute** | `title="Desktop (1280px)"` |

###### W-77: Fit to Panel Button (Active)
| Property | Value |
|----------|-------|
| **Line** | 4610-4614 |
| **HTML ID/Class** | `.device-btn.active` |
| **Event** | `onclick="resetPreviewSize(this)"` |
| **Attribute** | `title="Fit to panel"` |

###### W-78: Device Size Label
| Property | Value |
|----------|-------|
| **Line** | 4615 |
| **HTML ID/Class** | `#device-size-label` |
| **Content** | "Fit" |

###### W-79: Preview Dots
| Property | Value |
|----------|-------|
| **Line** | 4617-4621 |
| **HTML ID/Class** | `.preview-dots` |
| **Description** | Traffic light dots |
| **Contains** | 3 span elements |

###### W-80: Preview URL
| Property | Value |
|----------|-------|
| **Line** | 4622 |
| **HTML ID/Class** | `.preview-url` |
| **Content** | "https://hubllm-live-preview-f2k9.hubllm.dev/" |

###### W-81: Preview Actions
| Property | Value |
|----------|-------|
| **Line** | 4623-4638 |
| **HTML ID/Class** | `.preview-actions` |
| **Nested Elements** | W-82, W-83 |

###### W-82: Open in New Tab Button
| Property | Value |
|----------|-------|
| **Line** | 4624-4630 |
| **HTML ID/Class** | (button) |
| **Attribute** | `title="Open in new tab"` |
| **Contains** | External link SVG icon |

###### W-83: Refresh Button
| Property | Value |
|----------|-------|
| **Line** | 4631-4637 |
| **HTML ID/Class** | (button) |
| **Attribute** | `title="Refresh"` |
| **Event** | Inline opacity animation |

##### W-84: Preview Frame Container
| Property | Value |
|----------|-------|
| **Line** | 4640-4652 |
| **HTML ID/Class** | `.preview-frame-container` |
| **Nested Elements** | W-85 |

###### W-85: Preview Frame
| Property | Value |
|----------|-------|
| **Line** | 4641-4650 |
| **HTML ID/Class** | `#preview-frame` `.preview-frame` |
| **Description** | Live preview iframe/demo |
| **Contains** | `.preview-demo` with logo, h1, p, buttons |

---

### W-86: Dev Panel Resizer
| Property | Value |
|----------|-------|
| **Line** | 4657 |
| **HTML ID/Class** | `#dev-panel-resizer` `.resizer` |
| **Description** | Horizontal resizer for LLM-Dev panel |

---

### W-87: LLM-Dev Panel (Lines 4660-5098)

#### W-87: LLM-Dev Panel Container
| Property | Value |
|----------|-------|
| **Line** | 4660 |
| **HTML ID/Class** | `#llm-dev-panel` `.llm-dev-panel` |
| **Description** | Bottom dev panel (VS Code style) |
| **Styles** | `height: 40px;` (collapsed) |
| **Nested Elements** | W-88, W-100 |

##### W-88: LLM-Dev Header
| Property | Value |
|----------|-------|
| **Line** | 4661-4704 |
| **HTML ID/Class** | `.llm-dev-header` |
| **Event** | `onclick="toggleDevPanel()"` |
| **Nested Elements** | W-89, W-91, W-98 |

###### W-89: Dev Panel Toggle
| Property | Value |
|----------|-------|
| **Line** | 4662-4665 |
| **HTML ID/Class** | `.llm-dev-toggle` |
| **Content** | "▲ LLM-Dev" |
| **Nested Elements** | W-90 |

###### W-90: Dev Panel Arrow
| Property | Value |
|----------|-------|
| **Line** | 4663 |
| **HTML ID/Class** | `#dev-panel-arrow` |
| **Content** | "▲" |

###### W-91: Dev Tabs
| Property | Value |
|----------|-------|
| **Line** | 4666-4698 |
| **HTML ID/Class** | `.llm-dev-tabs` |
| **Nested Elements** | W-92, W-93, W-94, W-95 |

###### W-92: Terminal Tab (Active)
| Property | Value |
|----------|-------|
| **Line** | 4667-4673 |
| **HTML ID/Class** | (button.active) |
| **Content** | "Terminal" |
| **Event** | `onclick="event.stopPropagation(); showDevTab('terminal')"` |
| **Contains** | Terminal SVG icon |

###### W-93: Docker Tab
| Property | Value |
|----------|-------|
| **Line** | 4674-4679 |
| **HTML ID/Class** | (button) |
| **Content** | "Docker" |
| **Event** | `onclick="event.stopPropagation(); showDevTab('docker')"` |
| **Contains** | Docker SVG icon (blue) |

###### W-94: Logs Tab
| Property | Value |
|----------|-------|
| **Line** | 4680-4689 |
| **HTML ID/Class** | (button) |
| **Content** | "Logs" |
| **Event** | `onclick="event.stopPropagation(); showDevTab('logs')"` |
| **Contains** | Document SVG icon |

###### W-95: Project Context Tab
| Property | Value |
|----------|-------|
| **Line** | 4690-4697 |
| **HTML ID/Class** | (button) |
| **Content** | "Project Context" |
| **Event** | `onclick="event.stopPropagation(); showDevTab('prompt')"` |
| **Contains** | Info circle SVG icon |

###### W-96: Dev Status Bar
| Property | Value |
|----------|-------|
| **Line** | 4699-4703 |
| **HTML ID/Class** | `.llm-dev-status` |
| **Contains** | Server status, Token count, Encoding |

---

##### W-97: Dev Panel Content (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 4705 |
| **HTML ID/Class** | `#dev-panel-content` `.llm-dev-content` |
| **Styles** | `display: none;` |
| **Nested Elements** | W-98, W-107, W-109 |

---

###### W-98: Dev File Explorer (Lines 4707-4829)
| Property | Value |
|----------|-------|
| **Line** | 4707 |
| **HTML ID/Class** | `#dev-file-explorer` `.dev-file-explorer` |
| **Description** | File browser in dev panel |
| **Contains** | Header, navigation buttons, file tree |

###### W-99: Dev File Tree
| Property | Value |
|----------|-------|
| **Line** | 4759-4803 |
| **HTML ID/Class** | `.dev-file-tree` |
| **Contains** | src folder (expanded), index.js, server.js (active), routes.js, package.json, README.md |

###### W-100: Open Editors Section
| Property | Value |
|----------|-------|
| **Line** | 4804-4828 |
| **HTML ID/Class** | (div) |
| **Description** | Currently open files |
| **Contains** | Header + file items (server.js active, routes.js) |

---

###### W-101: Dev Editor Resizer
| Property | Value |
|----------|-------|
| **Line** | 4832 |
| **HTML ID/Class** | `#resizer-explorer` `.resizer-vertical` |

###### W-102: Dev Editor Area (Lines 4835-4856)
| Property | Value |
|----------|-------|
| **Line** | 4835 |
| **HTML ID/Class** | `#dev-editor-area` `.dev-editor-area` |
| **Nested Elements** | W-103, W-104 |

###### W-103: Editor Tabs
| Property | Value |
|----------|-------|
| **Line** | 4836-4845 |
| **HTML ID/Class** | `.dev-editor-tabs` |
| **Contains** | server.js (active), routes.js tabs with close buttons |

###### W-104: Editor Content
| Property | Value |
|----------|-------|
| **Line** | 4846-4855 |
| **HTML ID/Class** | `.dev-editor-content` |
| **Description** | Code editor with syntax highlighting |
| **Contains** | Line numbers 1-8, Express server code |

---

###### W-105: Terminal Resizer
| Property | Value |
|----------|-------|
| **Line** | 4859 |
| **HTML ID/Class** | `#resizer-terminal` `.resizer-vertical` |

###### W-106: Dev Terminal Area (Lines 4862-4913)
| Property | Value |
|----------|-------|
| **Line** | 4862 |
| **HTML ID/Class** | `#dev-terminal-area` `.dev-terminal-area` |
| **Nested Elements** | W-107, W-108 |

###### W-107: Terminal Tabs
| Property | Value |
|----------|-------|
| **Line** | 4863-4892 |
| **HTML ID/Class** | `.dev-terminal-tabs` |
| **Contains** | Terminal (active), Output, Problems tabs + add button |

###### W-108: Terminal Content
| Property | Value |
|----------|-------|
| **Line** | 4893-4912 |
| **HTML ID/Class** | `.dev-terminal-content` |
| **Description** | Terminal output |
| **Contains** | npm run dev command, server start messages, cursor |

---

##### W-109: Docker Tab Content (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 4917 |
| **HTML ID/Class** | `#tab-docker-content` `.llm-dev-content` |
| **Styles** | `display: none;` |
| **Contains** | Refresh/Start buttons, container grid (postgres, redis) |

##### W-110: Logs Tab Content (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 4947 |
| **HTML ID/Class** | `#tab-logs-content` `.llm-dev-content` |
| **Styles** | `display: none;` |
| **Contains** | Server logs with timestamps |

##### W-111: Project Context Tab Content (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 4959 |
| **HTML ID/Class** | `#tab-prompt-content` `.llm-dev-content` |
| **Styles** | `display: none;` |
| **Contains** | Model info, Project Context, Agents, MCP Servers, Regenerate button |

---

# PART 2: MODALS

## SECTION 1: MODEL NOTIFICATION MODAL (Lines 5106-5119)

### M-01: Model Notification Overlay
| Property | Value |
|----------|-------|
| **Line** | 5106 |
| **HTML ID/Class** | `#model-notification-overlay` `.model-notification-overlay` |
| **Description** | Background overlay |
| **Event** | `onclick="hideModelNotification()"` |

### M-02: Model Notification Modal
| Property | Value |
|----------|-------|
| **Line** | 5107 |
| **HTML ID/Class** | `#model-notification` `.model-notification` |
| **Description** | Model change confirmation dialog |
| **Nested Elements** | M-03 through M-08 |

#### M-03: Notification Header
| Property | Value |
|----------|-------|
| **Line** | 5108-5111 |
| **HTML ID/Class** | `.model-notification-header` |
| **Nested Elements** | M-04, M-05 |

##### M-04: Notification Icon
| Property | Value |
|----------|-------|
| **Line** | 5109 |
| **HTML ID/Class** | `#model-notification-icon` `.model-notification-icon` |
| **Content** | "🔶" |
| **Styles** | `background: rgba(249, 115, 22, 0.2);` |

##### M-05: Notification Title
| Property | Value |
|----------|-------|
| **Line** | 5110 |
| **HTML ID/Class** | `#model-notification-title` `.model-notification-title` |
| **Content** | "Using OpenRouter API Key" |

#### M-06: Notification Body
| Property | Value |
|----------|-------|
| **Line** | 5112-5114 |
| **HTML ID/Class** | `#model-notification-body` `.model-notification-body` |
| **Content** | "You're selecting a model that will use your OpenRouter API key." |

#### M-07: Notification Actions
| Property | Value |
|----------|-------|
| **Line** | 5115-5118 |
| **HTML ID/Class** | `.model-notification-actions` |
| **Nested Elements** | M-08, M-09 |

##### M-08: Cancel Button
| Property | Value |
|----------|-------|
| **Line** | 5116 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Event** | `onclick="hideModelNotification()"` |
| **Content** | "Cancel" |

##### M-09: Confirm Button
| Property | Value |
|----------|-------|
| **Line** | 5117 |
| **HTML ID/Class** | `#model-notification-confirm` `.btn.btn-primary` |
| **Content** | "Confirm" |

---

## SECTION 2: AGENT MODAL (Lines 5122-5195)

### M-10: Agent Modal Overlay
| Property | Value |
|----------|-------|
| **Line** | 5122 |
| **HTML ID/Class** | `#agent-modal-overlay` `.modal-overlay` |
| **Event** | `onclick="hideAgentModal()"` |

### M-11: Agent Modal
| Property | Value |
|----------|-------|
| **Line** | 5123 |
| **HTML ID/Class** | `#agent-modal` `.modal` |
| **Description** | Create/Edit agent dialog |
| **Nested Elements** | M-12 through M-41 |

#### M-12: Agent Modal Header
| Property | Value |
|----------|-------|
| **Line** | 5124-5127 |
| **HTML ID/Class** | `.modal-header` |
| **Nested Elements** | M-13, M-14 |

##### M-13: Agent Modal Title
| Property | Value |
|----------|-------|
| **Line** | 5125 |
| **HTML ID/Class** | `#agent-modal-title` (h3) |
| **Content** | "Create New Agent" |

##### M-14: Agent Modal Close
| Property | Value |
|----------|-------|
| **Line** | 5126 |
| **HTML ID/Class** | `.modal-close` |
| **Event** | `onclick="hideAgentModal()"` |
| **Content** | "✕" |

#### M-15: Agent Modal Body
| Property | Value |
|----------|-------|
| **Line** | 5128-5188 |
| **HTML ID/Class** | `.modal-body` |
| **Nested Elements** | M-16 through M-35 |

---

##### M-16: Agent Name Field
| Property | Value |
|----------|-------|
| **Line** | 5129-5136 |
| **HTML ID/Class** | (div) |
| **Nested Elements** | M-17, M-18, M-19 |

###### M-17: Agent Name Label
| Property | Value |
|----------|-------|
| **Line** | 5130 |
| **HTML ID/Class** | (label) |
| **Content** | "Agent Name" |

###### M-18: Agent Name Input
| Property | Value |
|----------|-------|
| **Line** | 5133 |
| **HTML ID/Class** | `#agent-name` `.model-select` (input type="text") |
| **Placeholder** | "e.g. api-designer" |

###### M-19: Agent Name Help
| Property | Value |
|----------|-------|
| **Line** | 5135 |
| **HTML ID/Class** | (div) |
| **Content** | "Invoke with @agent-name in chat" |

---

##### M-20: Agent Icon Field
| Property | Value |
|----------|-------|
| **Line** | 5138-5150 |
| **HTML ID/Class** | (div) |
| **Nested Elements** | M-21, M-22 through M-29 |

###### M-21: Icon Label
| Property | Value |
|----------|-------|
| **Line** | 5139 |
| **HTML ID/Class** | (label) |
| **Content** | "Icon" |

###### M-22: Icon Picker 🔧 (Selected)
| Property | Value |
|----------|-------|
| **Line** | 5141 |
| **HTML ID/Class** | `.icon-picker.selected` |
| **Event** | `onclick="selectAgentIcon(this, '🔧')"` |
| **Styles** | `border: 2px solid var(--primary);` |

###### M-23-M-29: Icon Pickers (📋, 🔒, 🧪, 📝, 🗄️, 🎨, ⚡)
| Property | Value |
|----------|-------|
| **Lines** | 5142-5148 |
| **HTML ID/Class** | `.icon-picker` |
| **Event** | `onclick="selectAgentIcon(this, 'emoji')"` |

---

##### M-30: Agent Description Field
| Property | Value |
|----------|-------|
| **Line** | 5152-5155 |
| **HTML ID/Class** | (div) |
| **Nested Elements** | M-31, M-32 |

###### M-31: Description Label
| Property | Value |
|----------|-------|
| **Line** | 5153 |
| **HTML ID/Class** | (label) |
| **Content** | "Description" |

###### M-32: Description Input
| Property | Value |
|----------|-------|
| **Line** | 5154 |
| **HTML ID/Class** | `#agent-description` `.model-select` (input type="text") |
| **Placeholder** | "e.g. Designs REST API endpoints following best practices" |

---

##### M-33: Model/Tools Grid
| Property | Value |
|----------|-------|
| **Line** | 5157-5174 |
| **HTML ID/Class** | (inline styled div) |
| **Styles** | `display: grid; grid-template-columns: 1fr 1fr;` |
| **Nested Elements** | M-34, M-36 |

###### M-34: Model Field
| Property | Value |
|----------|-------|
| **Line** | 5158-5165 |
| **HTML ID/Class** | (div) |
| **Nested Elements** | M-35 |

###### M-35: Model Select
| Property | Value |
|----------|-------|
| **Line** | 5160-5164 |
| **HTML ID/Class** | `#agent-model` `.model-select` (select) |
| **Options** | Claude Sonnet 4.5 (Fast), Claude Opus 4.5 (Powerful), Claude Haiku 4.5 (Quick) |

###### M-36: Tools Field
| Property | Value |
|----------|-------|
| **Line** | 5166-5173 |
| **HTML ID/Class** | (div) |
| **Nested Elements** | M-37 |

###### M-37: Tools Select
| Property | Value |
|----------|-------|
| **Line** | 5168-5172 |
| **HTML ID/Class** | `#agent-tools` `.model-select` (select) |
| **Options** | Read-only (safer), All tools (can edit files), No tools (chat only) |

---

##### M-38: System Prompt Field
| Property | Value |
|----------|-------|
| **Line** | 5176-5181 |
| **HTML ID/Class** | (div) |
| **Nested Elements** | M-39, M-40 |

###### M-39: Prompt Label
| Property | Value |
|----------|-------|
| **Line** | 5177 |
| **HTML ID/Class** | (label) |
| **Content** | "System Prompt (Optional)" |

###### M-40: Prompt Textarea
| Property | Value |
|----------|-------|
| **Line** | 5178-5180 |
| **HTML ID/Class** | `#agent-prompt` `.model-select` (textarea) |
| **Styles** | `min-height: 100px;` |
| **Placeholder** | Custom instructions example |

##### M-41: Tip Box
| Property | Value |
|----------|-------|
| **Line** | 5183-5187 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Blue info box about auto-conversion |
| **Styles** | `background: rgba(59, 130, 246, 0.1);` |

---

#### M-42: Agent Modal Footer
| Property | Value |
|----------|-------|
| **Line** | 5189-5194 |
| **HTML ID/Class** | `.modal-footer` |
| **Nested Elements** | M-43, M-44 |

##### M-43: Cancel Button
| Property | Value |
|----------|-------|
| **Line** | 5190 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Event** | `onclick="hideAgentModal()"` |
| **Content** | "Cancel" |

##### M-44: Save Button
| Property | Value |
|----------|-------|
| **Line** | 5191-5193 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Event** | `onclick="saveAgent()"` |
| **Contains** | `#agent-save-text` span ("Create Agent") |

---

## SECTION 3: SKILL MODAL (Lines 5198-5260)

### M-45: Skill Modal Overlay
| Property | Value |
|----------|-------|
| **Line** | 5198 |
| **HTML ID/Class** | `#skill-modal-overlay` `.modal-overlay` |
| **Event** | `onclick="hideSkillModal()"` |

### M-46: Skill Modal
| Property | Value |
|----------|-------|
| **Line** | 5199 |
| **HTML ID/Class** | `#skill-modal` `.modal` |
| **Description** | Create/Edit skill dialog |
| **Nested Elements** | M-47 through M-68 |

#### M-47: Skill Modal Header
| Property | Value |
|----------|-------|
| **Line** | 5200-5203 |
| **HTML ID/Class** | `.modal-header` |
| **Nested Elements** | M-48, M-49 |

##### M-48: Skill Modal Title
| Property | Value |
|----------|-------|
| **Line** | 5201 |
| **HTML ID/Class** | `#skill-modal-title` (h3) |
| **Content** | "Create New Skill" |

##### M-49: Skill Modal Close
| Property | Value |
|----------|-------|
| **Line** | 5202 |
| **HTML ID/Class** | `.modal-close` |
| **Event** | `onclick="hideSkillModal()"` |

#### M-50: Skill Modal Body
| Property | Value |
|----------|-------|
| **Line** | 5204-5253 |
| **HTML ID/Class** | `.modal-body` |
| **Nested Elements** | M-51 through M-65 |

---

##### M-51: Skill Name Field
| Property | Value |
|----------|-------|
| **Line** | 5205-5212 |
| **HTML ID/Class** | (div) |
| **Nested Elements** | M-52, M-53 |

###### M-52: Skill Name Input
| Property | Value |
|----------|-------|
| **Line** | 5209 |
| **HTML ID/Class** | `#skill-name` `.model-select` (input type="text") |
| **Placeholder** | "e.g. doc-generator" |

###### M-53: Skill Name Help
| Property | Value |
|----------|-------|
| **Line** | 5211 |
| **HTML ID/Class** | (div) |
| **Content** | "Invoke with $skill-name or automatically when relevant" |

---

##### M-54: Skill Icon Field
| Property | Value |
|----------|-------|
| **Line** | 5214-5224 |
| **HTML ID/Class** | (div) |
| **Contains** | 6 icon picker buttons (📝 selected, 📊, 🎨, 🔧, 📦, 🧪) |

---

##### M-55: Skill Description Field
| Property | Value |
|----------|-------|
| **Line** | 5226-5229 |
| **HTML ID/Class** | (div) |

###### M-56: Skill Description Input
| Property | Value |
|----------|-------|
| **Line** | 5228 |
| **HTML ID/Class** | `#skill-description` `.model-select` (input type="text") |
| **Placeholder** | "e.g. Generates documentation from code including README and API docs" |

---

##### M-57: Skill Content Field
| Property | Value |
|----------|-------|
| **Line** | 5231-5246 |
| **HTML ID/Class** | (div) |

###### M-58: Skill Content Textarea
| Property | Value |
|----------|-------|
| **Line** | 5233-5245 |
| **HTML ID/Class** | `#skill-content` `.model-select` (textarea) |
| **Description** | SKILL.md content editor |
| **Styles** | `min-height: 150px; font-family: Monaco, Consolas, monospace;` |
| **Placeholder** | Example SKILL.md template |

##### M-59: Skill Tip Box
| Property | Value |
|----------|-------|
| **Line** | 5248-5252 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Blue info box about skill invocation |

---

#### M-60: Skill Modal Footer
| Property | Value |
|----------|-------|
| **Line** | 5254-5259 |
| **HTML ID/Class** | `.modal-footer` |
| **Nested Elements** | M-61, M-62 |

##### M-61: Cancel Button
| Property | Value |
|----------|-------|
| **Line** | 5255 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Event** | `onclick="hideSkillModal()"` |

##### M-62: Save Button
| Property | Value |
|----------|-------|
| **Line** | 5256-5258 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Event** | `onclick="saveSkill()"` |
| **Contains** | `#skill-save-text` span ("Create Skill") |

---

## SECTION 4: MCP SERVER MODAL (Lines 5263-5389)

### M-63: MCP Modal Overlay
| Property | Value |
|----------|-------|
| **Line** | 5263 |
| **HTML ID/Class** | `#mcp-modal-overlay` `.modal-overlay` |
| **Event** | `onclick="hideMCPModal()"` |

### M-64: MCP Modal
| Property | Value |
|----------|-------|
| **Line** | 5264 |
| **HTML ID/Class** | `#mcp-modal` `.modal` |
| **Description** | Add MCP Server dialog |
| **Nested Elements** | M-65 through M-115 |

#### M-65: MCP Modal Header
| Property | Value |
|----------|-------|
| **Line** | 5265-5268 |
| **HTML ID/Class** | `.modal-header` |
| **Nested Elements** | M-66, M-67 |

##### M-66: MCP Modal Title
| Property | Value |
|----------|-------|
| **Line** | 5266 |
| **HTML ID/Class** | `#mcp-modal-title` (h3) |
| **Content** | "Add MCP Server" |

##### M-67: MCP Modal Close
| Property | Value |
|----------|-------|
| **Line** | 5267 |
| **HTML ID/Class** | `.modal-close` |
| **Event** | `onclick="hideMCPModal()"` |

#### M-68: MCP Modal Body
| Property | Value |
|----------|-------|
| **Line** | 5269-5378 |
| **HTML ID/Class** | `.modal-body` |
| **Nested Elements** | M-69 through M-108 |

---

##### M-69: Server Type Selection
| Property | Value |
|----------|-------|
| **Line** | 5271-5303 |
| **HTML ID/Class** | (div) |
| **Nested Elements** | M-70, M-71, M-72 |

###### M-70: Database Type Option (Selected)
| Property | Value |
|----------|-------|
| **Line** | 5274-5283 |
| **HTML ID/Class** | `.mcp-type-option.selected` |
| **Event** | `onclick="selectMCPType(this, 'database')"` |
| **Content** | Database SVG icon + "Database" |
| **Styles** | `border: 2px solid var(--primary);` |

###### M-71: API/Service Type Option
| Property | Value |
|----------|-------|
| **Line** | 5284-5292 |
| **HTML ID/Class** | `.mcp-type-option` |
| **Event** | `onclick="selectMCPType(this, 'api')"` |
| **Content** | Link SVG icon + "API/Service" |

###### M-72: Custom Type Option
| Property | Value |
|----------|-------|
| **Line** | 5293-5301 |
| **HTML ID/Class** | `.mcp-type-option` |
| **Event** | `onclick="selectMCPType(this, 'custom')"` |
| **Content** | Gear SVG icon + "Custom" |

---

##### M-73: Database Options (Visible)
| Property | Value |
|----------|-------|
| **Line** | 5306-5336 |
| **HTML ID/Class** | `#mcp-database-options` |
| **Nested Elements** | M-74 through M-81 |

###### M-74: Database Type Select
| Property | Value |
|----------|-------|
| **Line** | 5309-5315 |
| **HTML ID/Class** | `#mcp-db-type` `.model-select` (select) |
| **Event** | `onchange="updateMCPIcon()"` |
| **Options** | 🐘 PostgreSQL, 🐬 MySQL, 🍃 MongoDB, 🔴 Redis, 📦 SQLite |

###### M-75: Connection String Input
| Property | Value |
|----------|-------|
| **Line** | 5320 |
| **HTML ID/Class** | `#mcp-connection` `.model-select` (input type="text") |
| **Placeholder** | "postgresql://user:password@localhost:5432/dbname" |
| **Styles** | `font-family: Monaco, Consolas, monospace;` |

###### M-76: Name/Access Grid
| Property | Value |
|----------|-------|
| **Line** | 5323-5335 |
| **HTML ID/Class** | (inline styled div) |
| **Styles** | `display: grid; grid-template-columns: 1fr 1fr;` |

###### M-77: Display Name Input
| Property | Value |
|----------|-------|
| **Line** | 5326 |
| **HTML ID/Class** | `#mcp-name` `.model-select` (input type="text") |
| **Placeholder** | "e.g. Production DB" |

###### M-78: Access Level Select
| Property | Value |
|----------|-------|
| **Line** | 5330-5333 |
| **HTML ID/Class** | `#mcp-access` `.model-select` (select) |
| **Options** | Read-only (safer), Read & Write |

---

##### M-79: API/Service Options (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 5339-5356 |
| **HTML ID/Class** | `#mcp-api-options` |
| **Styles** | `display: none;` |
| **Nested Elements** | M-80 through M-83 |

###### M-80: Service Select
| Property | Value |
|----------|-------|
| **Line** | 5342-5349 |
| **HTML ID/Class** | `#mcp-service` `.model-select` (select) |
| **Options** | 🐙 GitHub, 💬 Slack, 📁 Google Drive, 📓 Notion, 📋 Jira, 📐 Linear |

###### M-81: API Token Input
| Property | Value |
|----------|-------|
| **Line** | 5353 |
| **HTML ID/Class** | `#mcp-token` `.model-select` (input type="password") |
| **Placeholder** | "Enter API token or click Connect to OAuth" |

###### M-82: OAuth Connect Button
| Property | Value |
|----------|-------|
| **Line** | 5354 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Content** | "🔗 Connect with OAuth" |

---

##### M-83: Custom Options (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 5359-5372 |
| **HTML ID/Class** | `#mcp-custom-options` |
| **Styles** | `display: none;` |
| **Nested Elements** | M-84 through M-87 |

###### M-84: Server Command Input
| Property | Value |
|----------|-------|
| **Line** | 5362 |
| **HTML ID/Class** | `#mcp-command` `.model-select` (input type="text") |
| **Placeholder** | "npx @modelcontextprotocol/server-filesystem" |

###### M-85: Arguments Textarea
| Property | Value |
|----------|-------|
| **Line** | 5366 |
| **HTML ID/Class** | `#mcp-args` `.model-select` (textarea) |
| **Placeholder** | '["--directory", "/path/to/files"]' |
| **Styles** | `min-height: 80px; font-family: Monaco, Consolas, monospace;` |

###### M-86: Custom Name Input
| Property | Value |
|----------|-------|
| **Line** | 5370 |
| **HTML ID/Class** | `#mcp-custom-name` `.model-select` (input type="text") |
| **Placeholder** | "e.g. File System Access" |

---

##### M-87: Security Warning Box
| Property | Value |
|----------|-------|
| **Line** | 5374-5378 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Orange warning box |
| **Styles** | `background: rgba(249, 115, 22, 0.1); border: 1px solid var(--accent);` |
| **Content** | "⚠️ Security Note: MCP servers have direct access to your data..." |

---

#### M-88: MCP Modal Footer
| Property | Value |
|----------|-------|
| **Line** | 5380-5388 |
| **HTML ID/Class** | `.modal-footer` |
| **Nested Elements** | M-89, M-90, M-91 |

##### M-89: Cancel Button
| Property | Value |
|----------|-------|
| **Line** | 5381 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Event** | `onclick="hideMCPModal()"` |
| **Content** | "Cancel" |

##### M-90: Test Connection Button
| Property | Value |
|----------|-------|
| **Line** | 5383 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Event** | `onclick="testMCPConnection()"` |
| **Content** | "⚡ Test Connection" |

##### M-91: Save Button
| Property | Value |
|----------|-------|
| **Line** | 5384-5386 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Event** | `onclick="saveMCP()"` |
| **Contains** | `#mcp-save-text` span ("Add Server") |

---

## ELEMENT SUMMARY

### Workspace View Element Counts
| Section | Elements |
|---------|----------|
| Container | 2 |
| Top Bar | 28 |
| Icon Sidebar | 7 |
| File Explorer | 14 |
| Chat Panel | 14 |
| Preview Panel | 17 |
| LLM-Dev Panel | 26 |
| Tab Contents | 16 |
| **Workspace Total** | **124** |

### Modals Element Counts
| Modal | Elements |
|-------|----------|
| Model Notification | 9 |
| Agent Modal | 35 |
| Skill Modal | 18 |
| MCP Server Modal | 29 |
| **Modals Total** | **91** |

### **GRAND TOTAL: 215 Elements**

---

## INTERACTION MAP

### Workspace View Navigation
| Element ID | Event Handler | Target |
|------------|---------------|--------|
| W-26 | `showView('settings')` | Settings View |
| W-35 | `showView('create-project')` | Create Project View |
| W-37 | `showView('settings')` | Settings View |
| W-42 | `showView('create-project')` | Create Project View |

### Workspace Toggle Events
| Element ID | Event Handler | Target |
|------------|---------------|--------|
| W-08 | `toggleConnection()` | Connection status |
| W-10 | `toggleHeader()` | Top bar visibility |
| W-11 | `toggleModelDropdown()` | Model dropdown |
| W-32 | `toggleFileExplorer()` | File explorer panel |
| W-43 | `toggleFileExplorer()` | File explorer panel |
| W-45 | `toggleTreeItem(this)` | Folder expand/collapse |
| W-65 | `toggleMic(this)` | Voice input |
| W-70 | `togglePreview()` | Preview panel |
| W-88 | `toggleDevPanel()` | LLM-Dev panel |

### Dev Panel Tab Events
| Element ID | Event Handler | Tab |
|------------|---------------|-----|
| W-92 | `showDevTab('terminal')` | Terminal |
| W-93 | `showDevTab('docker')` | Docker |
| W-94 | `showDevTab('logs')` | Logs |
| W-95 | `showDevTab('prompt')` | Project Context |

### Modal Events
| Element ID | Event Handler | Action |
|------------|---------------|--------|
| M-01 | `hideModelNotification()` | Close overlay |
| M-08 | `hideModelNotification()` | Cancel |
| M-10 | `hideAgentModal()` | Close overlay |
| M-14 | `hideAgentModal()` | Close modal |
| M-43 | `hideAgentModal()` | Cancel |
| M-44 | `saveAgent()` | Save agent |
| M-45 | `hideSkillModal()` | Close overlay |
| M-49 | `hideSkillModal()` | Close modal |
| M-61 | `hideSkillModal()` | Cancel |
| M-62 | `saveSkill()` | Save skill |
| M-63 | `hideMCPModal()` | Close overlay |
| M-67 | `hideMCPModal()` | Close modal |
| M-89 | `hideMCPModal()` | Cancel |
| M-90 | `testMCPConnection()` | Test connection |
| M-91 | `saveMCP()` | Save server |

---

## FORM ELEMENTS

### Workspace Text Inputs
| Element ID | Type | Placeholder |
|------------|------|-------------|
| W-64 | text | "Ask Claude to build something..." |

### Modal Text Inputs
| Element ID | Type | Placeholder |
|------------|------|-------------|
| M-18 | text | "e.g. api-designer" |
| M-32 | text | "e.g. Designs REST API endpoints..." |
| M-40 | textarea | Custom instructions example |
| M-52 | text | "e.g. doc-generator" |
| M-56 | text | "e.g. Generates documentation..." |
| M-58 | textarea | SKILL.md template |
| M-75 | text | "postgresql://..." |
| M-77 | text | "e.g. Production DB" |
| M-81 | password | "Enter API token..." |
| M-84 | text | "npx @modelcontextprotocol/..." |
| M-85 | textarea | JSON arguments |
| M-86 | text | "e.g. File System Access" |

### Modal Select Dropdowns
| Element ID | Options Count |
|------------|---------------|
| M-35 | 3 (Claude models) |
| M-37 | 3 (Tools access) |
| M-74 | 5 (Database types) |
| M-78 | 2 (Access levels) |
| M-80 | 6 (API services) |

### Hidden/Conditional Elements
| Element ID | Condition |
|------------|-----------|
| W-97 | Dev panel collapsed |
| W-109 | Docker tab not active |
| W-110 | Logs tab not active |
| W-111 | Project Context tab not active |
| M-79 | API type not selected |
| M-83 | Custom type not selected |

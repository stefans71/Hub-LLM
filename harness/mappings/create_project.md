# HubLLM UI Element Mapping: Create Project View

## Document Info
- **Source File**: hubllm-mockup-v2.html
- **Scope**: Lines 3687-4366
- **Total Elements Mapped**: 203

---

## CREATE PROJECT STEPS INDEX

| # | Step | Lines | Elements | Key Features |
|---|------|-------|----------|--------------|
| 1 | Project Details | 3697-3877 | 62 | Workspace, name, brief, AI chat assistant |
| 2 | Connection Source | 3880-4049 | 52 | GitHub cloud (recommended), VPS option |
| 3 | Project Context | 4053-4109 | 18 | Tech stack, standards, commands |
| 4 | Project Agents | 4112-4227 | 32 | Global agents, project-specific |
| 5 | MCP Servers | 4230-4350 | 33 | Global MCP, project-specific |
| - | Action Bar | 4356-4364 | 6 | Cancel, Create Project buttons |

---

## SECTION 1: CREATE PROJECT VIEW CONTAINER (Lines 3687-3691)

### CP-01: Create Project View Container
| Property | Value |
|----------|-------|
| **Line** | 3687 |
| **HTML ID/Class** | `#view-create-project` `.view` |
| **Description** | Root container for Create Project view |
| **Nested Elements** | CP-02 |

### CP-02: View Inner Container
| Property | Value |
|----------|-------|
| **Line** | 3688 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Full-height flex container |
| **Styles** | `background: var(--bg-primary); height: calc(100vh - 44px); display: flex; flex-direction: column;` |
| **Nested Elements** | CP-03, CP-198 |

### CP-03: Scrollable Content Area
| Property | Value |
|----------|-------|
| **Line** | 3690 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Scrollable area for all steps |
| **Styles** | `flex: 1; overflow-y: auto; padding: 24px;` |
| **Nested Elements** | CP-04 |

### CP-04: Content Max-Width Container
| Property | Value |
|----------|-------|
| **Line** | 3691 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Centered content container |
| **Styles** | `max-width: 720px; margin: 0 auto;` |
| **Nested Elements** | CP-05, CP-06, and all steps |

### CP-05: Page Title
| Property | Value |
|----------|-------|
| **Line** | 3693 |
| **HTML ID/Class** | (h1) |
| **Description** | Main page heading |
| **Content** | "Create New Project" |
| **Styles** | `font-size: 28px; font-weight: 700;` |

### CP-06: Page Subtitle
| Property | Value |
|----------|-------|
| **Line** | 3694 |
| **HTML ID/Class** | (p) |
| **Description** | Page description |
| **Content** | "Follow the steps to configure your environment and AI models." |

---

## SECTION 2: STEP 1 - PROJECT DETAILS (Lines 3697-3877)

### CP-07: Step 1 Panel
| Property | Value |
|----------|-------|
| **Line** | 3697 |
| **HTML ID/Class** | `.settings-panel` |
| **Description** | Step 1 container panel |
| **Nested Elements** | CP-08 through CP-62 |

### CP-08: Step 1 Header Container
| Property | Value |
|----------|-------|
| **Line** | 3698 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with step number and title |
| **Nested Elements** | CP-09, CP-10 |

#### CP-09: Step 1 Number Badge
| Property | Value |
|----------|-------|
| **Line** | 3699 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Circular step number indicator |
| **Content** | "1" |
| **Styles** | `width: 28px; height: 28px; background: var(--primary); border-radius: 50%;` |

#### CP-10: Step 1 Title
| Property | Value |
|----------|-------|
| **Line** | 3700 |
| **HTML ID/Class** | (h2) |
| **Description** | Step heading |
| **Content** | "Project Details" |
| **Styles** | `font-size: 18px; font-weight: 600;` |

---

### CP-11: Form Grid Container
| Property | Value |
|----------|-------|
| **Line** | 3703 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Two-column grid for workspace and name |
| **Styles** | `display: grid; grid-template-columns: 1fr 1fr; gap: 16px;` |
| **Nested Elements** | CP-12, CP-16 |

#### CP-12: Workspace Field Container
| Property | Value |
|----------|-------|
| **Line** | 3704 |
| **HTML ID/Class** | (div) |
| **Description** | Workspace selection field |
| **Nested Elements** | CP-13, CP-14 |

##### CP-13: Workspace Label
| Property | Value |
|----------|-------|
| **Line** | 3705 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "Workspace" |

##### CP-14: Workspace Select
| Property | Value |
|----------|-------|
| **Line** | 3706-3710 |
| **HTML ID/Class** | `.model-select` (select) |
| **Description** | Workspace dropdown |
| **Options** | Customers, Personal, ➕ Create New Workspace... |

#### CP-15: Project Name Field Container
| Property | Value |
|----------|-------|
| **Line** | 3712 |
| **HTML ID/Class** | (div) |
| **Description** | Project name field |
| **Nested Elements** | CP-16, CP-17 |

##### CP-16: Project Name Label
| Property | Value |
|----------|-------|
| **Line** | 3713 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "Project Name" |

##### CP-17: Project Name Input
| Property | Value |
|----------|-------|
| **Line** | 3714 |
| **HTML ID/Class** | `.model-select` (input type="text") |
| **Description** | Text input for project name |
| **Placeholder** | "e.g. Family Calendar App" |

---

### CP-18: Project Brief Section
| Property | Value |
|----------|-------|
| **Line** | 3719 |
| **HTML ID/Class** | (div) |
| **Description** | Project brief input section |
| **Nested Elements** | CP-19 through CP-62 |

#### CP-19: Brief Header Container
| Property | Value |
|----------|-------|
| **Line** | 3720 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with label and upload link |
| **Nested Elements** | CP-20, CP-21 |

##### CP-20: Brief Label
| Property | Value |
|----------|-------|
| **Line** | 3721 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "Project Brief" |

##### CP-21: Upload Container
| Property | Value |
|----------|-------|
| **Line** | 3722-3727 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | File upload trigger |
| **Nested Elements** | CP-22, CP-23 |

###### CP-22: Upload Label/Link
| Property | Value |
|----------|-------|
| **Line** | 3723-3725 |
| **HTML ID/Class** | (label for="brief-file-upload") |
| **Description** | Clickable upload trigger |
| **Content** | "📄 Upload .md file" |

###### CP-23: File Upload Input (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 3726 |
| **HTML ID/Class** | `#brief-file-upload` (input type="file") |
| **Description** | Hidden file input |
| **Accepts** | .md, .txt |
| **Event** | `onchange="handleBriefUpload(this)"` |
| **Styles** | `display: none;` |

#### CP-24: Project Brief Textarea
| Property | Value |
|----------|-------|
| **Line** | 3730-3736 |
| **HTML ID/Class** | `#project-brief` `.model-select` (textarea) |
| **Description** | Multi-line project description input |
| **Placeholder** | "Describe what you want to build in plain language..." (with examples) |
| **Styles** | `min-height: 100px; resize: vertical;` |

---

### CP-25: Define AI Button Container
| Property | Value |
|----------|-------|
| **Line** | 3739 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Container for AI define button |
| **Nested Elements** | CP-26 |

#### CP-26: Define Project with AI Button
| Property | Value |
|----------|-------|
| **Line** | 3740-3745 |
| **HTML ID/Class** | `.define-ai-btn` |
| **Description** | Primary action button to start AI chat |
| **Content** | "Define Project with AI" |
| **Event** | `onclick="startProjectDefinition()"` |
| **Styles** | `background: linear-gradient(135deg, #D97757 0%, #C4694A 100%);` |
| **Contains** | Star SVG icon (CP-27) |

##### CP-27: Define AI Star Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 3741-3743 |
| **HTML ID/Class** | (svg) |
| **Description** | Star icon |
| **Size** | 16x16 |
| **Fill** | currentColor |

---

### CP-28: AI Brief Chat Container (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 3749 |
| **HTML ID/Class** | `#ai-brief-chat` |
| **Description** | Collapsible AI chat panel |
| **Styles** | `display: none;` |
| **Nested Elements** | CP-29 through CP-62 |

---

#### CP-29: Chat Header
| Property | Value |
|----------|-------|
| **Line** | 3751 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Chat header bar |
| **Styles** | `background: var(--bg-tertiary); border-bottom: 1px solid var(--border);` |
| **Nested Elements** | CP-30 through CP-38 |

##### CP-30: Chat Header Left
| Property | Value |
|----------|-------|
| **Line** | 3752 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Left side with icon and title |
| **Nested Elements** | CP-31, CP-34 |

###### CP-31: Chat Icon Container
| Property | Value |
|----------|-------|
| **Line** | 3753-3757 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Gradient icon container |
| **Styles** | `background: linear-gradient(135deg, #D97757 0%, #C4694A 100%);` |
| **Contains** | Star SVG (CP-32) |

###### CP-32: Chat Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 3754-3756 |
| **HTML ID/Class** | (svg) |
| **Description** | Star icon |
| **Size** | 18x18 |

###### CP-33: Chat Title Container
| Property | Value |
|----------|-------|
| **Line** | 3758 |
| **HTML ID/Class** | (div) |
| **Description** | Title and subtitle |
| **Nested Elements** | CP-34, CP-35 |

###### CP-34: Chat Title
| Property | Value |
|----------|-------|
| **Line** | 3759 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Assistant name |
| **Content** | "Project Definition Assistant" |

###### CP-35: Chat Subtitle
| Property | Value |
|----------|-------|
| **Line** | 3760 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Status text |
| **Content** | "Claude is helping define your project" |

##### CP-36: Chat Header Right
| Property | Value |
|----------|-------|
| **Line** | 3763 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Right side with status and close |
| **Nested Elements** | CP-37, CP-38 |

###### CP-37: Active Status Indicator
| Property | Value |
|----------|-------|
| **Line** | 3764-3767 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Green active status |
| **Content** | "Active" with green dot |

###### CP-38: Close Chat Button
| Property | Value |
|----------|-------|
| **Line** | 3768-3773 |
| **HTML ID/Class** | (button) |
| **Description** | X button to collapse chat |
| **Event** | `onclick="collapseAIChat()"` |
| **Contains** | X SVG icon |

---

#### CP-39: Chat Messages Area
| Property | Value |
|----------|-------|
| **Line** | 3778 |
| **HTML ID/Class** | `#brief-chat-messages` |
| **Description** | Scrollable messages container |
| **Styles** | `height: 280px; overflow-y: auto;` |
| **Nested Elements** | CP-40, CP-45, CP-47 |

##### CP-40: AI Initial Message
| Property | Value |
|----------|-------|
| **Line** | 3780-3795 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | First AI message with questions |
| **Nested Elements** | CP-41, CP-42 |

###### CP-41: AI Message Avatar
| Property | Value |
|----------|-------|
| **Line** | 3781-3785 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Small gradient avatar with star |
| **Styles** | `width: 28px; height: 28px; background: linear-gradient(...);` |

###### CP-42: AI Message Content
| Property | Value |
|----------|-------|
| **Line** | 3786-3794 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Message bubble with intro and questions |
| **Styles** | `background: var(--bg-tertiary); border-radius: 8px;` |
| **Content** | Intro text + numbered questions list |

##### CP-43: User Response Message
| Property | Value |
|----------|-------|
| **Line** | 3798-3802 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | User's response bubble (right-aligned) |
| **Content** | "5 family members. Yes to shared events and reminders..." |
| **Styles** | `background: var(--primary); color: white;` |

##### CP-44: AI Follow-up Message
| Property | Value |
|----------|-------|
| **Line** | 3805-3824 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | AI follow-up with project summary |
| **Nested Elements** | CP-45, CP-46 |

###### CP-45: AI Follow-up Avatar
| Property | Value |
|----------|-------|
| **Line** | 3806-3810 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Small gradient avatar |

###### CP-46: AI Follow-up Content
| Property | Value |
|----------|-------|
| **Line** | 3811-3823 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Message with project summary card |
| **Contains** | Summary box with bullet points |

---

#### CP-47: Chat Input Section
| Property | Value |
|----------|-------|
| **Line** | 3828 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Input area with controls |
| **Styles** | `padding: 12px 16px; border-top: 1px solid var(--border);` |
| **Nested Elements** | CP-48 through CP-58 |

##### CP-48: Input Row Container
| Property | Value |
|----------|-------|
| **Line** | 3829 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Flex row with inputs |
| **Nested Elements** | CP-49, CP-51, CP-56 |

###### CP-49: Attach File Button
| Property | Value |
|----------|-------|
| **Line** | 3830-3834 |
| **HTML ID/Class** | (button) |
| **Description** | Paperclip button for attachments |
| **Contains** | Paperclip SVG icon |
| **Attribute** | `title="Attach file"` |

###### CP-50: Input Container
| Property | Value |
|----------|-------|
| **Line** | 3835 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Relative container for input + mic |
| **Styles** | `flex: 1; position: relative;` |
| **Nested Elements** | CP-51, CP-52 |

###### CP-51: Chat Text Input
| Property | Value |
|----------|-------|
| **Line** | 3836 |
| **HTML ID/Class** | `#ai-chat-input` `.model-select` (input type="text") |
| **Description** | Text input for messages |
| **Placeholder** | "Ask follow-up questions..." |
| **Event** | `onkeypress="if(event.key==='Enter') sendBriefMessage()"` |

###### CP-52: Voice Input Button
| Property | Value |
|----------|-------|
| **Line** | 3837-3844 |
| **HTML ID/Class** | `#voice-btn` (button) |
| **Description** | Microphone button for voice input |
| **Event** | `onclick="toggleVoiceInput()"` |
| **Contains** | Microphone SVG icon |
| **Attribute** | `title="Voice input"` |

###### CP-53: Send Message Button
| Property | Value |
|----------|-------|
| **Line** | 3846-3851 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Description** | Send button |
| **Event** | `onclick="sendBriefMessage()"` |
| **Contains** | Send/arrow SVG icon |

##### CP-54: Voice Recording Indicator (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 3855-3860 |
| **HTML ID/Class** | `#voice-recording` |
| **Description** | Recording status indicator |
| **Styles** | `display: none;` |
| **Content** | Pulsing red dot + "Recording... Click mic to stop" |

---

#### CP-55: Chat Actions Bar
| Property | Value |
|----------|-------|
| **Line** | 3864 |
| **HTML ID/Class** | `#ai-chat-actions` |
| **Description** | Bottom action buttons |
| **Styles** | `border-top: 1px solid var(--border); background: var(--bg-secondary);` |
| **Nested Elements** | CP-56, CP-57 |

##### CP-56: Generate Project Context Button
| Property | Value |
|----------|-------|
| **Line** | 3865-3870 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Description** | Primary action button |
| **Content** | "Generate Project Context" |
| **Event** | `onclick="generateProjectContext()"` |
| **Styles** | `flex: 1;` |
| **Contains** | Lightning bolt SVG icon |

##### CP-57: Ask More Button
| Property | Value |
|----------|-------|
| **Line** | 3871-3873 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Secondary action button |
| **Content** | "Ask More" |
| **Event** | `onclick="continueConversation()"` |

---

## SECTION 3: STEP 2 - CONNECTION SOURCE (Lines 3880-4049)

### CP-58: Step 2 Panel
| Property | Value |
|----------|-------|
| **Line** | 3880 |
| **HTML ID/Class** | `.settings-panel` |
| **Description** | Step 2 container panel |
| **Nested Elements** | CP-59 through CP-109 |

### CP-59: Step 2 Header Container
| Property | Value |
|----------|-------|
| **Line** | 3881 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with step number and title |
| **Nested Elements** | CP-60, CP-61 |

#### CP-60: Step 2 Number Badge
| Property | Value |
|----------|-------|
| **Line** | 3882 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Circular step number |
| **Content** | "2" |

#### CP-61: Step 2 Title
| Property | Value |
|----------|-------|
| **Line** | 3883 |
| **HTML ID/Class** | (h2) |
| **Description** | Step heading |
| **Content** | "Connection Source" |

---

### CP-62: GitHub Cloud Card (Recommended)
| Property | Value |
|----------|-------|
| **Line** | 3887 |
| **HTML ID/Class** | `#github-card` |
| **Description** | Primary connection option card |
| **Styles** | `background: var(--bg-tertiary); border: 2px solid var(--primary);` |
| **Nested Elements** | CP-63 through CP-93 |

#### CP-63: Recommended Badge
| Property | Value |
|----------|-------|
| **Line** | 3888 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | "RECOMMENDED" badge |
| **Content** | "RECOMMENDED" |
| **Styles** | `position: absolute; top: -10px; background: var(--success);` |

#### CP-64: GitHub Card Header
| Property | Value |
|----------|-------|
| **Line** | 3891 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with icon and title |
| **Nested Elements** | CP-65, CP-67 |

##### CP-65: Cloud Icon Container
| Property | Value |
|----------|-------|
| **Line** | 3892-3896 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Green cloud icon |
| **Styles** | `background: rgba(34, 197, 94, 0.15);` |
| **Contains** | Cloud SVG icon |

##### CP-66: Cloud Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 3893-3895 |
| **HTML ID/Class** | (svg) |
| **Description** | Cloud icon |
| **Size** | 26x26 |
| **Styles** | `color: var(--success);` |

##### CP-67: GitHub Card Title Container
| Property | Value |
|----------|-------|
| **Line** | 3897-3900 |
| **HTML ID/Class** | (div) |
| **Description** | Title and subtitle |
| **Nested Elements** | CP-68, CP-69 |

###### CP-68: GitHub Card Title
| Property | Value |
|----------|-------|
| **Line** | 3898 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Card title |
| **Content** | "Free Cloud Hosting" |

###### CP-69: GitHub Card Subtitle
| Property | Value |
|----------|-------|
| **Line** | 3899 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Subtitle |
| **Content** | "Powered by GitHub" |

#### CP-70: GitHub Card Description
| Property | Value |
|----------|-------|
| **Line** | 3904-3906 |
| **HTML ID/Class** | (p) |
| **Description** | Feature description |
| **Content** | "Get free cloud hosting, storage, and preview environments..." |

#### CP-71: Benefits Container
| Property | Value |
|----------|-------|
| **Line** | 3909 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Benefits list |
| **Nested Elements** | CP-72, CP-73, CP-74 |

##### CP-72: Benefit - Compute
| Property | Value |
|----------|-------|
| **Line** | 3910-3915 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Benefit item |
| **Content** | "60 hrs/mo free compute" |
| **Contains** | Green checkmark SVG |

##### CP-73: Benefit - Storage
| Property | Value |
|----------|-------|
| **Line** | 3916-3921 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Benefit item |
| **Content** | "15GB storage" |
| **Contains** | Green checkmark SVG |

##### CP-74: Benefit - Ownership
| Property | Value |
|----------|-------|
| **Line** | 3922-3927 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Benefit item |
| **Content** | "You own your code" |
| **Contains** | Green checkmark SVG |

---

### CP-75: GitHub Not Connected State
| Property | Value |
|----------|-------|
| **Line** | 3931 |
| **HTML ID/Class** | `#github-not-connected` |
| **Description** | State shown when not signed in |
| **Styles** | `text-align: center;` |
| **Nested Elements** | CP-76, CP-77, CP-78 |

#### CP-76: Sign In With GitHub Button
| Property | Value |
|----------|-------|
| **Line** | 3933-3938 |
| **HTML ID/Class** | `.github-signin-btn` |
| **Description** | GitHub OAuth button |
| **Content** | "Sign in with GitHub" |
| **Event** | `onclick="connectGitHub()"` |
| **Styles** | `background: #24292e;` |
| **Contains** | GitHub logo SVG |

#### CP-77: Or Separator
| Property | Value |
|----------|-------|
| **Line** | 3940 |
| **HTML ID/Class** | (span) |
| **Description** | Text separator |
| **Content** | "or" |

#### CP-78: Create Free Account Link
| Property | Value |
|----------|-------|
| **Line** | 3942-3949 |
| **HTML ID/Class** | `.github-create-btn` (a) |
| **Description** | Link to GitHub signup |
| **Content** | "Create Free Account" |
| **Href** | "https://github.com/signup" |
| **Target** | _blank |
| **Styles** | `background: var(--success);` |
| **Contains** | External link SVG icon |

---

### CP-79: GitHub Connected State (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 3954 |
| **HTML ID/Class** | `#github-connected` |
| **Description** | State shown after OAuth |
| **Styles** | `display: none;` |
| **Nested Elements** | CP-80 through CP-89 |

#### CP-80: Connected User Info
| Property | Value |
|----------|-------|
| **Line** | 3955-3962 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | User avatar and info |
| **Nested Elements** | CP-81, CP-82, CP-83, CP-84 |

##### CP-81: GitHub Avatar
| Property | Value |
|----------|-------|
| **Line** | 3956 |
| **HTML ID/Class** | (img) |
| **Description** | User's GitHub avatar |
| **Src** | "https://github.com/identicons/jasonlong.png" |
| **Styles** | `width: 44px; height: 44px; border-radius: 10px;` |

##### CP-82: GitHub Username
| Property | Value |
|----------|-------|
| **Line** | 3958 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Username |
| **Content** | "alex-engineer" |

##### CP-83: GitHub Account Type
| Property | Value |
|----------|-------|
| **Line** | 3959 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Account type label |
| **Content** | "GitHub Personal Account" |

##### CP-84: Connected Badge
| Property | Value |
|----------|-------|
| **Line** | 3961 |
| **HTML ID/Class** | (span) |
| **Description** | Connection status badge |
| **Content** | "CONNECTED" |
| **Styles** | `background: var(--success);` |

#### CP-85: Repository Select Field
| Property | Value |
|----------|-------|
| **Line** | 3964-3971 |
| **HTML ID/Class** | (div) |
| **Description** | Repository selection |
| **Nested Elements** | CP-86, CP-87 |

##### CP-86: Repository Label
| Property | Value |
|----------|-------|
| **Line** | 3965 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "Repository" |

##### CP-87: Repository Select
| Property | Value |
|----------|-------|
| **Line** | 3966-3970 |
| **HTML ID/Class** | `.model-select` (select) |
| **Description** | Repository dropdown |
| **Options** | ➕ Create new repository, alex-engineer / hubllm-core, alex-engineer / frontend-kit |

#### CP-88: Ready Status Box
| Property | Value |
|----------|-------|
| **Line** | 3973-3980 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Success confirmation box |
| **Content** | "Ready! Code will be pushed to your GitHub. Preview via Codespaces." |
| **Styles** | `background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3);` |

---

### CP-89: VPS Card (Collapsible)
| Property | Value |
|----------|-------|
| **Line** | 3985 |
| **HTML ID/Class** | `#vps-card` |
| **Description** | Collapsible VPS connection option |
| **Styles** | `background: var(--bg-tertiary); border: 1px solid var(--border);` |
| **Nested Elements** | CP-90 through CP-109 |

#### CP-90: VPS Header (Always Visible)
| Property | Value |
|----------|-------|
| **Line** | 3987 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Clickable header to expand/collapse |
| **Event** | `onclick="toggleVPSCard()"` |
| **Nested Elements** | CP-91 through CP-96 |

##### CP-91: VPS Icon Container
| Property | Value |
|----------|-------|
| **Line** | 3989-3996 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Server icon |
| **Styles** | `background: rgba(59, 130, 246, 0.15);` |
| **Contains** | Server rack SVG icon |

##### CP-92: VPS Title Container
| Property | Value |
|----------|-------|
| **Line** | 3997-4000 |
| **HTML ID/Class** | (div) |
| **Description** | Title and subtitle |
| **Nested Elements** | CP-93, CP-94 |

###### CP-93: VPS Title
| Property | Value |
|----------|-------|
| **Line** | 3998 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Card title |
| **Content** | "Connect to VPS" |

###### CP-94: VPS Subtitle
| Property | Value |
|----------|-------|
| **Line** | 3999 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Subtitle |
| **Content** | "Advanced • For power users with their own servers" |

##### CP-95: VPS Toggle Icon
| Property | Value |
|----------|-------|
| **Line** | 4002-4006 |
| **HTML ID/Class** | `#vps-toggle-icon` |
| **Description** | Chevron icon for expand/collapse |
| **Contains** | Chevron down SVG icon |

---

#### CP-96: VPS Fields Container (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 4010 |
| **HTML ID/Class** | `#fields-vps` |
| **Description** | Collapsible form fields |
| **Styles** | `display: none;` |
| **Nested Elements** | CP-97 through CP-109 |

##### CP-97: Server Select Field
| Property | Value |
|----------|-------|
| **Line** | 4012-4019 |
| **HTML ID/Class** | (div) |
| **Description** | Server selection field |
| **Nested Elements** | CP-98, CP-99 |

###### CP-98: Server Label
| Property | Value |
|----------|-------|
| **Line** | 4013 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "Select Server" |

###### CP-99: Server Select
| Property | Value |
|----------|-------|
| **Line** | 4014-4018 |
| **HTML ID/Class** | `.model-select` (select) |
| **Description** | Server dropdown |
| **Options** | ➕ Add New VPS, prod-01 (192.168.1.104), staging-01 (192.168.1.105) |

##### CP-100: IP/Port Grid
| Property | Value |
|----------|-------|
| **Line** | 4020 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Two-column grid for IP and port |
| **Styles** | `display: grid; grid-template-columns: 2fr 1fr; gap: 12px;` |
| **Nested Elements** | CP-101, CP-104 |

###### CP-101: IP Address Field
| Property | Value |
|----------|-------|
| **Line** | 4021-4024 |
| **HTML ID/Class** | (div) |
| **Description** | IP address input field |
| **Nested Elements** | CP-102, CP-103 |

###### CP-102: IP Address Label
| Property | Value |
|----------|-------|
| **Line** | 4022 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "IP Address" |

###### CP-103: IP Address Input
| Property | Value |
|----------|-------|
| **Line** | 4023 |
| **HTML ID/Class** | `.model-select` (input type="text") |
| **Description** | IP input |
| **Placeholder** | "0.0.0.0" |

###### CP-104: Port Field
| Property | Value |
|----------|-------|
| **Line** | 4025-4028 |
| **HTML ID/Class** | (div) |
| **Description** | Port input field |
| **Nested Elements** | CP-105, CP-106 |

###### CP-105: Port Label
| Property | Value |
|----------|-------|
| **Line** | 4026 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "Port" |

###### CP-106: Port Input
| Property | Value |
|----------|-------|
| **Line** | 4027 |
| **HTML ID/Class** | `.model-select` (input type="text") |
| **Description** | Port input |
| **Value** | "22" |

##### CP-107: SSH Key Field
| Property | Value |
|----------|-------|
| **Line** | 4030-4036 |
| **HTML ID/Class** | (div) |
| **Description** | SSH private key field |
| **Nested Elements** | CP-108, CP-109, CP-110 |

###### CP-108: SSH Key Label
| Property | Value |
|----------|-------|
| **Line** | 4032 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "SSH Private Key" |

###### CP-109: SSH Key Help Link
| Property | Value |
|----------|-------|
| **Line** | 4033 |
| **HTML ID/Class** | (a) |
| **Description** | Help link |
| **Content** | "ℹ️ Help finding key" |

###### CP-110: SSH Key Textarea
| Property | Value |
|----------|-------|
| **Line** | 4035 |
| **HTML ID/Class** | `.model-select` (textarea) |
| **Description** | SSH key input |
| **Placeholder** | "-----BEGIN RSA PRIVATE KEY-----..." |
| **Styles** | `min-height: 80px; font-family: Monaco, Consolas, monospace;` |

##### CP-111: Test VPS Connection Button
| Property | Value |
|----------|-------|
| **Line** | 4040-4045 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Test connection button |
| **Content** | "Test Connection" |
| **Event** | `onclick="testVPSConnection()"` |
| **Contains** | Lightning bolt SVG icon |

---

## SECTION 4: STEP 3 - PROJECT CONTEXT (Lines 4053-4109)

### CP-112: Step 3 Panel
| Property | Value |
|----------|-------|
| **Line** | 4053 |
| **HTML ID/Class** | `.settings-panel` |
| **Description** | Step 3 container panel |
| **Nested Elements** | CP-113 through CP-129 |

### CP-113: Step 3 Header Container
| Property | Value |
|----------|-------|
| **Line** | 4054 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with step number, title, and badge |
| **Nested Elements** | CP-114, CP-115, CP-116 |

#### CP-114: Step 3 Number Badge
| Property | Value |
|----------|-------|
| **Line** | 4055 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Circular step number |
| **Content** | "3" |

#### CP-115: Step 3 Title
| Property | Value |
|----------|-------|
| **Line** | 4056 |
| **HTML ID/Class** | (h2) |
| **Description** | Step heading |
| **Content** | "Project Context" |

#### CP-116: Generated Badge (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 4057 |
| **HTML ID/Class** | `#context-generated-badge` |
| **Description** | Shows when context is generated |
| **Content** | "✓ Generated from Brief" |
| **Styles** | `display: none;` |

### CP-117: Step 3 Description
| Property | Value |
|----------|-------|
| **Line** | 4060-4062 |
| **HTML ID/Class** | (p) |
| **Description** | Section explanation |
| **Content** | "This will be auto-converted to CLAUDE.md, AGENTS.md, or system prompts based on your LLM." |

---

### CP-118: Tech Stack Field
| Property | Value |
|----------|-------|
| **Line** | 4064-4067 |
| **HTML ID/Class** | (div) |
| **Description** | Tech stack input field |
| **Nested Elements** | CP-119, CP-120 |

#### CP-119: Tech Stack Label
| Property | Value |
|----------|-------|
| **Line** | 4065 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "Tech Stack" |

#### CP-120: Tech Stack Input
| Property | Value |
|----------|-------|
| **Line** | 4066 |
| **HTML ID/Class** | `#ctx-tech-stack` `.model-select` (input type="text") |
| **Description** | Tech stack input |
| **Placeholder** | "e.g., Node.js, Express, PostgreSQL, Redis" |

---

### CP-121: Code Standards Field
| Property | Value |
|----------|-------|
| **Line** | 4069-4072 |
| **HTML ID/Class** | (div) |
| **Description** | Code standards field |
| **Nested Elements** | CP-122, CP-123 |

#### CP-122: Code Standards Label
| Property | Value |
|----------|-------|
| **Line** | 4070 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "Code Standards" |

#### CP-123: Code Standards Textarea
| Property | Value |
|----------|-------|
| **Line** | 4071 |
| **HTML ID/Class** | `#ctx-standards` `.model-select` (textarea) |
| **Description** | Code standards input |
| **Placeholder** | "e.g., TypeScript strict mode, async/await patterns, JSDoc comments..." |
| **Styles** | `min-height: 70px;` |

---

### CP-124: Common Commands Section
| Property | Value |
|----------|-------|
| **Line** | 4074-4087 |
| **HTML ID/Class** | (div) |
| **Description** | Commands input section |
| **Nested Elements** | CP-125 through CP-129 |

#### CP-125: Commands Label
| Property | Value |
|----------|-------|
| **Line** | 4075 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "Common Commands" |

#### CP-126: Command Row 1
| Property | Value |
|----------|-------|
| **Line** | 4077-4080 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | First command row |
| **Contains** | Command input ("npm run dev") + Description input ("Start dev server") |

#### CP-127: Command Row 2
| Property | Value |
|----------|-------|
| **Line** | 4081-4084 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Second command row |
| **Contains** | Command input ("npm test") + Description input ("Run tests") |

#### CP-128: Add Command Button
| Property | Value |
|----------|-------|
| **Line** | 4085 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Button to add more commands |
| **Content** | "+ Add Command" |

---

### CP-129: Init Tip Box
| Property | Value |
|----------|-------|
| **Line** | 4089-4093 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Blue tip box about /init command |
| **Content** | "💡 After creating, use /init in chat to auto-detect more context..." |
| **Styles** | `background: rgba(59, 130, 246, 0.1);` |

---

### CP-130: Step 3 Actions
| Property | Value |
|----------|-------|
| **Line** | 4096-4108 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Action buttons container |
| **Nested Elements** | CP-131, CP-133 |

#### CP-131: Auto-Gen Button Container
| Property | Value |
|----------|-------|
| **Line** | 4097-4104 |
| **HTML ID/Class** | (div) |
| **Description** | Container with button and help text |
| **Nested Elements** | CP-132 |

##### CP-132: Auto-Gen Button
| Property | Value |
|----------|-------|
| **Line** | 4098-4100 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Auto-generate context button |
| **Content** | "✨ Auto-Gen" |
| **Event** | `onclick="generateProjectContext()"` |

#### CP-133: Save Context Button
| Property | Value |
|----------|-------|
| **Line** | 4105-4107 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Description** | Save button |
| **Content** | "Save Context" |
| **Event** | `onclick="submitProjectContext()"` |

---

## SECTION 5: STEP 4 - PROJECT AGENTS (Lines 4112-4227)

### CP-134: Step 4 Panel
| Property | Value |
|----------|-------|
| **Line** | 4112 |
| **HTML ID/Class** | `.settings-panel` |
| **Description** | Step 4 container panel |
| **Nested Elements** | CP-135 through CP-165 |

### CP-135: Step 4 Header
| Property | Value |
|----------|-------|
| **Line** | 4113-4116 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with step number and title |
| **Nested Elements** | CP-136, CP-137 |

#### CP-136: Step 4 Number Badge
| Property | Value |
|----------|-------|
| **Line** | 4114 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Circular step number |
| **Content** | "4" |

#### CP-137: Step 4 Title
| Property | Value |
|----------|-------|
| **Line** | 4115 |
| **HTML ID/Class** | (h2) |
| **Description** | Step heading |
| **Content** | "Project Agents" |

---

### CP-138: Agent Help Section
| Property | Value |
|----------|-------|
| **Line** | 4119-4137 |
| **HTML ID/Class** | (div) |
| **Description** | Expandable help section |
| **Nested Elements** | CP-139 through CP-143 |

#### CP-139: Agent Help Toggle
| Property | Value |
|----------|-------|
| **Line** | 4120-4123 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Clickable toggle |
| **Event** | `onclick="toggleAgentHelp()"` |
| **Nested Elements** | CP-140, CP-141 |

##### CP-140: Agent Help Chevron
| Property | Value |
|----------|-------|
| **Line** | 4121 |
| **HTML ID/Class** | `#agent-help-chevron` |
| **Description** | Expand indicator |
| **Content** | ▶ |

##### CP-141: Agent Help Link Text
| Property | Value |
|----------|-------|
| **Line** | 4122 |
| **HTML ID/Class** | (span) |
| **Description** | Help link |
| **Content** | "What are Agents?" |

#### CP-142: Agent Help Content (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 4124-4137 |
| **HTML ID/Class** | `#agent-help-content` |
| **Description** | Expanded help content |
| **Styles** | `display: none;` |
| **Contains** | Explanation text + visual diagram |

---

### CP-143: Global Agents Section
| Property | Value |
|----------|-------|
| **Line** | 4141 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Global agents container |
| **Styles** | `background: var(--bg-tertiary);` |
| **Nested Elements** | CP-144 through CP-157 |

#### CP-144: Global Agents Header
| Property | Value |
|----------|-------|
| **Line** | 4142-4149 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with master checkbox |
| **Nested Elements** | CP-145, CP-146, CP-147, CP-148 |

##### CP-145: Global Agents Master Checkbox
| Property | Value |
|----------|-------|
| **Line** | 4143 |
| **HTML ID/Class** | `#global-agents-master` (input type="checkbox") |
| **Description** | Toggle all agents |
| **Checked** | true |
| **Event** | `onclick="toggleAllGlobalAgents(this)"` |

##### CP-146: Global Agents Label
| Property | Value |
|----------|-------|
| **Line** | 4145 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Section label |
| **Content** | "Include Global Agents" |

##### CP-147: Global Agents Count
| Property | Value |
|----------|-------|
| **Line** | 4146 |
| **HTML ID/Class** | `#global-agents-count` |
| **Description** | Selected count |
| **Content** | "3 agents selected" |

##### CP-148: Global Agents Chevron
| Property | Value |
|----------|-------|
| **Line** | 4148 |
| **HTML ID/Class** | `#global-agents-chevron` |
| **Description** | Expand indicator |
| **Content** | ▼ |
| **Event** | `onclick="toggleGlobalAgents()"` |

#### CP-149: Global Agents List
| Property | Value |
|----------|-------|
| **Line** | 4151 |
| **HTML ID/Class** | `#global-agents-list` |
| **Description** | Expandable list of global agents |
| **Nested Elements** | CP-150, CP-153, CP-156 |

##### CP-150: Global Agent - code-reviewer
| Property | Value |
|----------|-------|
| **Line** | 4152-4168 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Code reviewer agent row |
| **Contains** | Checkbox, icon, name, description, Edit link |

##### CP-151: code-reviewer Checkbox
| Property | Value |
|----------|-------|
| **Line** | 4153 |
| **HTML ID/Class** | `.global-agent-checkbox` (input type="checkbox") |
| **Description** | Agent toggle |
| **Checked** | true |
| **Event** | `onchange="updateGlobalAgentsMaster()"` |

##### CP-152: code-reviewer Edit Link
| Property | Value |
|----------|-------|
| **Line** | 4167 |
| **HTML ID/Class** | (span) |
| **Description** | Link to global settings |
| **Content** | "Edit Global →" |
| **Event** | `onclick="showView('settings'); showSettingsTab('globalagents')"` |

##### CP-153: Global Agent - security-audit
| Property | Value |
|----------|-------|
| **Line** | 4169-4181 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Security audit agent row |
| **Contains** | Checkbox, icon, name, description, Edit link |

##### CP-154: security-audit Checkbox
| Property | Value |
|----------|-------|
| **Line** | 4170 |
| **HTML ID/Class** | `.global-agent-checkbox` (input type="checkbox") |
| **Description** | Agent toggle |
| **Checked** | true |

##### CP-155: security-audit Edit Link
| Property | Value |
|----------|-------|
| **Line** | 4180 |
| **HTML ID/Class** | (span) |
| **Description** | Link to global settings |
| **Content** | "Edit Global →" |

##### CP-156: Global Agent - test-writer
| Property | Value |
|----------|-------|
| **Line** | 4182-4196 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Test writer agent row |
| **Contains** | Checkbox, icon, name, description, Edit link |

##### CP-157: test-writer Checkbox
| Property | Value |
|----------|-------|
| **Line** | 4183 |
| **HTML ID/Class** | `.global-agent-checkbox` (input type="checkbox") |
| **Description** | Agent toggle |
| **Checked** | true |

---

### CP-158: Project-Specific Agents Section
| Property | Value |
|----------|-------|
| **Line** | 4200-4226 |
| **HTML ID/Class** | (div) |
| **Description** | Project-specific agents area |
| **Nested Elements** | CP-159 through CP-165 |

#### CP-159: Project Agents Label
| Property | Value |
|----------|-------|
| **Line** | 4201 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Section label |
| **Content** | "Project-Specific Agents" |

#### CP-160: Project Agent - api-designer
| Property | Value |
|----------|-------|
| **Line** | 4203-4224 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | API designer agent card |
| **Styles** | `background: var(--bg-tertiary);` |
| **Nested Elements** | CP-161 through CP-164 |

##### CP-161: api-designer Icon
| Property | Value |
|----------|-------|
| **Line** | 4205-4209 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Orange wrench icon |
| **Styles** | `background: rgba(249, 115, 22, 0.15);` |

##### CP-162: api-designer Info
| Property | Value |
|----------|-------|
| **Line** | 4210-4213 |
| **HTML ID/Class** | (div) |
| **Description** | Name and description |
| **Content** | "api-designer" / "Designs REST API endpoints" |

##### CP-163: Add to Global Link
| Property | Value |
|----------|-------|
| **Line** | 4215-4220 |
| **HTML ID/Class** | (span) |
| **Description** | Promote to global link |
| **Content** | "Add to Global" with up arrow icon |

##### CP-164: Remove Agent Button
| Property | Value |
|----------|-------|
| **Line** | 4221 |
| **HTML ID/Class** | (button) |
| **Description** | Remove button |
| **Content** | "✕" |

#### CP-165: Add Project Agent Button
| Property | Value |
|----------|-------|
| **Line** | 4226 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Add agent button |
| **Content** | "+ Add Project Agent" |
| **Styles** | `width: 100%;` |

---

## SECTION 6: STEP 5 - MCP SERVERS (Lines 4230-4350)

### CP-166: Step 5 Panel
| Property | Value |
|----------|-------|
| **Line** | 4230 |
| **HTML ID/Class** | `.settings-panel` |
| **Description** | Step 5 container panel |
| **Nested Elements** | CP-167 through CP-197 |

### CP-167: Step 5 Header
| Property | Value |
|----------|-------|
| **Line** | 4231-4243 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with step number, title, and warning |
| **Nested Elements** | CP-168, CP-169, CP-170 |

#### CP-168: Step 5 Number Badge
| Property | Value |
|----------|-------|
| **Line** | 4232 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Circular step number |
| **Content** | "5" |

#### CP-169: Step 5 Title
| Property | Value |
|----------|-------|
| **Line** | 4233 |
| **HTML ID/Class** | (h2) |
| **Description** | Step heading |
| **Content** | "MCP Servers" |

#### CP-170: MCP Warning Icon
| Property | Value |
|----------|-------|
| **Line** | 4234-4242 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Warning icon with tooltip |
| **Content** | ⚠️ |
| **Event** | `onclick="toggleMCPWarning()"` |
| **Contains** | Hidden tooltip (CP-171) |

##### CP-171: MCP Warning Tooltip (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 4236-4241 |
| **HTML ID/Class** | `#mcp-warning-tooltip` |
| **Description** | Context warning tooltip |
| **Styles** | `display: none;` |
| **Content** | "Each MCP server uses context tokens. Keep 3-5 active per project..." |

---

### CP-172: MCP Help Section
| Property | Value |
|----------|-------|
| **Line** | 4246-4264 |
| **HTML ID/Class** | (div) |
| **Description** | Expandable help section |
| **Nested Elements** | CP-173 through CP-176 |

#### CP-173: MCP Help Toggle
| Property | Value |
|----------|-------|
| **Line** | 4247-4250 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Clickable toggle |
| **Event** | `onclick="toggleMCPHelp()"` |
| **Nested Elements** | CP-174, CP-175 |

##### CP-174: MCP Help Chevron
| Property | Value |
|----------|-------|
| **Line** | 4248 |
| **HTML ID/Class** | `#mcp-help-chevron` |
| **Description** | Expand indicator |
| **Content** | ▶ |

##### CP-175: MCP Help Link Text
| Property | Value |
|----------|-------|
| **Line** | 4249 |
| **HTML ID/Class** | (span) |
| **Description** | Help link |
| **Content** | "What is MCP?" |

#### CP-176: MCP Help Content (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 4251-4264 |
| **HTML ID/Class** | `#mcp-help-content` |
| **Description** | Expanded help content |
| **Styles** | `display: none;` |
| **Contains** | Explanation text + visual diagram |

---

### CP-177: Global MCP Section
| Property | Value |
|----------|-------|
| **Line** | 4268 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Global MCP servers container |
| **Styles** | `background: var(--bg-tertiary);` |
| **Nested Elements** | CP-178 through CP-191 |

#### CP-178: Global MCP Header
| Property | Value |
|----------|-------|
| **Line** | 4269-4276 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with master checkbox |
| **Nested Elements** | CP-179, CP-180, CP-181, CP-182 |

##### CP-179: Global MCP Master Checkbox
| Property | Value |
|----------|-------|
| **Line** | 4270 |
| **HTML ID/Class** | `#global-mcp-master` (input type="checkbox") |
| **Description** | Toggle all MCP servers |
| **Checked** | true |
| **Event** | `onclick="toggleAllGlobalMCP(this)"` |

##### CP-180: Global MCP Label
| Property | Value |
|----------|-------|
| **Line** | 4272 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Section label |
| **Content** | "Include Global MCP Servers" |

##### CP-181: Global MCP Count
| Property | Value |
|----------|-------|
| **Line** | 4273 |
| **HTML ID/Class** | `#global-mcp-count` |
| **Description** | Selected count |
| **Content** | "2 of 3 servers selected" |

##### CP-182: Global MCP Chevron
| Property | Value |
|----------|-------|
| **Line** | 4275 |
| **HTML ID/Class** | `#global-mcp-chevron` |
| **Description** | Expand indicator |
| **Content** | ▼ |
| **Event** | `onclick="toggleGlobalMCP()"` |

#### CP-183: Global MCP List
| Property | Value |
|----------|-------|
| **Line** | 4278 |
| **HTML ID/Class** | `#global-mcp-list` |
| **Description** | Expandable list of global MCP servers |
| **Nested Elements** | CP-184, CP-186, CP-188 |

##### CP-184: Global MCP - GitHub
| Property | Value |
|----------|-------|
| **Line** | 4279-4291 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | GitHub MCP row |
| **Contains** | Checkbox (checked), icon, name, status, Edit link |

##### CP-185: GitHub MCP Checkbox
| Property | Value |
|----------|-------|
| **Line** | 4280 |
| **HTML ID/Class** | `.global-mcp-checkbox` (input type="checkbox") |
| **Description** | MCP toggle |
| **Checked** | true |
| **Event** | `onchange="updateGlobalMCPMaster()"` |

##### CP-186: Global MCP - Slack
| Property | Value |
|----------|-------|
| **Line** | 4292-4304 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Slack MCP row |
| **Contains** | Checkbox (checked), icon, name, status, Edit link |

##### CP-187: Slack MCP Checkbox
| Property | Value |
|----------|-------|
| **Line** | 4293 |
| **HTML ID/Class** | `.global-mcp-checkbox` (input type="checkbox") |
| **Description** | MCP toggle |
| **Checked** | true |

##### CP-188: Global MCP - Google Drive (Not Selected)
| Property | Value |
|----------|-------|
| **Line** | 4305-4317 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Google Drive MCP row (unchecked) |
| **Styles** | `opacity: 0.5;` |
| **Contains** | Checkbox (unchecked), icon, name, status, Edit link |

##### CP-189: Google Drive MCP Checkbox
| Property | Value |
|----------|-------|
| **Line** | 4306 |
| **HTML ID/Class** | `.global-mcp-checkbox` (input type="checkbox") |
| **Description** | MCP toggle |
| **Checked** | false |

---

### CP-190: Project-Specific MCP Section
| Property | Value |
|----------|-------|
| **Line** | 4321-4349 |
| **HTML ID/Class** | (div) |
| **Description** | Project-specific MCP area |
| **Nested Elements** | CP-191 through CP-197 |

#### CP-191: Project MCP Label
| Property | Value |
|----------|-------|
| **Line** | 4322 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Section label |
| **Content** | "Project-Specific Servers" |

#### CP-192: Project MCP - PostgreSQL
| Property | Value |
|----------|-------|
| **Line** | 4324-4347 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | PostgreSQL MCP card |
| **Styles** | `background: var(--bg-tertiary);` |
| **Nested Elements** | CP-193 through CP-196 |

##### CP-193: PostgreSQL Icon
| Property | Value |
|----------|-------|
| **Line** | 4326-4331 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | PostgreSQL icon |
| **Styles** | `background: rgba(51, 103, 145, 0.2);` |
| **Contains** | Database SVG icon |

##### CP-194: PostgreSQL Info
| Property | Value |
|----------|-------|
| **Line** | 4333-4336 |
| **HTML ID/Class** | (div) |
| **Description** | Name and status |
| **Content** | "PostgreSQL" / "● Ready to connect" |

##### CP-195: Add to Global Link
| Property | Value |
|----------|-------|
| **Line** | 4338-4343 |
| **HTML ID/Class** | (span) |
| **Description** | Promote to global link |
| **Content** | "Add to Global" with up arrow icon |

##### CP-196: Remove MCP Button
| Property | Value |
|----------|-------|
| **Line** | 4344 |
| **HTML ID/Class** | (button) |
| **Description** | Remove button |
| **Content** | "✕" |

#### CP-197: Add MCP Server Button
| Property | Value |
|----------|-------|
| **Line** | 4349 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Add MCP server button |
| **Content** | "+ Add MCP Server" |
| **Styles** | `width: 100%;` |

---

## SECTION 7: FIXED ACTION BAR (Lines 4356-4364)

### CP-198: Action Bar Container
| Property | Value |
|----------|-------|
| **Line** | 4356 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Fixed bottom action bar |
| **Styles** | `display: flex; justify-content: space-between; padding: 16px 24px; border-top: 1px solid var(--border); background: var(--bg-secondary); flex-shrink: 0;` |
| **Nested Elements** | CP-199, CP-200 |

#### CP-199: Cancel Button
| Property | Value |
|----------|-------|
| **Line** | 4357 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Cancel and return to dashboard |
| **Content** | "Cancel" |
| **Event** | `onclick="showView('dashboard')"` |

#### CP-200: Create Project Button
| Property | Value |
|----------|-------|
| **Line** | 4358-4363 |
| **HTML ID/Class** | `.btn.btn-primary.btn-pulse` |
| **Description** | Primary submit button with animation |
| **Content** | "Create Project" |
| **Event** | `onclick="showView('workspace')"` |
| **Contains** | Chevron right SVG icon |

---

## ELEMENT SUMMARY

### Element Counts by Section
| Section | Elements |
|---------|----------|
| View Container | 6 |
| Step 1: Project Details | 56 |
| Step 2: Connection Source | 52 |
| Step 3: Project Context | 18 |
| Step 4: Project Agents | 32 |
| Step 5: MCP Servers | 33 |
| Action Bar | 6 |
| **TOTAL** | **203** |

---

## INTERACTION MAP

### View Navigation
| Element ID | Event Handler | Target |
|------------|---------------|--------|
| CP-199 | `showView('dashboard')` | Dashboard View |
| CP-200 | `showView('workspace')` | Workspace View |
| CP-152 | `showView('settings'); showSettingsTab('globalagents')` | Settings > Global Agents |
| CP-155 | `showView('settings'); showSettingsTab('globalagents')` | Settings > Global Agents |
| CP-185 | `showView('settings'); showSettingsTab('globalmcp')` | Settings > Global MCP |

### Toggle Events
| Element ID | Event Handler | Target |
|------------|---------------|--------|
| CP-26 | `startProjectDefinition()` | Shows AI Brief Chat |
| CP-38 | `collapseAIChat()` | Hides AI Brief Chat |
| CP-52 | `toggleVoiceInput()` | Voice Recording |
| CP-90 | `toggleVPSCard()` | VPS Fields |
| CP-139 | `toggleAgentHelp()` | Agent Help Content |
| CP-145 | `toggleAllGlobalAgents(this)` | All Agent Checkboxes |
| CP-148 | `toggleGlobalAgents()` | Global Agents List |
| CP-170 | `toggleMCPWarning()` | MCP Warning Tooltip |
| CP-173 | `toggleMCPHelp()` | MCP Help Content |
| CP-179 | `toggleAllGlobalMCP(this)` | All MCP Checkboxes |
| CP-182 | `toggleGlobalMCP()` | Global MCP List |

### Form Submission Events
| Element ID | Event Handler | Action |
|------------|---------------|--------|
| CP-56 | `generateProjectContext()` | Generate context from AI chat |
| CP-57 | `continueConversation()` | Continue AI conversation |
| CP-111 | `testVPSConnection()` | Test VPS connection |
| CP-132 | `generateProjectContext()` | Auto-generate context |
| CP-133 | `submitProjectContext()` | Save project context |

### OAuth Events
| Element ID | Event Handler | Action |
|------------|---------------|--------|
| CP-76 | `connectGitHub()` | GitHub OAuth flow |

---

## FORM ELEMENTS

### Text Inputs
| Element ID | Type | Name | Placeholder/Value |
|------------|------|------|-------------------|
| CP-17 | text | Project Name | "e.g. Family Calendar App" |
| CP-24 | textarea | Project Brief | "Describe what you want to build..." |
| CP-51 | text | AI Chat Input | "Ask follow-up questions..." |
| CP-103 | text | IP Address | "0.0.0.0" |
| CP-106 | text | Port | "22" |
| CP-110 | textarea | SSH Key | "-----BEGIN RSA PRIVATE KEY-----" |
| CP-120 | text | Tech Stack | "e.g., Node.js, Express..." |
| CP-123 | textarea | Code Standards | "e.g., TypeScript strict mode..." |

### Select Dropdowns
| Element ID | Name | Options |
|------------|------|---------|
| CP-14 | Workspace | Customers, Personal, ➕ Create New Workspace... |
| CP-87 | Repository | ➕ Create new repository, alex-engineer / hubllm-core, alex-engineer / frontend-kit |
| CP-99 | Server | ➕ Add New VPS, prod-01 (192.168.1.104), staging-01 (192.168.1.105) |

### Checkboxes
| Element ID | Name | Default State |
|------------|------|---------------|
| CP-145 | Global Agents Master | Checked |
| CP-151 | code-reviewer | Checked |
| CP-154 | security-audit | Checked |
| CP-157 | test-writer | Checked |
| CP-179 | Global MCP Master | Checked |
| CP-185 | GitHub MCP | Checked |
| CP-187 | Slack MCP | Checked |
| CP-189 | Google Drive MCP | Unchecked |

### Hidden Elements
| Element ID | Name | Initially Hidden |
|------------|------|------------------|
| CP-23 | File Upload Input | Yes |
| CP-28 | AI Brief Chat | Yes |
| CP-54 | Voice Recording Indicator | Yes |
| CP-79 | GitHub Connected State | Yes |
| CP-96 | VPS Fields | Yes |
| CP-116 | Context Generated Badge | Yes |
| CP-142 | Agent Help Content | Yes |
| CP-171 | MCP Warning Tooltip | Yes |
| CP-176 | MCP Help Content | Yes |

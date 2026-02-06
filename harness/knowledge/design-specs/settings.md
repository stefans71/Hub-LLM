# HubLLM UI Element Mapping: Settings View

## Document Info
- **Source File**: hubllm-mockup-v2.html
- **Scope**: Lines 2871-3685
- **Total Elements Mapped**: 298

---

## SETTINGS SECTIONS INDEX

| # | Section | HTML ID | Lines | Elements | Default |
|---|---------|---------|-------|----------|---------|
| 1 | Anthropic Subscription | `#settings-subscription` | 2984-3070 | 32 | Visible |
| 2 | API Keys | `#settings-apikeys` | 3073-3114 | 22 | Hidden |
| 3 | Default Model | `#settings-model` | 3117-3147 | 10 | Hidden |
| 4 | VPS Connections | `#settings-vps` | 3150-3159 | 7 | Hidden |
| 5 | Profile | `#settings-profile` | 3162-3207 | 25 | Hidden |
| 6 | Appearance | `#settings-appearance` | 3210-3258 | 23 | Hidden |
| 7 | Voice Input | `#settings-voice` | 3261-3274 | 7 | Hidden |
| 8 | Global Agents | `#settings-globalagents` | 3277-3429 | 50 | Hidden |
| 9 | Global Skills | `#settings-globalskills` | 3432-3499 | 29 | Hidden |
| 10 | Global MCP Servers | `#settings-globalmcp` | 3502-3678 | 54 | Hidden |

**Navigation:** `showSettingsTab('sectionname')` switches between sections.

---

## SECTION 1: SETTINGS VIEW CONTAINER (Lines 2871-2872)

### S-01: Settings View Container
| Property | Value |
|----------|-------|
| **Line** | 2871 |
| **HTML ID/Class** | `#view-settings` `.view` |
| **Description** | Root container for entire Settings view (hidden by default) |
| **Nested Elements** | S-02 |

### S-02: App Container
| Property | Value |
|----------|-------|
| **Line** | 2872 |
| **HTML ID/Class** | `.app-container` |
| **Description** | Flex container for sidebar + main content layout |
| **Nested Elements** | S-03, S-63 |

---

## SECTION 2: SETTINGS SIDEBAR (Lines 2874-2970)

### S-03: Sidebar
| Property | Value |
|----------|-------|
| **Line** | 2874 |
| **HTML ID/Class** | `.sidebar` |
| **Description** | Left sidebar with settings navigation |
| **Nested Elements** | S-04, S-52 |

### S-04: Sidebar Navigation
| Property | Value |
|----------|-------|
| **Line** | 2875 |
| **HTML ID/Class** | `.sidebar-nav` |
| **Description** | Navigation container |
| **Styles** | `padding-top: 16px;` |
| **Nested Elements** | S-05, S-11 |

---

### S-05: Main Nav Section
| Property | Value |
|----------|-------|
| **Line** | 2876 |
| **HTML ID/Class** | `.nav-section` |
| **Description** | "Main" navigation section |
| **Nested Elements** | S-06, S-07 |

#### S-06: Main Section Title
| Property | Value |
|----------|-------|
| **Line** | 2877 |
| **HTML ID/Class** | `.nav-section-title` |
| **Description** | Section header label |
| **Content** | "Main" |

#### S-07: Dashboard Nav Item
| Property | Value |
|----------|-------|
| **Line** | 2878 |
| **HTML ID/Class** | `.nav-item` |
| **Description** | Dashboard navigation link |
| **Content** | "Dashboard" |
| **Event** | `onclick="showView('dashboard')"` |
| **Nested Elements** | S-08 |

##### S-08: Dashboard Nav Icon Container
| Property | Value |
|----------|-------|
| **Line** | 2879 |
| **HTML ID/Class** | `.nav-item-icon` |
| **Description** | Icon container |
| **Nested Elements** | S-09 |

##### S-09: Dashboard Nav Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2880-2885 |
| **HTML ID/Class** | (svg) |
| **Description** | 4-square grid icon |
| **Size** | 18x18 |
| **Icon Type** | Grid (4 rectangles) |

---

### S-10: Settings Nav Section
| Property | Value |
|----------|-------|
| **Line** | 2892 |
| **HTML ID/Class** | `.nav-section` |
| **Description** | Settings navigation section with sub-items |
| **Nested Elements** | S-11 through S-51 |

#### S-11: Settings Section Title
| Property | Value |
|----------|-------|
| **Line** | 2893 |
| **HTML ID/Class** | `.nav-section-title` |
| **Description** | Section header label |
| **Content** | "Settings" |

#### S-12: Account Category Label
| Property | Value |
|----------|-------|
| **Line** | 2895 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Sub-category header for account settings |
| **Content** | "Account" |
| **Styles** | `font-size: 10px; text-transform: uppercase; color: var(--text-muted);` |

---

### S-13: Anthropic Subscription Nav Item (Active)
| Property | Value |
|----------|-------|
| **Line** | 2896 |
| **HTML ID/Class** | `.settings-subnav-item.active` |
| **Description** | Subscription settings link (default active) |
| **Content** | "Anthropic Subscription" |
| **Event** | `onclick="showSettingsTab('subscription')"` |
| **Nested Elements** | S-14 |

#### S-14: Subscription Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2897-2900 |
| **HTML ID/Class** | (svg) |
| **Description** | Lock icon |
| **Size** | 14x14 |
| **Icon Type** | Padlock |
| **Styles** | `opacity: 0.7;` |

---

### S-15: API Keys Nav Item
| Property | Value |
|----------|-------|
| **Line** | 2903 |
| **HTML ID/Class** | `.settings-subnav-item` |
| **Description** | API keys settings link |
| **Content** | "API Keys" |
| **Event** | `onclick="showSettingsTab('apikeys')"` |
| **Nested Elements** | S-16 |

#### S-16: API Keys Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2904-2906 |
| **HTML ID/Class** | (svg) |
| **Description** | Key icon |
| **Size** | 14x14 |
| **Icon Type** | Key |

---

### S-17: Profile Nav Item
| Property | Value |
|----------|-------|
| **Line** | 2909 |
| **HTML ID/Class** | `.settings-subnav-item` |
| **Description** | Profile settings link |
| **Content** | "Profile" |
| **Event** | `onclick="showSettingsTab('profile')"` |
| **Nested Elements** | S-18 |

#### S-18: Profile Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2910-2913 |
| **HTML ID/Class** | (svg) |
| **Description** | User icon |
| **Size** | 14x14 |
| **Icon Type** | Person |

---

### S-19: Appearance Nav Item
| Property | Value |
|----------|-------|
| **Line** | 2916 |
| **HTML ID/Class** | `.settings-subnav-item` |
| **Description** | Appearance settings link |
| **Content** | "Appearance" |
| **Event** | `onclick="showSettingsTab('appearance')"` |
| **Nested Elements** | S-20 |

#### S-20: Appearance Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2917-2923 |
| **HTML ID/Class** | (svg) |
| **Description** | Palette icon |
| **Size** | 14x14 |
| **Icon Type** | Color palette |

---

### S-21: Global Defaults Category Label
| Property | Value |
|----------|-------|
| **Line** | 2927 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Sub-category header for global defaults |
| **Content** | "Global Defaults" |
| **Styles** | `font-size: 10px; text-transform: uppercase; border-top: 1px solid var(--border);` |

---

### S-22: Agents Nav Item
| Property | Value |
|----------|-------|
| **Line** | 2928 |
| **HTML ID/Class** | `.settings-subnav-item` |
| **Description** | Global agents settings link |
| **Content** | "Agents" |
| **Event** | `onclick="showSettingsTab('globalagents')"` |
| **Nested Elements** | S-23 |

#### S-23: Agents Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2929-2935 |
| **HTML ID/Class** | (svg) |
| **Description** | Robot icon |
| **Size** | 14x14 |
| **Icon Type** | Robot/Bot |

---

### S-24: Skills Nav Item
| Property | Value |
|----------|-------|
| **Line** | 2938 |
| **HTML ID/Class** | `.settings-subnav-item` |
| **Description** | Global skills settings link |
| **Content** | "Skills" |
| **Event** | `onclick="showSettingsTab('globalskills')"` |
| **Nested Elements** | S-25 |

#### S-25: Skills Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2939-2942 |
| **HTML ID/Class** | (svg) |
| **Description** | Book icon |
| **Size** | 14x14 |
| **Icon Type** | Book |

---

### S-26: MCP Servers Nav Item
| Property | Value |
|----------|-------|
| **Line** | 2945 |
| **HTML ID/Class** | `.settings-subnav-item` |
| **Description** | Global MCP servers settings link |
| **Content** | "MCP Servers" |
| **Event** | `onclick="showSettingsTab('globalmcp')"` |
| **Nested Elements** | S-27 |

#### S-27: MCP Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2946-2949 |
| **HTML ID/Class** | (svg) |
| **Description** | Clock/server icon |
| **Size** | 14x14 |
| **Icon Type** | Circle with clock hands |

---

### S-28: Sidebar Footer
| Property | Value |
|----------|-------|
| **Line** | 2954 |
| **HTML ID/Class** | `.sidebar-footer` |
| **Description** | Bottom section of sidebar |
| **Nested Elements** | S-29, S-32 |

#### S-29: New Project Button
| Property | Value |
|----------|-------|
| **Line** | 2955 |
| **HTML ID/Class** | `.new-project-btn` |
| **Description** | Button to create new project |
| **Content** | "New Project" |
| **Event** | `onclick="showView('create-project')"` |
| **Nested Elements** | S-30 |

##### S-30: New Project Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2956-2959 |
| **HTML ID/Class** | (svg) |
| **Description** | Plus icon |
| **Size** | 16x16 |
| **Icon Type** | Plus (2 lines) |

#### S-31: User Profile Container
| Property | Value |
|----------|-------|
| **Line** | 2962 |
| **HTML ID/Class** | `.user-profile` |
| **Description** | User profile section (no click event in Settings) |
| **Nested Elements** | S-32, S-33 |

##### S-32: User Avatar
| Property | Value |
|----------|-------|
| **Line** | 2963 |
| **HTML ID/Class** | `.user-avatar` |
| **Description** | Circular avatar with initials |
| **Content** | "AE" |

##### S-33: User Info Container
| Property | Value |
|----------|-------|
| **Line** | 2964 |
| **HTML ID/Class** | `.user-info` |
| **Description** | Container for user details |
| **Nested Elements** | S-34, S-35 |

##### S-34: User Name
| Property | Value |
|----------|-------|
| **Line** | 2965 |
| **HTML ID/Class** | `.user-name` |
| **Description** | Display name |
| **Content** | "Alex Engineer" |

##### S-35: User Plan
| Property | Value |
|----------|-------|
| **Line** | 2966 |
| **HTML ID/Class** | `.user-plan` |
| **Description** | Subscription tier |
| **Content** | "Pro Account" |

---

## SECTION 3: SETTINGS MAIN CONTENT (Lines 2972-3681)

### S-36: Main Content Container
| Property | Value |
|----------|-------|
| **Line** | 2972 |
| **HTML ID/Class** | `.main-content` |
| **Description** | Primary content area |
| **Nested Elements** | S-37, S-41 |

### S-37: Top Bar
| Property | Value |
|----------|-------|
| **Line** | 2973 |
| **HTML ID/Class** | `.top-bar` |
| **Description** | Header bar with search |
| **Nested Elements** | S-38 |

#### S-38: Search Bar Container
| Property | Value |
|----------|-------|
| **Line** | 2974 |
| **HTML ID/Class** | `.search-bar` |
| **Description** | Search input container |
| **Nested Elements** | S-39, S-40 |

##### S-39: Search Icon
| Property | Value |
|----------|-------|
| **Line** | 2975 |
| **HTML ID/Class** | `.search-icon` |
| **Description** | Magnifying glass emoji |
| **Content** | 🔍 |

##### S-40: Search Input
| Property | Value |
|----------|-------|
| **Line** | 2976 |
| **HTML ID/Class** | (input type="text") |
| **Description** | Settings search input |
| **Placeholder** | "Search settings..." |

### S-41: Page Content Container
| Property | Value |
|----------|-------|
| **Line** | 2980 |
| **HTML ID/Class** | `.page-content` |
| **Description** | Scrollable content area |
| **Nested Elements** | S-42 |

### S-42: Settings Panel
| Property | Value |
|----------|-------|
| **Line** | 2982 |
| **HTML ID/Class** | `.settings-panel` |
| **Description** | Container for all settings sections |
| **Styles** | `max-width: 900px;` |
| **Nested Elements** | S-43 (and all settings sections) |

---

## SECTION 4: ANTHROPIC SUBSCRIPTION (Lines 2984-3070)

### S-43: Anthropic Subscription Section
| Property | Value |
|----------|-------|
| **Line** | 2984 |
| **HTML ID/Class** | `#settings-subscription` `.settings-section` |
| **Description** | Anthropic subscription settings (visible by default) |
| **Nested Elements** | S-44 through S-62 |

#### S-44: Section Title
| Property | Value |
|----------|-------|
| **Line** | 2985 |
| **HTML ID/Class** | `.settings-section-title` (h2) |
| **Description** | Section heading |
| **Content** | "Anthropic Subscription" |

#### S-45: Section Description
| Property | Value |
|----------|-------|
| **Line** | 2986 |
| **HTML ID/Class** | `.settings-section-desc` (p) |
| **Description** | Section explanation text |
| **Content** | "Connect your Anthropic account to access Claude Code CLI and authenticate with your subscription." |

---

### S-46: Claude Code CLI Card
| Property | Value |
|----------|-------|
| **Line** | 2988 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Card for Claude Code CLI settings |
| **Styles** | `background: var(--bg-tertiary); border-radius: 12px; padding: 24px;` |
| **Nested Elements** | S-47 through S-55 |

#### S-47: CLI Header Container
| Property | Value |
|----------|-------|
| **Line** | 2989 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with icon and title |
| **Nested Elements** | S-48, S-49 |

##### S-48: CLI Icon
| Property | Value |
|----------|-------|
| **Line** | 2990 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Red circle icon |
| **Content** | 🔴 |
| **Styles** | `width: 48px; height: 48px; background: rgba(239, 68, 68, 0.2); border-radius: 12px;` |

##### S-49: CLI Info Container
| Property | Value |
|----------|-------|
| **Line** | 2991 |
| **HTML ID/Class** | (div) |
| **Description** | Title and description |
| **Nested Elements** | S-50, S-51 |

###### S-50: CLI Title
| Property | Value |
|----------|-------|
| **Line** | 2992 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Feature name |
| **Content** | "Claude Code CLI" |
| **Styles** | `font-weight: 600; font-size: 16px;` |

###### S-51: CLI Description
| Property | Value |
|----------|-------|
| **Line** | 2993 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Feature description |
| **Content** | "Command-line access to Claude for development workflows" |

---

### S-52: Connection Status Card
| Property | Value |
|----------|-------|
| **Line** | 2997 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Card showing connection status |
| **Styles** | `background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 16px;` |
| **Nested Elements** | S-53 through S-57 |

#### S-53: Status Indicator Dot
| Property | Value |
|----------|-------|
| **Line** | 2999 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Green connected status dot |
| **Styles** | `width: 12px; height: 12px; background: var(--success); border-radius: 50%;` |

#### S-54: Connection Status Text
| Property | Value |
|----------|-------|
| **Line** | 3001 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | "Connected" status label |
| **Content** | "Connected" |
| **Styles** | `font-weight: 500;` |

#### S-55: Authenticated Email
| Property | Value |
|----------|-------|
| **Line** | 3002 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | User's authenticated email |
| **Content** | "Authenticated as [email]" |

#### S-56: Disconnect Button
| Property | Value |
|----------|-------|
| **Line** | 3004 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Button to disconnect account |
| **Content** | "Disconnect" |
| **Styles** | `margin-left: auto; padding: 6px 12px; font-size: 12px;` |

---

### S-57: CLI Status Info
| Property | Value |
|----------|-------|
| **Line** | 3008-3010 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | CLI version and default model info |
| **Content** | "CLI Status: Installed (v1.2.3) | Default Model: Claude Opus 4.5" |

### S-58: CLI Action Buttons Container
| Property | Value |
|----------|-------|
| **Line** | 3012 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Container for action buttons |
| **Nested Elements** | S-59, S-60 |

#### S-59: Re-authenticate Button
| Property | Value |
|----------|-------|
| **Line** | 3013-3015 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Description** | Button to re-authenticate |
| **Content** | "🔄 Re-authenticate" |
| **Styles** | `padding: 10px 20px;` |

#### S-60: Reinstall CLI Button
| Property | Value |
|----------|-------|
| **Line** | 3016-3018 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Button to reinstall CLI |
| **Content** | "📥 Reinstall CLI" |
| **Styles** | `padding: 10px 20px;` |

---

### S-61: Cross-LLM Requests Card
| Property | Value |
|----------|-------|
| **Line** | 3023 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Card for cross-LLM feature settings |
| **Styles** | `background: var(--bg-tertiary); border-radius: 12px; padding: 24px; border: 1px solid var(--border);` |
| **Nested Elements** | S-62 through S-75 |

#### S-62: Cross-LLM Checkbox
| Property | Value |
|----------|-------|
| **Line** | 3026 |
| **HTML ID/Class** | `#cross-llm-checkbox` (input type="checkbox") |
| **Description** | Toggle for cross-LLM feature |
| **Event** | `onchange="toggleCrossLLM()"` |
| **Styles** | `width: 20px; height: 20px;` |

#### S-63: Cross-LLM Label
| Property | Value |
|----------|-------|
| **Line** | 3029 |
| **HTML ID/Class** | (label for="cross-llm-checkbox") |
| **Description** | Feature label |
| **Content** | "Enable Cross-LLM Requests via OpenRouter" |
| **Styles** | `font-weight: 600; font-size: 15px;` |

#### S-64: Cross-LLM Description
| Property | Value |
|----------|-------|
| **Line** | 3030-3033 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Feature explanation with code example |
| **Content** | "Allow Claude CLI to call other LLMs..." |

#### S-65: Cross-LLM Code Example
| Property | Value |
|----------|-------|
| **Line** | 3032 |
| **HTML ID/Class** | (code) |
| **Description** | Example command |
| **Content** | "Ask GPT-5.2-Codex to review this file" |

---

### S-66: Cross-LLM Options Panel (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 3037 |
| **HTML ID/Class** | `#cross-llm-options` |
| **Description** | Expanded options (hidden by default) |
| **Styles** | `display: none;` |
| **Nested Elements** | S-67 through S-73 |

#### S-67: OpenRouter Warning Indicator
| Property | Value |
|----------|-------|
| **Line** | 3038-3041 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Warning about API key requirement |
| **Content** | "Requires OpenRouter API key in API Keys settings" |
| **Contains** | Yellow warning dot |

#### S-68: Bridge Script Card
| Property | Value |
|----------|-------|
| **Line** | 3043-3054 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Card for bridge script installation |
| **Styles** | `background: var(--bg-secondary); border: 1px solid var(--border);` |
| **Nested Elements** | S-69 through S-72 |

##### S-69: Bridge Script Title
| Property | Value |
|----------|-------|
| **Line** | 3044 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Card title |
| **Content** | "🔧 Cross-LLM Bridge Script" |

##### S-70: Bridge Script Description
| Property | Value |
|----------|-------|
| **Line** | 3045-3047 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Script explanation |
| **Content** | "This script enables Claude CLI to route requests..." |

##### S-71: Install Bridge Script Button
| Property | Value |
|----------|-------|
| **Line** | 3049-3051 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Description** | Button to install script |
| **Content** | "🚀 Install Bridge Script" |
| **Event** | `onclick="alert('Installing cross-LLM bridge script...')"` |

##### S-72: Bridge Script Status
| Property | Value |
|----------|-------|
| **Line** | 3052 |
| **HTML ID/Class** | (span) |
| **Description** | Installation status |
| **Content** | "Status: Not installed" |

#### S-73: Usage Tips Box
| Property | Value |
|----------|-------|
| **Line** | 3056-3061 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Yellow info box with usage examples |
| **Content** | Usage examples for cross-LLM commands |
| **Styles** | `background: rgba(234, 179, 8, 0.1); border-left: 3px solid var(--warning);` |

---

### S-74: Subscription Note Box
| Property | Value |
|----------|-------|
| **Line** | 3065-3069 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Blue info box about pricing |
| **Content** | "Note: Your Anthropic subscription provides unlimited access to Claude models..." |
| **Styles** | `background: rgba(59, 130, 246, 0.1); border-left: 3px solid var(--primary);` |

---

## SECTION 5: API KEYS (Lines 3073-3114)

### S-75: API Keys Section
| Property | Value |
|----------|-------|
| **Line** | 3073 |
| **HTML ID/Class** | `#settings-apikeys` `.settings-section` |
| **Description** | API keys settings (hidden by default) |
| **Styles** | `display: none;` |
| **Nested Elements** | S-76 through S-97 |

#### S-76: Section Title
| Property | Value |
|----------|-------|
| **Line** | 3074 |
| **HTML ID/Class** | `.settings-section-title` (h2) |
| **Description** | Section heading |
| **Content** | "API Keys" |

#### S-77: Section Description
| Property | Value |
|----------|-------|
| **Line** | 3075 |
| **HTML ID/Class** | `.settings-section-desc` (p) |
| **Description** | Section explanation |
| **Content** | "Connect your API keys to access different LLM providers..." |

---

### S-78: OpenRouter API Key Item
| Property | Value |
|----------|-------|
| **Line** | 3077 |
| **HTML ID/Class** | `.api-key-item` |
| **Description** | OpenRouter key row |
| **Nested Elements** | S-79 through S-84 |

#### S-79: OpenRouter Icon
| Property | Value |
|----------|-------|
| **Line** | 3078 |
| **HTML ID/Class** | `.api-key-icon` |
| **Description** | Orange diamond icon |
| **Content** | 🔶 |
| **Styles** | `background: rgba(249, 115, 22, 0.2);` |

#### S-80: OpenRouter Info Container
| Property | Value |
|----------|-------|
| **Line** | 3079 |
| **HTML ID/Class** | `.api-key-info` |
| **Description** | Name and status container |
| **Nested Elements** | S-81, S-82 |

##### S-81: OpenRouter Name
| Property | Value |
|----------|-------|
| **Line** | 3080 |
| **HTML ID/Class** | `.api-key-name` |
| **Description** | Provider name |
| **Content** | "OpenRouter" |

##### S-82: OpenRouter Status
| Property | Value |
|----------|-------|
| **Line** | 3081 |
| **HTML ID/Class** | `.api-key-status.connected` |
| **Description** | Connection status with masked key |
| **Content** | "● Connected - sk-or-v1-****7x9f" |

#### S-83: OpenRouter Actions Container
| Property | Value |
|----------|-------|
| **Line** | 3083 |
| **HTML ID/Class** | `.api-key-actions` |
| **Description** | Action buttons container |
| **Nested Elements** | S-84, S-85 |

##### S-84: OpenRouter Edit Button
| Property | Value |
|----------|-------|
| **Line** | 3084 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Edit key button |
| **Content** | "Edit" |

##### S-85: OpenRouter Remove Button
| Property | Value |
|----------|-------|
| **Line** | 3085 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Remove key button |
| **Content** | "Remove" |

---

### S-86: Anthropic API Key Item (Disabled)
| Property | Value |
|----------|-------|
| **Line** | 3089 |
| **HTML ID/Class** | `.api-key-item` |
| **Description** | Anthropic key row (coming soon) |
| **Styles** | `opacity: 0.6;` |
| **Nested Elements** | S-87 through S-91 |

#### S-87: Anthropic Icon
| Property | Value |
|----------|-------|
| **Line** | 3090 |
| **HTML ID/Class** | `.api-key-icon` |
| **Description** | Red circle icon |
| **Content** | 🔴 |
| **Styles** | `background: rgba(239, 68, 68, 0.2);` |

#### S-88: Anthropic Name
| Property | Value |
|----------|-------|
| **Line** | 3092 |
| **HTML ID/Class** | `.api-key-name` |
| **Description** | Provider name |
| **Content** | "Anthropic (Claude)" |

#### S-89: Anthropic Status
| Property | Value |
|----------|-------|
| **Line** | 3093 |
| **HTML ID/Class** | `.api-key-status` |
| **Description** | Coming soon status |
| **Content** | "🚧 Coming Soon" |
| **Styles** | `color: var(--warning);` |

#### S-90: Anthropic Hint Text
| Property | Value |
|----------|-------|
| **Line** | 3096 |
| **HTML ID/Class** | (span) |
| **Description** | Alternative suggestion |
| **Content** | "Use Subscription instead" |

---

### S-91: Google API Key Item (Disabled)
| Property | Value |
|----------|-------|
| **Line** | 3100 |
| **HTML ID/Class** | `.api-key-item` |
| **Description** | Google key row (coming soon) |
| **Styles** | `opacity: 0.6;` |
| **Nested Elements** | S-92 through S-96 |

#### S-92: Google Icon
| Property | Value |
|----------|-------|
| **Line** | 3101 |
| **HTML ID/Class** | `.api-key-icon` |
| **Description** | Blue circle icon |
| **Content** | 🔵 |
| **Styles** | `background: rgba(59, 130, 246, 0.2);` |

#### S-93: Google Name
| Property | Value |
|----------|-------|
| **Line** | 3103 |
| **HTML ID/Class** | `.api-key-name` |
| **Description** | Provider name |
| **Content** | "Google (Gemini)" |

#### S-94: Google Status
| Property | Value |
|----------|-------|
| **Line** | 3104 |
| **HTML ID/Class** | `.api-key-status` |
| **Description** | Coming soon status |
| **Content** | "🚧 Coming Soon" |

#### S-95: Google Hint Text
| Property | Value |
|----------|-------|
| **Line** | 3107 |
| **HTML ID/Class** | (span) |
| **Description** | Development status |
| **Content** | "In development" |

---

### S-96: Add Provider Button
| Property | Value |
|----------|-------|
| **Line** | 3111-3113 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Button to add new provider |
| **Content** | "➕ Add Another Provider" |
| **Styles** | `margin-top: 16px;` |

---

## SECTION 6: DEFAULT MODEL (Lines 3117-3147)

### S-97: Default Model Section
| Property | Value |
|----------|-------|
| **Line** | 3117 |
| **HTML ID/Class** | `#settings-model` `.settings-section` |
| **Description** | Default model settings (hidden) |
| **Styles** | `display: none;` |
| **Nested Elements** | S-98 through S-107 |

#### S-98: Section Title
| Property | Value |
|----------|-------|
| **Line** | 3118 |
| **HTML ID/Class** | `.settings-section-title` (h2) |
| **Description** | Section heading |
| **Content** | "Default Model" |

#### S-99: Section Description
| Property | Value |
|----------|-------|
| **Line** | 3119 |
| **HTML ID/Class** | `.settings-section-desc` (p) |
| **Description** | Section explanation |
| **Content** | "Choose the default AI model for new projects..." |

---

### S-100: Model Select Group
| Property | Value |
|----------|-------|
| **Line** | 3121 |
| **HTML ID/Class** | `.model-select-group` |
| **Description** | Container for select and save button |
| **Nested Elements** | S-101, S-106 |

#### S-101: Model Select Dropdown
| Property | Value |
|----------|-------|
| **Line** | 3122 |
| **HTML ID/Class** | `.model-select` (select) |
| **Description** | Model selection dropdown |
| **Nested Elements** | S-102, S-103, S-104 |

##### S-102: Anthropic Option Group
| Property | Value |
|----------|-------|
| **Line** | 3123-3129 |
| **HTML ID/Class** | (optgroup) |
| **Description** | Anthropic models group |
| **Label** | "Anthropic (Subscription - Included)" |
| **Options** | Claude Opus 4.5 (selected), Claude Sonnet 4.5, Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku |

##### S-103: OpenRouter Option Group
| Property | Value |
|----------|-------|
| **Line** | 3130-3134 |
| **HTML ID/Class** | (optgroup) |
| **Description** | OpenRouter models group |
| **Label** | "OpenRouter (Paid - Requires API Key)" |
| **Options** | GPT-4o, GPT-4 Turbo, GPT-5.2 Codex |

##### S-104: Google Option Group
| Property | Value |
|----------|-------|
| **Line** | 3135-3137 |
| **HTML ID/Class** | (optgroup) |
| **Description** | Google models group |
| **Label** | "Google (Coming Soon)" |
| **Options** | Gemini Pro — Coming Soon (disabled) |

#### S-105: Save Model Button
| Property | Value |
|----------|-------|
| **Line** | 3139 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Description** | Save selection button |
| **Content** | "Save" |

---

### S-106: Model Tip Box
| Property | Value |
|----------|-------|
| **Line** | 3142-3146 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Yellow tip box about pricing |
| **Content** | "💡 Tip: Claude models are free with your Anthropic subscription..." |
| **Styles** | `background: rgba(234, 179, 8, 0.1); border-left: 3px solid var(--warning);` |

---

## SECTION 7: VPS CONNECTIONS (Lines 3150-3159)

### S-107: VPS Section
| Property | Value |
|----------|-------|
| **Line** | 3150 |
| **HTML ID/Class** | `#settings-vps` `.settings-section` |
| **Description** | VPS connections settings (hidden) |
| **Styles** | `display: none;` |
| **Nested Elements** | S-108 through S-113 |

#### S-108: Section Title
| Property | Value |
|----------|-------|
| **Line** | 3151 |
| **HTML ID/Class** | `.settings-section-title` (h2) |
| **Description** | Section heading |
| **Content** | "VPS Connections" |

#### S-109: Section Description
| Property | Value |
|----------|-------|
| **Line** | 3152 |
| **HTML ID/Class** | `.settings-section-desc` (p) |
| **Description** | Section explanation |
| **Content** | "Manage your VPS and remote server connections." |

---

### S-110: VPS Empty State
| Property | Value |
|----------|-------|
| **Line** | 3154-3158 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Placeholder content for empty state |
| **Styles** | `text-align: center; padding: 40px;` |
| **Nested Elements** | S-111, S-112, S-113 |

#### S-111: VPS Icon
| Property | Value |
|----------|-------|
| **Line** | 3155 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Computer emoji |
| **Content** | 🖥️ |
| **Styles** | `font-size: 48px;` |

#### S-112: VPS Message
| Property | Value |
|----------|-------|
| **Line** | 3156 |
| **HTML ID/Class** | (p) |
| **Description** | Instructions text |
| **Content** | "Configure VPS connections in Create Project" |

#### S-113: Add VPS Button
| Property | Value |
|----------|-------|
| **Line** | 3157 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Description** | Button to add VPS |
| **Content** | "Add VPS Connection" |
| **Event** | `onclick="showView('create-project')"` |

---

## SECTION 8: PROFILE (Lines 3162-3207)

### S-114: Profile Section
| Property | Value |
|----------|-------|
| **Line** | 3162 |
| **HTML ID/Class** | `#settings-profile` `.settings-section` |
| **Description** | Profile settings (hidden) |
| **Styles** | `display: none;` |
| **Nested Elements** | S-115 through S-136 |

#### S-115: Section Title
| Property | Value |
|----------|-------|
| **Line** | 3163 |
| **HTML ID/Class** | `.settings-section-title` (h2) |
| **Description** | Section heading |
| **Content** | "Profile" |

#### S-116: Section Description
| Property | Value |
|----------|-------|
| **Line** | 3164 |
| **HTML ID/Class** | `.settings-section-desc` (p) |
| **Description** | Section explanation |
| **Content** | "Manage your profile information and preferences." |

---

### S-117: Profile Card
| Property | Value |
|----------|-------|
| **Line** | 3166 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Profile information card |
| **Styles** | `background: var(--bg-tertiary); border-radius: 12px; padding: 24px;` |
| **Nested Elements** | S-118 through S-136 |

---

### S-118: Profile Header Container
| Property | Value |
|----------|-------|
| **Line** | 3167 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with avatar and info |
| **Nested Elements** | S-119 through S-124 |

#### S-119: Large Avatar
| Property | Value |
|----------|-------|
| **Line** | 3168 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Large profile avatar |
| **Content** | "AE" |
| **Styles** | `width: 80px; height: 80px; background: var(--primary); border-radius: 50%;` |

#### S-120: Profile Name Display
| Property | Value |
|----------|-------|
| **Line** | 3170 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Display name |
| **Content** | "Alex Engineer" |
| **Styles** | `font-size: 20px; font-weight: 600;` |

#### S-121: Profile Email Display
| Property | Value |
|----------|-------|
| **Line** | 3171 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Email address |
| **Content** | "[email protected]" |

#### S-122: Pro Account Badge
| Property | Value |
|----------|-------|
| **Line** | 3172 |
| **HTML ID/Class** | (span) |
| **Description** | Account tier badge |
| **Content** | "PRO ACCOUNT" |
| **Styles** | `background: var(--primary); color: white; padding: 4px 8px; border-radius: 4px;` |

#### S-123: Change Photo Button
| Property | Value |
|----------|-------|
| **Line** | 3174 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Button to change profile photo |
| **Content** | "Change Photo" |
| **Styles** | `margin-left: auto;` |

---

### S-124: Profile Form Grid
| Property | Value |
|----------|-------|
| **Line** | 3177 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Form fields container |
| **Styles** | `display: grid; gap: 16px;` |
| **Nested Elements** | S-125 through S-135 |

---

#### S-125: Display Name Field Container
| Property | Value |
|----------|-------|
| **Line** | 3178 |
| **HTML ID/Class** | (div) |
| **Description** | Display name form field |
| **Nested Elements** | S-126, S-127 |

##### S-126: Display Name Label
| Property | Value |
|----------|-------|
| **Line** | 3179 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "Display Name" |

##### S-127: Display Name Input
| Property | Value |
|----------|-------|
| **Line** | 3180 |
| **HTML ID/Class** | (input type="text") |
| **Description** | Text input for name |
| **Value** | "Alex Engineer" |

---

#### S-128: AI Alias Field Container
| Property | Value |
|----------|-------|
| **Line** | 3183 |
| **HTML ID/Class** | (div) |
| **Description** | AI assistant alias form field |
| **Nested Elements** | S-129, S-130, S-131 |

##### S-129: AI Alias Label
| Property | Value |
|----------|-------|
| **Line** | 3184 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "AI Assistant Alias" |

##### S-130: AI Alias Input
| Property | Value |
|----------|-------|
| **Line** | 3185 |
| **HTML ID/Class** | (input type="text") |
| **Description** | Text input for AI name |
| **Value** | "Claude" |
| **Placeholder** | "e.g., Claude, Cortana, Jarvis..." |

##### S-131: AI Alias Help Text
| Property | Value |
|----------|-------|
| **Line** | 3186 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Helper text |
| **Content** | "What should the AI call itself when responding?" |

---

#### S-132: Email Field Container
| Property | Value |
|----------|-------|
| **Line** | 3189 |
| **HTML ID/Class** | (div) |
| **Description** | Email form field |
| **Nested Elements** | S-133, S-134 |

##### S-133: Email Label
| Property | Value |
|----------|-------|
| **Line** | 3190 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "Email" |

##### S-134: Email Input
| Property | Value |
|----------|-------|
| **Line** | 3191 |
| **HTML ID/Class** | (input type="email") |
| **Description** | Email input |
| **Value** | "alex@example.com" |

---

#### S-135: Timezone Field Container
| Property | Value |
|----------|-------|
| **Line** | 3194 |
| **HTML ID/Class** | (div) |
| **Description** | Timezone form field |
| **Nested Elements** | S-136, S-137 |

##### S-136: Timezone Label
| Property | Value |
|----------|-------|
| **Line** | 3195 |
| **HTML ID/Class** | (label) |
| **Description** | Field label |
| **Content** | "Timezone" |

##### S-137: Timezone Select
| Property | Value |
|----------|-------|
| **Line** | 3196-3201 |
| **HTML ID/Class** | (select) |
| **Description** | Timezone dropdown |
| **Options** | America/Los_Angeles (PST), America/New_York (EST), Europe/London (GMT), Asia/Tokyo (JST) |

---

### S-138: Save Profile Button
| Property | Value |
|----------|-------|
| **Line** | 3205 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Description** | Save profile changes button |
| **Content** | "Save Profile" |
| **Styles** | `margin-top: 20px;` |

---

## SECTION 9: APPEARANCE (Lines 3210-3258)

### S-139: Appearance Section
| Property | Value |
|----------|-------|
| **Line** | 3210 |
| **HTML ID/Class** | `#settings-appearance` `.settings-section` |
| **Description** | Appearance settings (hidden) |
| **Styles** | `display: none;` |
| **Nested Elements** | S-140 through S-161 |

#### S-140: Section Title
| Property | Value |
|----------|-------|
| **Line** | 3211 |
| **HTML ID/Class** | `.settings-section-title` (h2) |
| **Description** | Section heading |
| **Content** | "Appearance" |

#### S-141: Section Description
| Property | Value |
|----------|-------|
| **Line** | 3212 |
| **HTML ID/Class** | `.settings-section-desc` (p) |
| **Description** | Section explanation |
| **Content** | "Customize the look and feel of HubLLM." |

---

### S-142: Appearance Card
| Property | Value |
|----------|-------|
| **Line** | 3214 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Appearance options card |
| **Styles** | `background: var(--bg-tertiary); border-radius: 12px; padding: 24px;` |
| **Nested Elements** | S-143 through S-161 |

---

### S-143: Theme Section
| Property | Value |
|----------|-------|
| **Line** | 3215 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Theme selection area |
| **Nested Elements** | S-144 through S-152 |

#### S-144: Theme Label
| Property | Value |
|----------|-------|
| **Line** | 3216 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Section label |
| **Content** | "Theme" |
| **Styles** | `font-weight: 500;` |

#### S-145: Theme Options Container
| Property | Value |
|----------|-------|
| **Line** | 3217 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Container for theme options |
| **Styles** | `display: flex; gap: 12px;` |
| **Nested Elements** | S-146, S-149, S-152 |

---

##### S-146: Dark Mode Option (Active)
| Property | Value |
|----------|-------|
| **Line** | 3218-3222 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Dark mode theme option (active) |
| **Styles** | `background: #1a1a2e; border: 2px solid var(--primary);` |
| **Nested Elements** | S-147, S-148 |

###### S-147: Dark Mode Icon
| Property | Value |
|----------|-------|
| **Line** | 3219 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Moon emoji |
| **Content** | 🌙 |

###### S-148: Dark Mode Label + Status
| Property | Value |
|----------|-------|
| **Line** | 3220-3221 |
| **HTML ID/Class** | (inline styled divs) |
| **Description** | Label and status |
| **Content** | "Dark Mode" / "Active" |

---

##### S-149: Light Mode Option
| Property | Value |
|----------|-------|
| **Line** | 3223-3227 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Light mode theme option |
| **Styles** | `background: #f5f5f5; border: 2px solid var(--border); color: #333;` |
| **Nested Elements** | S-150, S-151 |

###### S-150: Light Mode Icon
| Property | Value |
|----------|-------|
| **Line** | 3224 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Sun emoji |
| **Content** | ☀️ |

###### S-151: Light Mode Label + Status
| Property | Value |
|----------|-------|
| **Line** | 3225-3226 |
| **HTML ID/Class** | (inline styled divs) |
| **Description** | Label and status |
| **Content** | "Light Mode" / "Click to activate" |

---

##### S-152: System Theme Option
| Property | Value |
|----------|-------|
| **Line** | 3228-3232 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | System theme option |
| **Styles** | `background: linear-gradient(135deg, #1a1a2e 50%, #f5f5f5 50%);` |
| **Nested Elements** | S-153, S-154 |

###### S-153: System Icon
| Property | Value |
|----------|-------|
| **Line** | 3229 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Computer emoji |
| **Content** | 💻 |

###### S-154: System Label + Status
| Property | Value |
|----------|-------|
| **Line** | 3230-3231 |
| **HTML ID/Class** | (inline styled divs) |
| **Description** | Label and status |
| **Content** | "System" / "Match OS" |

---

### S-155: Toggle Options Section
| Property | Value |
|----------|-------|
| **Line** | 3236 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle switches section |
| **Styles** | `border-top: 1px solid var(--border); padding-top: 20px;` |
| **Nested Elements** | S-156 through S-161 |

---

#### S-156: Compact Mode Row
| Property | Value |
|----------|-------|
| **Line** | 3237-3245 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Compact mode toggle row |
| **Nested Elements** | S-157, S-158, S-159 |

##### S-157: Compact Mode Label
| Property | Value |
|----------|-------|
| **Line** | 3239 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle label |
| **Content** | "Compact Mode" |

##### S-158: Compact Mode Description
| Property | Value |
|----------|-------|
| **Line** | 3240 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle description |
| **Content** | "Reduce spacing for more content" |

##### S-159: Compact Mode Toggle (Off)
| Property | Value |
|----------|-------|
| **Line** | 3242-3244 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle switch (off state) |
| **Styles** | `width: 48px; height: 28px; background: var(--bg-secondary);` |
| **Contains** | Toggle knob positioned left |

---

#### S-160: Line Numbers Row
| Property | Value |
|----------|-------|
| **Line** | 3247-3255 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Line numbers toggle row |
| **Nested Elements** | S-161, S-162, S-163 |

##### S-161: Line Numbers Label
| Property | Value |
|----------|-------|
| **Line** | 3249 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle label |
| **Content** | "Show Line Numbers" |

##### S-162: Line Numbers Description
| Property | Value |
|----------|-------|
| **Line** | 3250 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle description |
| **Content** | "Display line numbers in code blocks" |

##### S-163: Line Numbers Toggle (On)
| Property | Value |
|----------|-------|
| **Line** | 3252-3254 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle switch (on state) |
| **Styles** | `width: 48px; height: 28px; background: var(--primary);` |
| **Contains** | Toggle knob positioned right |

---

## SECTION 10: VOICE INPUT (Lines 3261-3274)

### S-164: Voice Input Section
| Property | Value |
|----------|-------|
| **Line** | 3261 |
| **HTML ID/Class** | `#settings-voice` `.settings-section` |
| **Description** | Voice input settings (hidden) |
| **Styles** | `display: none;` |
| **Nested Elements** | S-165 through S-171 |

#### S-165: Section Title
| Property | Value |
|----------|-------|
| **Line** | 3262 |
| **HTML ID/Class** | `.settings-section-title` (h2) |
| **Description** | Section heading |
| **Content** | "Voice Input (Whisper)" |

#### S-166: Section Description
| Property | Value |
|----------|-------|
| **Line** | 3263 |
| **HTML ID/Class** | `.settings-section-desc` (p) |
| **Description** | Section explanation |
| **Content** | "Enable voice-to-text for prompts using OpenAI Whisper." |

---

### S-167: Voice Toggle Row
| Property | Value |
|----------|-------|
| **Line** | 3265-3273 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Voice input toggle container |
| **Styles** | `padding: 16px; background: var(--bg-tertiary); border-radius: 8px;` |
| **Nested Elements** | S-168, S-169, S-170 |

#### S-168: Voice Toggle Label
| Property | Value |
|----------|-------|
| **Line** | 3267 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle label |
| **Content** | "Enable Voice Input" |

#### S-169: Voice Toggle Description
| Property | Value |
|----------|-------|
| **Line** | 3268 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle description |
| **Content** | "Use microphone to speak your prompts" |

#### S-170: Voice Toggle (On)
| Property | Value |
|----------|-------|
| **Line** | 3270-3272 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle switch (on state) |
| **Styles** | `width: 48px; height: 28px; background: var(--primary);` |
| **Contains** | Toggle knob positioned right |

---

## SECTION 11: GLOBAL AGENTS (Lines 3277-3429)

### S-171: Global Agents Section
| Property | Value |
|----------|-------|
| **Line** | 3277 |
| **HTML ID/Class** | `#settings-globalagents` `.settings-section` |
| **Description** | Global agents settings (hidden) |
| **Styles** | `display: none;` |
| **Nested Elements** | S-172 through S-220 |

#### S-172: Section Title
| Property | Value |
|----------|-------|
| **Line** | 3278 |
| **HTML ID/Class** | `.settings-section-title` (h2) |
| **Description** | Section heading |
| **Content** | "Global Agents" |

#### S-173: Section Description
| Property | Value |
|----------|-------|
| **Line** | 3279 |
| **HTML ID/Class** | `.settings-section-desc` (p) |
| **Description** | Section explanation |
| **Content** | "Define reusable agents available across all your projects..." |

---

### S-174: Agent Help Expandable Section
| Property | Value |
|----------|-------|
| **Line** | 3282 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Expandable help section container |
| **Nested Elements** | S-175 through S-183 |

#### S-175: Agent Help Toggle
| Property | Value |
|----------|-------|
| **Line** | 3283 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Clickable toggle header |
| **Event** | `onclick="toggleSettingsAgentHelp()"` |
| **Nested Elements** | S-176, S-177 |

##### S-176: Agent Help Chevron
| Property | Value |
|----------|-------|
| **Line** | 3284 |
| **HTML ID/Class** | `#settings-agent-help-chevron` |
| **Description** | Expand/collapse indicator |
| **Content** | ▶ |

##### S-177: Agent Help Link Text
| Property | Value |
|----------|-------|
| **Line** | 3285 |
| **HTML ID/Class** | (span) |
| **Description** | Help link text |
| **Content** | "What are Agents? How do they work?" |
| **Styles** | `color: var(--primary);` |

#### S-178: Agent Help Content (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 3287 |
| **HTML ID/Class** | `#settings-agent-help-content` |
| **Description** | Expanded help content |
| **Styles** | `display: none;` |
| **Nested Elements** | S-179 through S-183 |

##### S-179: Agent Help Intro Text
| Property | Value |
|----------|-------|
| **Line** | 3288-3290 |
| **HTML ID/Class** | (p) |
| **Description** | Introduction paragraph |
| **Content** | "Agents are specialized AI assistants with defined roles..." |

##### S-180: Agent Diagram Container
| Property | Value |
|----------|-------|
| **Line** | 3292-3317 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Visual diagram showing agent workflow |
| **Styles** | `background: var(--bg-tertiary);` |
| **Content** | Flow: You → @agent-name → Agent → performs → Task |

##### S-181: Agent Example Code
| Property | Value |
|----------|-------|
| **Line** | 3320 |
| **HTML ID/Class** | (code) |
| **Description** | Usage example |
| **Content** | "@code-reviewer check src/api/users.js" |

##### S-182: Agent Components List
| Property | Value |
|----------|-------|
| **Line** | 3323-3328 |
| **HTML ID/Class** | (ul) |
| **Description** | List of agent components |
| **Content** | Name, Description, Tools, Model |

---

### S-183: Agents List Card
| Property | Value |
|----------|-------|
| **Line** | 3333 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Container for agents list |
| **Styles** | `background: var(--bg-tertiary); border-radius: 12px; padding: 20px;` |
| **Nested Elements** | S-184 through S-216 |

#### S-184: Agents List Header
| Property | Value |
|----------|-------|
| **Line** | 3334-3337 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with title and create button |
| **Nested Elements** | S-185, S-186 |

##### S-185: Agents List Title
| Property | Value |
|----------|-------|
| **Line** | 3335 |
| **HTML ID/Class** | (span) |
| **Description** | List title |
| **Content** | "Your Global Agents" |

##### S-186: Create Agent Button
| Property | Value |
|----------|-------|
| **Line** | 3336 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Description** | Button to create new agent |
| **Content** | "+ Create Agent" |
| **Event** | `onclick="showAgentModal()"` |

---

### S-187: Agent Item - code-reviewer
| Property | Value |
|----------|-------|
| **Line** | 3340 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Code reviewer agent card |
| **Styles** | `background: var(--bg-secondary); border: 1px solid var(--border);` |
| **Nested Elements** | S-188 through S-197 |

#### S-188: code-reviewer Icon Container
| Property | Value |
|----------|-------|
| **Line** | 3342 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Blue icon container |
| **Styles** | `background: rgba(59, 130, 246, 0.2);` |
| **Contains** | Document SVG icon |

#### S-189: code-reviewer Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 3343-3348 |
| **HTML ID/Class** | (svg) |
| **Description** | Document icon |
| **Size** | 20x20 |
| **Styles** | `color: var(--primary);` |

#### S-190: code-reviewer Info Container
| Property | Value |
|----------|-------|
| **Line** | 3350 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Agent details container |
| **Nested Elements** | S-191, S-192, S-193 |

##### S-191: code-reviewer Name
| Property | Value |
|----------|-------|
| **Line** | 3351 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Agent name |
| **Content** | "code-reviewer" |

##### S-192: code-reviewer Description
| Property | Value |
|----------|-------|
| **Line** | 3352 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Agent description |
| **Content** | "Reviews code for quality, security, and best practices..." |

##### S-193: code-reviewer Tags Container
| Property | Value |
|----------|-------|
| **Line** | 3353-3356 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Tag badges container |
| **Nested Elements** | S-194, S-195 |

###### S-194: code-reviewer Tools Tag
| Property | Value |
|----------|-------|
| **Line** | 3354 |
| **HTML ID/Class** | (span) |
| **Description** | Tools capability tag |
| **Content** | "Read-only tools" |

###### S-195: code-reviewer Model Tag
| Property | Value |
|----------|-------|
| **Line** | 3355 |
| **HTML ID/Class** | (span) |
| **Description** | Model tag |
| **Content** | "Model: Sonnet" |

#### S-196: code-reviewer Actions Container
| Property | Value |
|----------|-------|
| **Line** | 3358 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Action controls container |
| **Nested Elements** | S-197, S-198, S-199 |

##### S-197: code-reviewer Active Toggle
| Property | Value |
|----------|-------|
| **Line** | 3360-3362 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle switch (on) |
| **Styles** | `background: var(--success);` |
| **Event** | `onclick="this.classList.toggle('inactive')"` |

##### S-198: code-reviewer Edit Button
| Property | Value |
|----------|-------|
| **Line** | 3363 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Edit button |
| **Content** | "Edit" |
| **Event** | `onclick="showAgentModal(true, {...})"` |

##### S-199: code-reviewer Remove Button
| Property | Value |
|----------|-------|
| **Line** | 3364 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Remove button |
| **Content** | "Remove" |

---

### S-200: Agent Item - security-audit
| Property | Value |
|----------|-------|
| **Line** | 3370 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Security audit agent card |
| **Styles** | `background: var(--bg-secondary);` |
| **Nested Elements** | S-201 through S-210 |

#### S-201: security-audit Icon Container
| Property | Value |
|----------|-------|
| **Line** | 3372 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Red icon container |
| **Styles** | `background: rgba(239, 68, 68, 0.2);` |
| **Contains** | Shield SVG icon |

#### S-202: security-audit Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 3373-3375 |
| **HTML ID/Class** | (svg) |
| **Description** | Shield icon |
| **Size** | 20x20 |
| **Styles** | `color: #ef4444;` |

#### S-203: security-audit Name
| Property | Value |
|----------|-------|
| **Line** | 3378 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Agent name |
| **Content** | "security-audit" |

#### S-204: security-audit Description
| Property | Value |
|----------|-------|
| **Line** | 3379 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Agent description |
| **Content** | "Scans code for vulnerabilities, checks dependencies..." |

#### S-205: security-audit Tools Tag
| Property | Value |
|----------|-------|
| **Line** | 3381 |
| **HTML ID/Class** | (span) |
| **Description** | Tools tag |
| **Content** | "Read-only tools" |

#### S-206: security-audit Model Tag
| Property | Value |
|----------|-------|
| **Line** | 3382 |
| **HTML ID/Class** | (span) |
| **Description** | Model tag |
| **Content** | "Model: Opus" |

#### S-207: security-audit Active Toggle
| Property | Value |
|----------|-------|
| **Line** | 3386-3388 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle switch (on) |
| **Styles** | `background: var(--success);` |

#### S-208: security-audit Edit Button
| Property | Value |
|----------|-------|
| **Line** | 3389 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Edit button |
| **Content** | "Edit" |

#### S-209: security-audit Remove Button
| Property | Value |
|----------|-------|
| **Line** | 3390 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Remove button |
| **Content** | "Remove" |

---

### S-210: Agent Item - test-writer
| Property | Value |
|----------|-------|
| **Line** | 3396 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Test writer agent card |
| **Styles** | `background: var(--bg-secondary);` |
| **Nested Elements** | S-211 through S-220 |

#### S-211: test-writer Icon Container
| Property | Value |
|----------|-------|
| **Line** | 3398 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Green icon container |
| **Styles** | `background: rgba(34, 197, 94, 0.2);` |
| **Contains** | Checkmark document SVG |

#### S-212: test-writer Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 3399-3403 |
| **HTML ID/Class** | (svg) |
| **Description** | Document with checkmark icon |
| **Size** | 20x20 |
| **Styles** | `color: #22c55e;` |

#### S-213: test-writer Name
| Property | Value |
|----------|-------|
| **Line** | 3406 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Agent name |
| **Content** | "test-writer" |

#### S-214: test-writer Description
| Property | Value |
|----------|-------|
| **Line** | 3407 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Agent description |
| **Content** | "Generates unit tests, integration tests, and test fixtures..." |

#### S-215: test-writer Tools Tag
| Property | Value |
|----------|-------|
| **Line** | 3409 |
| **HTML ID/Class** | (span) |
| **Description** | Tools tag |
| **Content** | "All tools" |

#### S-216: test-writer Model Tag
| Property | Value |
|----------|-------|
| **Line** | 3410 |
| **HTML ID/Class** | (span) |
| **Description** | Model tag |
| **Content** | "Model: Sonnet" |

#### S-217: test-writer Active Toggle
| Property | Value |
|----------|-------|
| **Line** | 3414-3416 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle switch (on) |
| **Styles** | `background: var(--success);` |

#### S-218: test-writer Edit Button
| Property | Value |
|----------|-------|
| **Line** | 3417 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Edit button |
| **Content** | "Edit" |

#### S-219: test-writer Remove Button
| Property | Value |
|----------|-------|
| **Line** | 3418 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Remove button |
| **Content** | "Remove" |

---

### S-220: Agents Tip Box
| Property | Value |
|----------|-------|
| **Line** | 3424-3428 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Blue tip box |
| **Content** | "💡 Tip: Global agents are automatically converted to the correct format..." |
| **Styles** | `background: rgba(59, 130, 246, 0.1); border-left: 3px solid var(--primary);` |

---

## SECTION 12: GLOBAL SKILLS (Lines 3432-3499)

### S-221: Global Skills Section
| Property | Value |
|----------|-------|
| **Line** | 3432 |
| **HTML ID/Class** | `#settings-globalskills` `.settings-section` |
| **Description** | Global skills settings (hidden) |
| **Styles** | `display: none;` |
| **Nested Elements** | S-222 through S-253 |

#### S-222: Section Title
| Property | Value |
|----------|-------|
| **Line** | 3433 |
| **HTML ID/Class** | `.settings-section-title` (h2) |
| **Description** | Section heading |
| **Content** | "Global Skills" |

#### S-223: Section Description
| Property | Value |
|----------|-------|
| **Line** | 3434 |
| **HTML ID/Class** | `.settings-section-desc` (p) |
| **Description** | Section explanation |
| **Content** | "Skills are reusable task modules that teach the AI specific workflows..." |

---

### S-224: Skills List Card
| Property | Value |
|----------|-------|
| **Line** | 3436 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Container for skills list |
| **Styles** | `background: var(--bg-tertiary); border-radius: 12px; padding: 20px;` |
| **Nested Elements** | S-225 through S-253 |

#### S-225: Skills List Header
| Property | Value |
|----------|-------|
| **Line** | 3437-3442 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with title and buttons |
| **Nested Elements** | S-226, S-227, S-228 |

##### S-226: Skills List Title
| Property | Value |
|----------|-------|
| **Line** | 3438 |
| **HTML ID/Class** | (span) |
| **Description** | List title |
| **Content** | "Your Global Skills" |

##### S-227: Browse Registry Button
| Property | Value |
|----------|-------|
| **Line** | 3440 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Button to browse skill registry |
| **Content** | "Browse Registry" |

##### S-228: Create Skill Button
| Property | Value |
|----------|-------|
| **Line** | 3441 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Description** | Button to create new skill |
| **Content** | "+ Create Skill" |
| **Event** | `onclick="showSkillModal()"` |

---

### S-229: Skill Item - doc-generator
| Property | Value |
|----------|-------|
| **Line** | 3446 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Doc generator skill card |
| **Styles** | `background: var(--bg-secondary);` |
| **Nested Elements** | S-230 through S-237 |

#### S-230: doc-generator Icon Container
| Property | Value |
|----------|-------|
| **Line** | 3448 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Purple icon container |
| **Styles** | `background: rgba(168, 85, 247, 0.2);` |
| **Content** | 📝 |

#### S-231: doc-generator Name
| Property | Value |
|----------|-------|
| **Line** | 3450 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Skill name |
| **Content** | "doc-generator" |

#### S-232: doc-generator Description
| Property | Value |
|----------|-------|
| **Line** | 3451 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Skill description |
| **Content** | "Generates documentation from code including README, API docs..." |

#### S-233: doc-generator Installed Tag
| Property | Value |
|----------|-------|
| **Line** | 3453 |
| **HTML ID/Class** | (span) |
| **Description** | Status tag |
| **Content** | "Installed" |
| **Styles** | `background: rgba(34, 197, 94, 0.2); color: var(--success);` |

#### S-234: doc-generator Configure Button
| Property | Value |
|----------|-------|
| **Line** | 3457 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Configure button |
| **Content** | "Configure" |
| **Event** | `onclick="showSkillModal(true, {...})"` |

#### S-235: doc-generator Remove Button
| Property | Value |
|----------|-------|
| **Line** | 3458 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Remove button |
| **Content** | "Remove" |

---

### S-236: Skill Item - data-analysis
| Property | Value |
|----------|-------|
| **Line** | 3464 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Data analysis skill card |
| **Styles** | `background: var(--bg-secondary);` |
| **Nested Elements** | S-237 through S-244 |

#### S-237: data-analysis Icon Container
| Property | Value |
|----------|-------|
| **Line** | 3466 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Orange icon container |
| **Styles** | `background: rgba(249, 115, 22, 0.2);` |
| **Content** | 📊 |

#### S-238: data-analysis Name
| Property | Value |
|----------|-------|
| **Line** | 3468 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Skill name |
| **Content** | "data-analysis" |

#### S-239: data-analysis Description
| Property | Value |
|----------|-------|
| **Line** | 3469 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Skill description |
| **Content** | "Analyzes data files, generates reports, and creates visualizations." |

#### S-240: data-analysis Installed Tag
| Property | Value |
|----------|-------|
| **Line** | 3471 |
| **HTML ID/Class** | (span) |
| **Description** | Status tag |
| **Content** | "Installed" |

#### S-241: data-analysis Configure Button
| Property | Value |
|----------|-------|
| **Line** | 3475 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Configure button |
| **Content** | "Configure" |

#### S-242: data-analysis Remove Button
| Property | Value |
|----------|-------|
| **Line** | 3476 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Remove button |
| **Content** | "Remove" |

---

### S-243: Skill Item - frontend-design
| Property | Value |
|----------|-------|
| **Line** | 3482 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Frontend design skill card |
| **Styles** | `background: var(--bg-secondary);` |
| **Nested Elements** | S-244 through S-251 |

#### S-244: frontend-design Icon Container
| Property | Value |
|----------|-------|
| **Line** | 3484 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Blue icon container |
| **Styles** | `background: rgba(59, 130, 246, 0.2);` |
| **Content** | 🎨 |

#### S-245: frontend-design Name
| Property | Value |
|----------|-------|
| **Line** | 3486 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Skill name |
| **Content** | "frontend-design" |

#### S-246: frontend-design Description
| Property | Value |
|----------|-------|
| **Line** | 3487 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Skill description |
| **Content** | "Creates UI components, layouts, and responsive designs..." |

#### S-247: frontend-design Installed Tag
| Property | Value |
|----------|-------|
| **Line** | 3489 |
| **HTML ID/Class** | (span) |
| **Description** | Status tag |
| **Content** | "Installed" |

#### S-248: frontend-design Configure Button
| Property | Value |
|----------|-------|
| **Line** | 3493 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Configure button |
| **Content** | "Configure" |

#### S-249: frontend-design Remove Button
| Property | Value |
|----------|-------|
| **Line** | 3494 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Remove button |
| **Content** | "Remove" |

---

## SECTION 13: GLOBAL MCP SERVERS (Lines 3502-3678)

### S-250: Global MCP Section
| Property | Value |
|----------|-------|
| **Line** | 3502 |
| **HTML ID/Class** | `#settings-globalmcp` `.settings-section` |
| **Description** | Global MCP servers settings (hidden) |
| **Styles** | `display: none;` |
| **Nested Elements** | S-251 through S-298 |

#### S-251: Section Title Container
| Property | Value |
|----------|-------|
| **Line** | 3503 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Title with warning icon |
| **Nested Elements** | S-252, S-253 |

##### S-252: Section Title
| Property | Value |
|----------|-------|
| **Line** | 3504 |
| **HTML ID/Class** | `.settings-section-title` (h2) |
| **Description** | Section heading |
| **Content** | "Global MCP Servers" |

##### S-253: MCP Warning Icon
| Property | Value |
|----------|-------|
| **Line** | 3506 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Warning icon trigger |
| **Content** | ⚠️ |
| **Event** | `onclick="toggleSettingsMCPWarning()"` |

##### S-254: MCP Warning Tooltip (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 3508-3521 |
| **HTML ID/Class** | `#settings-mcp-warning-tooltip` |
| **Description** | Tooltip explaining context warning |
| **Styles** | `display: none; position: absolute;` |
| **Content** | Warning about context window usage |

#### S-255: Section Description
| Property | Value |
|----------|-------|
| **Line** | 3524 |
| **HTML ID/Class** | `.settings-section-desc` (p) |
| **Description** | Section explanation |
| **Content** | "MCP (Model Context Protocol) servers connect AI to external tools..." |

---

### S-256: MCP Help Expandable Section
| Property | Value |
|----------|-------|
| **Line** | 3527 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Expandable help section |
| **Nested Elements** | S-257 through S-265 |

#### S-257: MCP Help Toggle
| Property | Value |
|----------|-------|
| **Line** | 3528 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Clickable toggle header |
| **Event** | `onclick="toggleSettingsMCPHelp()"` |
| **Nested Elements** | S-258, S-259 |

##### S-258: MCP Help Chevron
| Property | Value |
|----------|-------|
| **Line** | 3529 |
| **HTML ID/Class** | `#settings-mcp-help-chevron` |
| **Description** | Expand/collapse indicator |
| **Content** | ▶ |

##### S-259: MCP Help Link Text
| Property | Value |
|----------|-------|
| **Line** | 3530 |
| **HTML ID/Class** | (span) |
| **Description** | Help link text |
| **Content** | "What is MCP? How does it work?" |
| **Styles** | `color: var(--primary);` |

#### S-260: MCP Help Content (Hidden)
| Property | Value |
|----------|-------|
| **Line** | 3532 |
| **HTML ID/Class** | `#settings-mcp-help-content` |
| **Description** | Expanded help content |
| **Styles** | `display: none;` |
| **Nested Elements** | S-261 through S-265 |

##### S-261: MCP Help Intro Text
| Property | Value |
|----------|-------|
| **Line** | 3533-3535 |
| **HTML ID/Class** | (p) |
| **Description** | Introduction paragraph |
| **Content** | "MCP (Model Context Protocol) is a universal standard..." |

##### S-262: MCP Diagram Container
| Property | Value |
|----------|-------|
| **Line** | 3537-3564 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Visual diagram showing MCP workflow |
| **Styles** | `background: var(--bg-tertiary);` |
| **Content** | Flow: Any LLM ↔ MCP Server ↔ External Services (GitHub, PostgreSQL, Slack) |

##### S-263: MCP Example Code
| Property | Value |
|----------|-------|
| **Line** | 3568 |
| **HTML ID/Class** | (code) |
| **Description** | Usage example |
| **Content** | "Show me all users who signed up this week" |

---

### S-264: MCP Servers List Card
| Property | Value |
|----------|-------|
| **Line** | 3575 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Container for MCP servers list |
| **Styles** | `background: var(--bg-tertiary); border-radius: 12px; padding: 20px;` |
| **Nested Elements** | S-265 through S-295 |

#### S-265: MCP List Header
| Property | Value |
|----------|-------|
| **Line** | 3576-3584 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Header with title, count, and buttons |
| **Nested Elements** | S-266, S-267, S-268, S-269 |

##### S-266: MCP List Title
| Property | Value |
|----------|-------|
| **Line** | 3578 |
| **HTML ID/Class** | (span) |
| **Description** | List title |
| **Content** | "Connected MCP Servers" |

##### S-267: MCP Active Count
| Property | Value |
|----------|-------|
| **Line** | 3579 |
| **HTML ID/Class** | (span) |
| **Description** | Active server count |
| **Content** | "3 active" |

##### S-268: Browse MCP Registry Button
| Property | Value |
|----------|-------|
| **Line** | 3582 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Button to browse registry |
| **Content** | "Browse Registry" |

##### S-269: Add MCP Server Button
| Property | Value |
|----------|-------|
| **Line** | 3583 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Description** | Button to add new server |
| **Content** | "+ Add Server" |
| **Event** | `onclick="showMCPModal()"` |

---

### S-270: MCP Item - GitHub
| Property | Value |
|----------|-------|
| **Line** | 3588 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | GitHub MCP server card |
| **Styles** | `background: var(--bg-secondary);` |
| **Nested Elements** | S-271 through S-279 |

#### S-271: GitHub Icon Container
| Property | Value |
|----------|-------|
| **Line** | 3590 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Dark icon container |
| **Styles** | `background: rgba(36, 41, 46, 1);` |
| **Contains** | GitHub logo SVG |

#### S-272: GitHub Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 3591-3593 |
| **HTML ID/Class** | (svg) |
| **Description** | GitHub logo |
| **Size** | 20x20 |
| **Fill** | white |

#### S-273: GitHub Name
| Property | Value |
|----------|-------|
| **Line** | 3596 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Server name |
| **Content** | "GitHub" |

#### S-274: GitHub Description
| Property | Value |
|----------|-------|
| **Line** | 3597 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Server description |
| **Content** | "Repository access, PR management, issues" |

#### S-275: GitHub Status
| Property | Value |
|----------|-------|
| **Line** | 3600 |
| **HTML ID/Class** | (span) |
| **Description** | Connection status |
| **Content** | "● Connected" |
| **Styles** | `color: var(--success);` |

#### S-276: GitHub Active Toggle
| Property | Value |
|----------|-------|
| **Line** | 3601-3603 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle switch (on) |
| **Styles** | `background: var(--success);` |

#### S-277: GitHub Configure Button
| Property | Value |
|----------|-------|
| **Line** | 3604 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Configure button |
| **Content** | "Configure" |
| **Event** | `onclick="showMCPModal(true, {...})"` |

#### S-278: GitHub Remove Button
| Property | Value |
|----------|-------|
| **Line** | 3605 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Remove button |
| **Content** | "Remove" |

---

### S-279: MCP Item - Slack
| Property | Value |
|----------|-------|
| **Line** | 3611 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Slack MCP server card |
| **Styles** | `background: var(--bg-secondary);` |
| **Nested Elements** | S-280 through S-288 |

#### S-280: Slack Icon Container
| Property | Value |
|----------|-------|
| **Line** | 3613 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Purple icon container |
| **Styles** | `background: rgba(74, 21, 75, 1);` |
| **Contains** | Chat bubble SVG |

#### S-281: Slack Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 3614-3616 |
| **HTML ID/Class** | (svg) |
| **Description** | Chat bubble icon |
| **Size** | 20x20 |
| **Stroke** | white |

#### S-282: Slack Name
| Property | Value |
|----------|-------|
| **Line** | 3619 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Server name |
| **Content** | "Slack" |

#### S-283: Slack Description
| Property | Value |
|----------|-------|
| **Line** | 3620 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Server description |
| **Content** | "Send messages, read channels, manage notifications" |

#### S-284: Slack Status
| Property | Value |
|----------|-------|
| **Line** | 3623 |
| **HTML ID/Class** | (span) |
| **Description** | Connection status |
| **Content** | "● Connected" |

#### S-285: Slack Active Toggle
| Property | Value |
|----------|-------|
| **Line** | 3624-3626 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle switch (on) |
| **Styles** | `background: var(--success);` |

#### S-286: Slack Configure Button
| Property | Value |
|----------|-------|
| **Line** | 3627 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Configure button |
| **Content** | "Configure" |

#### S-287: Slack Remove Button
| Property | Value |
|----------|-------|
| **Line** | 3628 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Remove button |
| **Content** | "Remove" |

---

### S-288: MCP Item - Google Drive
| Property | Value |
|----------|-------|
| **Line** | 3634 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Google Drive MCP server card |
| **Styles** | `background: var(--bg-secondary);` |
| **Nested Elements** | S-289 through S-297 |

#### S-289: Google Drive Icon Container
| Property | Value |
|----------|-------|
| **Line** | 3636 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Blue icon container |
| **Styles** | `background: rgba(66, 133, 244, 0.2);` |
| **Contains** | Folder SVG |

#### S-290: Google Drive Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 3637-3639 |
| **HTML ID/Class** | (svg) |
| **Description** | Folder icon |
| **Size** | 20x20 |
| **Styles** | `color: #4285f4;` |

#### S-291: Google Drive Name
| Property | Value |
|----------|-------|
| **Line** | 3642 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Server name |
| **Content** | "Google Drive" |

#### S-292: Google Drive Description
| Property | Value |
|----------|-------|
| **Line** | 3643 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Server description |
| **Content** | "Access files, create docs, manage folders" |

#### S-293: Google Drive Status
| Property | Value |
|----------|-------|
| **Line** | 3646 |
| **HTML ID/Class** | (span) |
| **Description** | Connection status |
| **Content** | "● Connected" |

#### S-294: Google Drive Active Toggle
| Property | Value |
|----------|-------|
| **Line** | 3647-3649 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Toggle switch (on) |
| **Styles** | `background: var(--success);` |

#### S-295: Google Drive Configure Button
| Property | Value |
|----------|-------|
| **Line** | 3650 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Configure button |
| **Content** | "Configure" |

#### S-296: Google Drive Remove Button
| Property | Value |
|----------|-------|
| **Line** | 3651 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Remove button |
| **Content** | "Remove" |

---

### S-297: MCP Item - Gmail (Available)
| Property | Value |
|----------|-------|
| **Line** | 3657 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Gmail MCP server card (not connected) |
| **Styles** | `background: var(--bg-secondary); border: 1px dashed var(--border); opacity: 0.7;` |
| **Nested Elements** | S-298 through S-303 |

#### S-298: Gmail Icon Container
| Property | Value |
|----------|-------|
| **Line** | 3659 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Yellow icon container |
| **Styles** | `background: rgba(234, 179, 8, 0.2);` |
| **Contains** | Mail SVG |

#### S-299: Gmail Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 3660-3663 |
| **HTML ID/Class** | (svg) |
| **Description** | Mail/envelope icon |
| **Size** | 20x20 |
| **Styles** | `color: #eab308;` |

#### S-300: Gmail Name
| Property | Value |
|----------|-------|
| **Line** | 3666 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Server name |
| **Content** | "Gmail" |

#### S-301: Gmail Description
| Property | Value |
|----------|-------|
| **Line** | 3667 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Server description |
| **Content** | "Read and send emails, manage labels" |

#### S-302: Gmail Connect Button
| Property | Value |
|----------|-------|
| **Line** | 3669 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Description** | Connect button |
| **Content** | "Connect" |

---

### S-303: MCP Tip Box
| Property | Value |
|----------|-------|
| **Line** | 3674-3678 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Blue info box about MCP |
| **Content** | "🔌 Universal Standard: MCP is supported by Claude, OpenAI Codex..." |
| **Styles** | `background: rgba(59, 130, 246, 0.1); border-left: 3px solid var(--primary);` |

---

## ELEMENT SUMMARY

### Element Counts by Section
| Section | Count |
|---------|-------|
| Settings Container | 2 |
| Settings Sidebar | 32 |
| Top Bar | 5 |
| Anthropic Subscription | 32 |
| API Keys | 22 |
| Default Model | 10 |
| VPS Connections | 7 |
| Profile | 25 |
| Appearance | 23 |
| Voice Input | 7 |
| Global Agents | 50 |
| Global Skills | 29 |
| Global MCP Servers | 54 |
| **TOTAL** | **298** |

### Settings Section IDs
| ID | Name | Line | Default State |
|----|------|------|---------------|
| `#settings-subscription` | Anthropic Subscription | 2984 | Visible |
| `#settings-apikeys` | API Keys | 3073 | Hidden |
| `#settings-model` | Default Model | 3117 | Hidden |
| `#settings-vps` | VPS Connections | 3150 | Hidden |
| `#settings-profile` | Profile | 3162 | Hidden |
| `#settings-appearance` | Appearance | 3210 | Hidden |
| `#settings-voice` | Voice Input | 3261 | Hidden |
| `#settings-globalagents` | Global Agents | 3277 | Hidden |
| `#settings-globalskills` | Global Skills | 3432 | Hidden |
| `#settings-globalmcp` | Global MCP Servers | 3502 | Hidden |

---

## INTERACTION MAP

### Navigation Events
| Element ID | Event Handler | Target |
|------------|---------------|--------|
| S-07 | `showView('dashboard')` | Dashboard View |
| S-13 | `showSettingsTab('subscription')` | Subscription Section |
| S-15 | `showSettingsTab('apikeys')` | API Keys Section |
| S-17 | `showSettingsTab('profile')` | Profile Section |
| S-19 | `showSettingsTab('appearance')` | Appearance Section |
| S-22 | `showSettingsTab('globalagents')` | Global Agents Section |
| S-24 | `showSettingsTab('globalskills')` | Global Skills Section |
| S-26 | `showSettingsTab('globalmcp')` | Global MCP Section |
| S-29 | `showView('create-project')` | Create Project View |
| S-113 | `showView('create-project')` | Create Project View |

### Modal Events
| Element ID | Event Handler | Modal |
|------------|---------------|-------|
| S-186 | `showAgentModal()` | Agent Modal (Create) |
| S-198 | `showAgentModal(true, {...})` | Agent Modal (Edit) |
| S-228 | `showSkillModal()` | Skill Modal (Create) |
| S-234 | `showSkillModal(true, {...})` | Skill Modal (Edit) |
| S-269 | `showMCPModal()` | MCP Modal (Add) |
| S-277 | `showMCPModal(true, {...})` | MCP Modal (Configure) |

### Toggle Events
| Element ID | Event Handler | Target |
|------------|---------------|--------|
| S-62 | `toggleCrossLLM()` | Cross-LLM Options Panel |
| S-175 | `toggleSettingsAgentHelp()` | Agent Help Content |
| S-253 | `toggleSettingsMCPWarning()` | MCP Warning Tooltip |
| S-257 | `toggleSettingsMCPHelp()` | MCP Help Content |
| S-197 | `this.classList.toggle('inactive')` | Agent Toggle State |
| S-207 | `this.classList.toggle('inactive')` | Agent Toggle State |
| S-217 | `this.classList.toggle('inactive')` | Agent Toggle State |
| S-276 | `this.classList.toggle('inactive')` | MCP Toggle State |
| S-285 | `this.classList.toggle('inactive')` | MCP Toggle State |
| S-294 | `this.classList.toggle('inactive')` | MCP Toggle State |

---

## FORM ELEMENTS

### Text Inputs
| Element ID | Type | Name | Default Value |
|------------|------|------|---------------|
| S-40 | text | Search | (placeholder: "Search settings...") |
| S-127 | text | Display Name | "Alex Engineer" |
| S-130 | text | AI Alias | "Claude" |
| S-134 | email | Email | "alex@example.com" |

### Select Dropdowns
| Element ID | Name | Options |
|------------|------|---------|
| S-101 | Model Select | Claude Opus 4.5 (selected), Claude Sonnet 4.5, Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku, GPT-4o, GPT-4 Turbo, GPT-5.2 Codex, Gemini Pro (disabled) |
| S-137 | Timezone | America/Los_Angeles, America/New_York, Europe/London, Asia/Tokyo |

### Checkboxes
| Element ID | Name | Default State |
|------------|------|---------------|
| S-62 | Cross-LLM Enable | Unchecked |

### Toggle Switches
| Element ID | Name | Default State |
|------------|------|---------------|
| S-159 | Compact Mode | Off |
| S-163 | Line Numbers | On |
| S-170 | Voice Input | On |
| S-197 | code-reviewer Active | On |
| S-207 | security-audit Active | On |
| S-217 | test-writer Active | On |
| S-276 | GitHub Active | On |
| S-285 | Slack Active | On |
| S-294 | Google Drive Active | On |

# HubLLM UI Element Mapping: Global Navigation & Dashboard View

## Document Info
- **Source File**: hubllm-mockup-v2.html
- **Scope**: Lines 2521-2868
- **Total Elements Mapped**: 127

---

## SECTION 1: GLOBAL NAVIGATION (Lines 2521-2534)

### G-01: Global Navigation Bar Container
| Property | Value |
|----------|-------|
| **Line** | 2522 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Fixed top navigation bar spanning full width |
| **Styles** | `position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: var(--bg-primary); padding: 6px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 16px;` |
| **Nested Elements** | G-02, G-06 |

---

### G-02: Logo Container
| Property | Value |
|----------|-------|
| **Line** | 2524 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Container holding logo icon and brand name |
| **Styles** | `display: flex; align-items: center; gap: 8px;` |
| **Nested Elements** | G-03, G-04 |

#### G-03: Logo Icon
| Property | Value |
|----------|-------|
| **Line** | 2525 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Square icon with lightning bolt emoji |
| **Content** | ⚡ |
| **Styles** | `width: 24px; height: 24px; background: var(--primary); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px;` |

#### G-04: Brand Name
| Property | Value |
|----------|-------|
| **Line** | 2526 |
| **HTML ID/Class** | (span) |
| **Description** | Application brand text |
| **Content** | "HubLLM.dev" |
| **Styles** | `font-weight: 600; font-size: 14px;` |

---

### G-05: Navigation Tabs Container
| Property | Value |
|----------|-------|
| **Line** | 2528 |
| **HTML ID/Class** | `.nav-tabs` |
| **Description** | Container for main navigation tab buttons |
| **Styles** | `margin: 0; border: none; padding: 0;` |
| **Nested Elements** | G-06, G-07, G-08, G-09 |

#### G-06: Dashboard Tab Button
| Property | Value |
|----------|-------|
| **Line** | 2529 |
| **HTML ID/Class** | `.nav-tab.active` |
| **Description** | Navigation tab for Dashboard view (default active) |
| **Content** | "Dashboard" |
| **Event** | `onclick="showView('dashboard')"` |

#### G-07: Workspace Tab Button
| Property | Value |
|----------|-------|
| **Line** | 2530 |
| **HTML ID/Class** | `.nav-tab` |
| **Description** | Navigation tab for Workspace view |
| **Content** | "Workspace" |
| **Event** | `onclick="showView('workspace')"` |

#### G-08: Settings Tab Button
| Property | Value |
|----------|-------|
| **Line** | 2531 |
| **HTML ID/Class** | `.nav-tab` |
| **Description** | Navigation tab for Settings view |
| **Content** | "Settings" |
| **Event** | `onclick="showView('settings')"` |

#### G-09: Create Project Tab Button
| Property | Value |
|----------|-------|
| **Line** | 2532 |
| **HTML ID/Class** | `.nav-tab` |
| **Description** | Navigation tab for Create Project view |
| **Content** | "Create Project" |
| **Event** | `onclick="showView('create-project')"` |

---

## SECTION 2: DASHBOARD VIEW (Lines 2537-2868)

### D-01: Dashboard View Container
| Property | Value |
|----------|-------|
| **Line** | 2537 |
| **HTML ID/Class** | `#view-dashboard` `.view.active` |
| **Description** | Root container for entire Dashboard view |
| **Nested Elements** | D-02 |

### D-02: App Container
| Property | Value |
|----------|-------|
| **Line** | 2538 |
| **HTML ID/Class** | `.app-container` |
| **Description** | Flex container for sidebar + main content layout |
| **Nested Elements** | D-03, D-45 |

---

## SECTION 2A: DASHBOARD SIDEBAR (Lines 2540-2655)

### D-03: Sidebar
| Property | Value |
|----------|-------|
| **Line** | 2540 |
| **HTML ID/Class** | `#dashboard-sidebar` `.sidebar` |
| **Description** | Collapsible left sidebar navigation panel |
| **Nested Elements** | D-04, D-05, D-40 |

#### D-04: Sidebar Expand Button
| Property | Value |
|----------|-------|
| **Line** | 2542 |
| **HTML ID/Class** | `.sidebar-expand-btn` |
| **Description** | Button shown when sidebar is collapsed to expand it |
| **Content** | ▶ |
| **Event** | `onclick="toggleDashboardSidebar()"` |
| **Attribute** | `title="Expand Sidebar"` |

---

### D-05: Sidebar Navigation
| Property | Value |
|----------|-------|
| **Line** | 2543 |
| **HTML ID/Class** | `.sidebar-nav` |
| **Description** | Main navigation container within sidebar |
| **Styles** | `padding-top: 16px;` |
| **Nested Elements** | D-06, D-14 |

---

### D-06: Main Nav Section
| Property | Value |
|----------|-------|
| **Line** | 2544 |
| **HTML ID/Class** | `.nav-section` |
| **Description** | "Main" navigation section grouping |
| **Nested Elements** | D-07, D-08, D-11 |

#### D-07: Main Section Title
| Property | Value |
|----------|-------|
| **Line** | 2545 |
| **HTML ID/Class** | `.nav-section-title` |
| **Description** | Section header label |
| **Content** | "Main" |

#### D-08: Dashboard Nav Item (Active)
| Property | Value |
|----------|-------|
| **Line** | 2546 |
| **HTML ID/Class** | `.nav-item.active` |
| **Description** | Dashboard navigation item (currently active) |
| **Content** | "Dashboard" |
| **Nested Elements** | D-09 |

##### D-09: Dashboard Nav Icon Container
| Property | Value |
|----------|-------|
| **Line** | 2547 |
| **HTML ID/Class** | `.nav-item-icon` |
| **Description** | Icon container for dashboard nav item |
| **Nested Elements** | D-10 |

##### D-10: Dashboard Nav Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2548-2553 |
| **HTML ID/Class** | (svg) |
| **Description** | 4-square grid icon representing dashboard |
| **Size** | 18x18 |
| **Icon Type** | Grid (4 rectangles) |

#### D-11: Settings Nav Item
| Property | Value |
|----------|-------|
| **Line** | 2557 |
| **HTML ID/Class** | `.nav-item` |
| **Description** | Settings navigation item |
| **Content** | "Settings" |
| **Event** | `onclick="showView('settings')"` |
| **Nested Elements** | D-12 |

##### D-12: Settings Nav Icon Container
| Property | Value |
|----------|-------|
| **Line** | 2558 |
| **HTML ID/Class** | `.nav-item-icon` |
| **Description** | Icon container for settings nav item |
| **Nested Elements** | D-13 |

##### D-13: Settings Nav Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2559-2562 |
| **HTML ID/Class** | (svg) |
| **Description** | Gear/cog icon for settings |
| **Size** | 18x18 |
| **Icon Type** | Gear (circle + path) |

---

### D-14: Workspaces Nav Section
| Property | Value |
|----------|-------|
| **Line** | 2568 |
| **HTML ID/Class** | `.nav-section` |
| **Description** | "Workspaces" navigation section with tree view |
| **Nested Elements** | D-15, D-21, D-34, D-37 |

#### D-15: Workspaces Section Title Container
| Property | Value |
|----------|-------|
| **Line** | 2569 |
| **HTML ID/Class** | `.nav-section-title` |
| **Description** | Title bar with label and action buttons |
| **Styles** | `display: flex; align-items: center; justify-content: space-between;` |
| **Nested Elements** | D-16, D-17 |

##### D-16: Workspaces Label
| Property | Value |
|----------|-------|
| **Line** | 2570 |
| **HTML ID/Class** | (span) |
| **Description** | Section label text |
| **Content** | "Workspaces" |

##### D-17: Workspaces Title Actions Container
| Property | Value |
|----------|-------|
| **Line** | 2571 |
| **HTML ID/Class** | (inline styled div) |
| **Description** | Container for add and collapse buttons |
| **Styles** | `display: flex; align-items: center; gap: 4px;` |
| **Nested Elements** | D-18, D-20 |

##### D-18: Create Project Button (Small)
| Property | Value |
|----------|-------|
| **Line** | 2572 |
| **HTML ID/Class** | (inline styled button) |
| **Description** | Small primary button to create new project |
| **Styles** | `background: var(--primary); border: none; border-radius: 4px; width: 18px; height: 18px;` |
| **Event** | `onclick="event.stopPropagation(); showView('create-project')"` |
| **Attribute** | `title="Create Project"` |
| **Nested Elements** | D-19 |

##### D-19: Create Project Button Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2573-2576 |
| **HTML ID/Class** | (svg) |
| **Description** | Plus icon for create action |
| **Size** | 12x12 |
| **Icon Type** | Plus (2 lines) |
| **Stroke** | white, width 3 |

##### D-20: Sidebar Collapse Button
| Property | Value |
|----------|-------|
| **Line** | 2578 |
| **HTML ID/Class** | `#dashboard-sidebar-toggle` `.sidebar-toggle-btn` |
| **Description** | Button to collapse sidebar |
| **Content** | ◀ |
| **Event** | `onclick="toggleDashboardSidebar()"` |
| **Attribute** | `title="Collapse Sidebar"` |

---

### D-21: Customers Workspace Item
| Property | Value |
|----------|-------|
| **Line** | 2583 |
| **HTML ID/Class** | `.workspace-item` |
| **Description** | Expandable workspace folder for "Customers" |
| **Event** | `onclick="toggleWorkspace(this)"` |
| **Nested Elements** | D-22, D-23, D-24 |

#### D-22: Customers Folder Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2584-2586 |
| **HTML ID/Class** | (svg) |
| **Description** | Folder icon |
| **Size** | 16x16 |
| **Icon Type** | Folder |
| **Styles** | `flex-shrink: 0;` |

#### D-23: Customers Label
| Property | Value |
|----------|-------|
| **Line** | 2587 |
| **HTML ID/Class** | (span) |
| **Description** | Workspace name text |
| **Content** | "Customers" |

#### D-24: Customers Expand Indicator
| Property | Value |
|----------|-------|
| **Line** | 2588 |
| **HTML ID/Class** | (span) |
| **Description** | Arrow indicating expanded state |
| **Content** | ▼ (expanded) |
| **Styles** | `margin-left: auto; font-size: 10px;` |

---

### D-25: Customers Workspace Children Container
| Property | Value |
|----------|-------|
| **Line** | 2590 |
| **HTML ID/Class** | `.workspace-children` |
| **Description** | Container for nested project items under Customers |
| **Nested Elements** | D-26, D-28, D-31 |

#### D-26: Project Item - Acme Corp Website
| Property | Value |
|----------|-------|
| **Line** | 2591 |
| **HTML ID/Class** | `.project-item` |
| **Description** | Project entry in workspace tree |
| **Content** | "Acme Corp Website" |
| **Event** | `onclick="showView('workspace')"` |
| **Nested Elements** | D-27 |

##### D-27: Acme Corp File Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2592-2595 |
| **HTML ID/Class** | (svg) |
| **Description** | Document/file icon |
| **Size** | 14x14 |
| **Icon Type** | File with folded corner |
| **Styles** | `flex-shrink: 0; opacity: 0.6;` |

#### D-28: Project Item - API Backend Optimization (Active)
| Property | Value |
|----------|-------|
| **Line** | 2598 |
| **HTML ID/Class** | `.project-item.active` |
| **Description** | Currently active project in workspace tree |
| **Content** | "API Backend Optimization" |
| **Event** | `onclick="showView('workspace')"` |
| **Nested Elements** | D-29 |

##### D-29: API Backend File Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2599-2602 |
| **HTML ID/Class** | (svg) |
| **Description** | Document/file icon |
| **Size** | 14x14 |
| **Icon Type** | File with folded corner |
| **Styles** | `flex-shrink: 0; opacity: 0.7;` |

#### D-30: Project Item - Beta Inc Dashboard
| Property | Value |
|----------|-------|
| **Line** | 2605 |
| **HTML ID/Class** | `.project-item` |
| **Description** | Project entry in workspace tree |
| **Content** | "Beta Inc Dashboard" |
| **Event** | `onclick="showView('workspace')"` |
| **Nested Elements** | D-31 |

##### D-31: Beta Inc File Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2606-2609 |
| **HTML ID/Class** | (svg) |
| **Description** | Document/file icon |
| **Size** | 14x14 |
| **Icon Type** | File with folded corner |
| **Styles** | `flex-shrink: 0; opacity: 0.7;` |

---

### D-32: Personal Workspace Item
| Property | Value |
|----------|-------|
| **Line** | 2615 |
| **HTML ID/Class** | `.workspace-item` |
| **Description** | Expandable workspace folder for "Personal" (collapsed) |
| **Event** | `onclick="toggleWorkspace(this)"` |
| **Nested Elements** | D-33, D-34, D-35 |

#### D-33: Personal Folder Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2616-2618 |
| **HTML ID/Class** | (svg) |
| **Description** | Folder icon |
| **Size** | 16x16 |
| **Icon Type** | Folder |
| **Styles** | `flex-shrink: 0;` |

#### D-34: Personal Label
| Property | Value |
|----------|-------|
| **Line** | 2619 |
| **HTML ID/Class** | (span) |
| **Description** | Workspace name text |
| **Content** | "Personal" |

#### D-35: Personal Collapse Indicator
| Property | Value |
|----------|-------|
| **Line** | 2620 |
| **HTML ID/Class** | (span) |
| **Description** | Arrow indicating collapsed state |
| **Content** | ▶ (collapsed) |
| **Styles** | `margin-left: auto; font-size: 10px;` |

---

### D-36: Archives Workspace Item
| Property | Value |
|----------|-------|
| **Line** | 2624 |
| **HTML ID/Class** | `.workspace-item` |
| **Description** | Archives workspace folder (non-expandable) |
| **Nested Elements** | D-37, D-38 |

#### D-37: Archives Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2625-2629 |
| **HTML ID/Class** | (svg) |
| **Description** | Archive box icon |
| **Size** | 16x16 |
| **Icon Type** | Archive (box with line) |
| **Styles** | `flex-shrink: 0; opacity: 0.6;` |

#### D-38: Archives Label
| Property | Value |
|----------|-------|
| **Line** | 2630 |
| **HTML ID/Class** | (span) |
| **Description** | Workspace name text |
| **Content** | "Archives" |

---

### D-39: Sidebar Footer
| Property | Value |
|----------|-------|
| **Line** | 2635 |
| **HTML ID/Class** | `.sidebar-footer` |
| **Description** | Bottom section of sidebar with new project button and user profile |
| **Nested Elements** | D-40, D-43 |

#### D-40: New Project Button (Large)
| Property | Value |
|----------|-------|
| **Line** | 2636 |
| **HTML ID/Class** | `.new-project-btn` |
| **Description** | Full-width button to create new project |
| **Content** | "New Project" |
| **Event** | `onclick="showView('create-project')"` |
| **Nested Elements** | D-41 |

##### D-41: New Project Button Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2637-2640 |
| **HTML ID/Class** | (svg) |
| **Description** | Plus icon |
| **Size** | 16x16 |
| **Icon Type** | Plus (2 lines) |

#### D-42: User Profile Container
| Property | Value |
|----------|-------|
| **Line** | 2643 |
| **HTML ID/Class** | `.user-profile` |
| **Description** | Clickable user profile section |
| **Event** | `onclick="showView('settings')"` |
| **Nested Elements** | D-43, D-44, D-47 |

##### D-43: User Avatar
| Property | Value |
|----------|-------|
| **Line** | 2644 |
| **HTML ID/Class** | `.user-avatar` |
| **Description** | Circular avatar with initials |
| **Content** | "AE" |

##### D-44: User Info Container
| Property | Value |
|----------|-------|
| **Line** | 2645 |
| **HTML ID/Class** | `.user-info` |
| **Description** | Container for user name and plan |
| **Nested Elements** | D-45, D-46 |

##### D-45: User Name
| Property | Value |
|----------|-------|
| **Line** | 2646 |
| **HTML ID/Class** | `.user-name` |
| **Description** | Display name of logged-in user |
| **Content** | "Alex Engineer" |

##### D-46: User Plan
| Property | Value |
|----------|-------|
| **Line** | 2647 |
| **HTML ID/Class** | `.user-plan` |
| **Description** | Subscription tier label |
| **Content** | "Pro Account" |

##### D-47: User Settings Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2649-2652 |
| **HTML ID/Class** | (svg) |
| **Description** | Gear icon indicating settings access |
| **Size** | 16x16 |
| **Icon Type** | Gear |
| **Styles** | `opacity: 0.5;` |

---

## SECTION 2B: DASHBOARD MAIN CONTENT (Lines 2657-2866)

### D-48: Main Content Container
| Property | Value |
|----------|-------|
| **Line** | 2658 |
| **HTML ID/Class** | `.main-content` |
| **Description** | Primary content area (right of sidebar) |
| **Nested Elements** | D-49, D-58 |

---

### D-49: Top Bar
| Property | Value |
|----------|-------|
| **Line** | 2659 |
| **HTML ID/Class** | `.top-bar` |
| **Description** | Header bar with search and action links |
| **Nested Elements** | D-50, D-53 |

#### D-50: Search Bar Container
| Property | Value |
|----------|-------|
| **Line** | 2660 |
| **HTML ID/Class** | `.search-bar` |
| **Description** | Search input container |
| **Nested Elements** | D-51, D-52 |

##### D-51: Search Icon
| Property | Value |
|----------|-------|
| **Line** | 2661 |
| **HTML ID/Class** | `.search-icon` |
| **Description** | Magnifying glass emoji |
| **Content** | 🔍 |

##### D-52: Search Input
| Property | Value |
|----------|-------|
| **Line** | 2662 |
| **HTML ID/Class** | (input type="text") |
| **Description** | Text input for search |
| **Placeholder** | "Search projects, repos, or LLM outputs..." |

#### D-53: Top Bar Actions Container
| Property | Value |
|----------|-------|
| **Line** | 2664 |
| **HTML ID/Class** | `.top-bar-actions` |
| **Description** | Container for header links and buttons |
| **Nested Elements** | D-54, D-55, D-56, D-57 |

##### D-54: Docs Link
| Property | Value |
|----------|-------|
| **Line** | 2665 |
| **HTML ID/Class** | `.top-bar-link` |
| **Description** | Documentation link |
| **Content** | "Docs" |

##### D-55: Community Link
| Property | Value |
|----------|-------|
| **Line** | 2666 |
| **HTML ID/Class** | `.top-bar-link` |
| **Description** | Community link |
| **Content** | "Community" |

##### D-56: Notifications Button
| Property | Value |
|----------|-------|
| **Line** | 2667 |
| **HTML ID/Class** | `.icon-btn` |
| **Description** | Bell icon button for notifications |
| **Content** | 🔔 |

##### D-57: Chat/Messages Button
| Property | Value |
|----------|-------|
| **Line** | 2668 |
| **HTML ID/Class** | `.icon-btn` |
| **Description** | Chat icon button for messages |
| **Content** | 💬 |

---

### D-58: Page Content Container
| Property | Value |
|----------|-------|
| **Line** | 2672 |
| **HTML ID/Class** | `.page-content` |
| **Description** | Scrollable content area below top bar |
| **Nested Elements** | D-59, D-63, D-76, D-87 |

---

### D-59: Breadcrumb Navigation
| Property | Value |
|----------|-------|
| **Line** | 2673 |
| **HTML ID/Class** | `.breadcrumb` |
| **Description** | Breadcrumb trail showing current location |
| **Nested Elements** | D-60, D-61, D-62 |

#### D-60: Breadcrumb Home Link
| Property | Value |
|----------|-------|
| **Line** | 2674 |
| **HTML ID/Class** | (a href="#") |
| **Description** | Link to home/root |
| **Content** | "Home" |

#### D-61: Breadcrumb Separator
| Property | Value |
|----------|-------|
| **Line** | 2675 |
| **HTML ID/Class** | (span) |
| **Description** | Visual separator between breadcrumb items |
| **Content** | › |

#### D-62: Breadcrumb Current Page
| Property | Value |
|----------|-------|
| **Line** | 2676 |
| **HTML ID/Class** | (span) |
| **Description** | Current page indicator (non-linked) |
| **Content** | "Projects" |

---

### D-63: Page Header
| Property | Value |
|----------|-------|
| **Line** | 2679 |
| **HTML ID/Class** | `.page-header` |
| **Description** | Title section with actions |
| **Nested Elements** | D-64, D-67 |

#### D-64: Page Header Text Container
| Property | Value |
|----------|-------|
| **Line** | 2680 |
| **HTML ID/Class** | (div) |
| **Description** | Container for title and subtitle |
| **Nested Elements** | D-65, D-66 |

##### D-65: Page Title
| Property | Value |
|----------|-------|
| **Line** | 2681 |
| **HTML ID/Class** | `.page-title` (h1) |
| **Description** | Main page heading |
| **Content** | "Project Dashboard" |

##### D-66: Page Subtitle
| Property | Value |
|----------|-------|
| **Line** | 2682 |
| **HTML ID/Class** | `.page-subtitle` (p) |
| **Description** | Descriptive subheading |
| **Content** | "Manage your LLM-connected workspaces and projects with ease." |

#### D-67: Header Actions Container
| Property | Value |
|----------|-------|
| **Line** | 2684 |
| **HTML ID/Class** | `.header-actions` |
| **Description** | Container for action buttons |
| **Nested Elements** | D-68, D-71 |

##### D-68: Refresh All Button
| Property | Value |
|----------|-------|
| **Line** | 2685 |
| **HTML ID/Class** | `.btn.btn-secondary` |
| **Description** | Secondary button to refresh all projects |
| **Content** | "Refresh All" |
| **Styles** | `display: flex; align-items: center; gap: 6px;` |
| **Nested Elements** | D-69 |

###### D-69: Refresh Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2686-2690 |
| **HTML ID/Class** | (svg) |
| **Description** | Circular refresh/sync icon |
| **Size** | 14x14 |
| **Icon Type** | Refresh arrows |

##### D-70: Create Project Button (Header)
| Property | Value |
|----------|-------|
| **Line** | 2693 |
| **HTML ID/Class** | `.btn.btn-primary` |
| **Description** | Primary button to create new project |
| **Content** | "Create Project" |
| **Event** | `onclick="showView('create-project')"` |
| **Styles** | `display: flex; align-items: center; gap: 6px;` |
| **Nested Elements** | D-71 |

###### D-71: Create Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2694-2697 |
| **HTML ID/Class** | (svg) |
| **Description** | Plus icon for create action |
| **Size** | 14x14 |
| **Icon Type** | Plus (2 lines) |

---

### D-72: Stats Grid
| Property | Value |
|----------|-------|
| **Line** | 2704 |
| **HTML ID/Class** | `.stats-grid` |
| **Description** | Grid container for stat cards |
| **Nested Elements** | D-73, D-79, D-85 |

---

#### D-73: Stat Card - Active Sessions
| Property | Value |
|----------|-------|
| **Line** | 2705 |
| **HTML ID/Class** | `.stat-card` |
| **Description** | Statistics card for active sessions |
| **Nested Elements** | D-74, D-75, D-76, D-77, D-78 |

##### D-74: Stat Header (Active Sessions)
| Property | Value |
|----------|-------|
| **Line** | 2706 |
| **HTML ID/Class** | `.stat-header` |
| **Description** | Header row with icon and badge |
| **Nested Elements** | D-75, D-76 |

###### D-75: Stat Icon Container (Blue)
| Property | Value |
|----------|-------|
| **Line** | 2707 |
| **HTML ID/Class** | `.stat-icon.blue` |
| **Description** | Blue-colored icon container |
| **Styles** | `display: flex; align-items: center; justify-content: center;` |
| **Nested Elements** | D-75a |

###### D-75a: Lightning Bolt Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2708-2710 |
| **HTML ID/Class** | (svg) |
| **Description** | Lightning bolt icon representing activity |
| **Size** | 20x20 |
| **Icon Type** | Lightning bolt (polygon) |

###### D-76: Stat Badge (Active Sessions)
| Property | Value |
|----------|-------|
| **Line** | 2712 |
| **HTML ID/Class** | `.stat-badge.positive` |
| **Description** | Percentage change indicator (positive) |
| **Content** | "+20%" |

##### D-77: Stat Label (Active Sessions)
| Property | Value |
|----------|-------|
| **Line** | 2714 |
| **HTML ID/Class** | `.stat-label` |
| **Description** | Stat name/title |
| **Content** | "Active Sessions" |

##### D-78: Stat Value (Active Sessions)
| Property | Value |
|----------|-------|
| **Line** | 2715 |
| **HTML ID/Class** | `.stat-value` |
| **Description** | Main numeric value |
| **Content** | "12" |

##### D-78a: Stat Description (Active Sessions)
| Property | Value |
|----------|-------|
| **Line** | 2716 |
| **HTML ID/Class** | `.stat-desc` |
| **Description** | Additional context |
| **Content** | "Across 4 LLM providers" |

---

#### D-79: Stat Card - Total Projects
| Property | Value |
|----------|-------|
| **Line** | 2718 |
| **HTML ID/Class** | `.stat-card` |
| **Description** | Statistics card for total projects |
| **Nested Elements** | D-80, D-81, D-82, D-83, D-84 |

##### D-80: Stat Header (Total Projects)
| Property | Value |
|----------|-------|
| **Line** | 2719 |
| **HTML ID/Class** | `.stat-header` |
| **Description** | Header row with icon and badge |
| **Nested Elements** | D-80a, D-81 |

###### D-80a: Stat Icon Container (Green)
| Property | Value |
|----------|-------|
| **Line** | 2720 |
| **HTML ID/Class** | `.stat-icon.green` |
| **Description** | Green-colored icon container |
| **Nested Elements** | D-80b |

###### D-80b: Users/Projects Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2721-2726 |
| **HTML ID/Class** | (svg) |
| **Description** | People/users icon representing projects |
| **Size** | 20x20 |
| **Icon Type** | Users (path + circles) |

###### D-81: Stat Badge (Total Projects)
| Property | Value |
|----------|-------|
| **Line** | 2728 |
| **HTML ID/Class** | `.stat-badge.positive` |
| **Description** | Percentage change indicator (positive) |
| **Content** | "+5%" |

##### D-82: Stat Label (Total Projects)
| Property | Value |
|----------|-------|
| **Line** | 2730 |
| **HTML ID/Class** | `.stat-label` |
| **Description** | Stat name/title |
| **Content** | "Total Projects" |

##### D-83: Stat Value (Total Projects)
| Property | Value |
|----------|-------|
| **Line** | 2731 |
| **HTML ID/Class** | `.stat-value` |
| **Description** | Main numeric value |
| **Content** | "48" |

##### D-84: Stat Description (Total Projects)
| Property | Value |
|----------|-------|
| **Line** | 2732 |
| **HTML ID/Class** | `.stat-desc` |
| **Description** | Additional context |
| **Content** | "12 GitHub, 36 Local" |

---

#### D-85: Stat Card - Connected LLMs
| Property | Value |
|----------|-------|
| **Line** | 2734 |
| **HTML ID/Class** | `.stat-card` |
| **Description** | Statistics card for connected LLMs |
| **Nested Elements** | D-86, D-87, D-88, D-89, D-90 |

##### D-86: Stat Header (Connected LLMs)
| Property | Value |
|----------|-------|
| **Line** | 2735 |
| **HTML ID/Class** | `.stat-header` |
| **Description** | Header row with icon and badge |
| **Nested Elements** | D-86a, D-87 |

###### D-86a: Stat Icon Container (Purple)
| Property | Value |
|----------|-------|
| **Line** | 2736 |
| **HTML ID/Class** | `.stat-icon.purple` |
| **Description** | Purple-colored icon container |
| **Nested Elements** | D-86b |

###### D-86b: Monitor Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2737-2741 |
| **HTML ID/Class** | (svg) |
| **Description** | Computer monitor icon representing LLMs |
| **Size** | 20x20 |
| **Icon Type** | Monitor (rect + lines) |

###### D-87: Stat Badge (Connected LLMs)
| Property | Value |
|----------|-------|
| **Line** | 2743 |
| **HTML ID/Class** | `.stat-badge.neutral` |
| **Description** | Status indicator (neutral/stable) |
| **Content** | "Stable" |

##### D-88: Stat Label (Connected LLMs)
| Property | Value |
|----------|-------|
| **Line** | 2745 |
| **HTML ID/Class** | `.stat-label` |
| **Description** | Stat name/title |
| **Content** | "Connected LLMs" |

##### D-89: Stat Value (Connected LLMs)
| Property | Value |
|----------|-------|
| **Line** | 2746 |
| **HTML ID/Class** | `.stat-value` |
| **Description** | Main numeric value |
| **Content** | "5" |

##### D-90: Stat Description (Connected LLMs)
| Property | Value |
|----------|-------|
| **Line** | 2747 |
| **HTML ID/Class** | `.stat-desc` |
| **Description** | Additional context |
| **Content** | "OpenRouter + Anthropic" |

---

### D-91: Section Header (Recent Projects)
| Property | Value |
|----------|-------|
| **Line** | 2752 |
| **HTML ID/Class** | `.section-header` |
| **Description** | Header for projects section |
| **Nested Elements** | D-92, D-95 |

#### D-92: Section Title Container
| Property | Value |
|----------|-------|
| **Line** | 2753 |
| **HTML ID/Class** | `.section-title` (h2) |
| **Description** | Section heading with icon |
| **Content** | "Recent Projects" |
| **Styles** | `display: flex; align-items: center; gap: 8px;` |
| **Nested Elements** | D-93 |

##### D-93: Folder Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2754-2756 |
| **HTML ID/Class** | (svg) |
| **Description** | Folder icon next to section title |
| **Size** | 18x18 |
| **Icon Type** | Folder |

#### D-94: View Toggle Container
| Property | Value |
|----------|-------|
| **Line** | 2759 |
| **HTML ID/Class** | `.view-toggle` |
| **Description** | Toggle buttons for grid/list view |
| **Nested Elements** | D-95, D-97 |

##### D-95: Grid View Button (Active)
| Property | Value |
|----------|-------|
| **Line** | 2760 |
| **HTML ID/Class** | (button.active) |
| **Description** | Button to switch to grid view (currently active) |
| **Nested Elements** | D-96 |

###### D-96: Grid Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2761-2766 |
| **HTML ID/Class** | (svg) |
| **Description** | 4-square grid icon |
| **Size** | 14x14 |
| **Icon Type** | Grid (4 rectangles) |

##### D-97: List View Button
| Property | Value |
|----------|-------|
| **Line** | 2768 |
| **HTML ID/Class** | (button) |
| **Description** | Button to switch to list view |
| **Nested Elements** | D-98 |

###### D-98: List Icon (SVG)
| Property | Value |
|----------|-------|
| **Line** | 2769-2773 |
| **HTML ID/Class** | (svg) |
| **Description** | Horizontal lines (list) icon |
| **Size** | 14x14 |
| **Icon Type** | List (3 horizontal lines) |

---

### D-99: Projects Grid
| Property | Value |
|----------|-------|
| **Line** | 2778 |
| **HTML ID/Class** | `.projects-grid` |
| **Description** | Grid container for project cards |
| **Nested Elements** | D-100, D-111, D-120, D-127 |

---

#### D-100: Project Card - API Backend Optimization
| Property | Value |
|----------|-------|
| **Line** | 2779 |
| **HTML ID/Class** | `.project-card` |
| **Description** | Card for API Backend Optimization project |
| **Event** | `onclick="showView('workspace')"` |
| **Nested Elements** | D-101 through D-110 |

##### D-101: Project Card Workspace Label
| Property | Value |
|----------|-------|
| **Line** | 2780 |
| **HTML ID/Class** | `.project-card-workspace` |
| **Description** | Workspace category label |
| **Content** | "Customers" |

##### D-102: Project Card Header
| Property | Value |
|----------|-------|
| **Line** | 2781 |
| **HTML ID/Class** | `.project-card-header` |
| **Description** | Header row with title and menu |
| **Nested Elements** | D-103, D-104 |

###### D-103: Project Card Title
| Property | Value |
|----------|-------|
| **Line** | 2782 |
| **HTML ID/Class** | `.project-card-title` |
| **Description** | Project name |
| **Content** | "API Backend Optimization" |

###### D-104: Project Card Menu Button
| Property | Value |
|----------|-------|
| **Line** | 2783 |
| **HTML ID/Class** | `.icon-btn` |
| **Description** | Vertical ellipsis menu button |
| **Content** | ⋮ |
| **Styles** | `width: 32px; height: 32px;` |

##### D-105: Project Card Description
| Property | Value |
|----------|-------|
| **Line** | 2785 |
| **HTML ID/Class** | `.project-card-desc` (p) |
| **Description** | Project description text |
| **Content** | "Refactoring Node.js endpoints using Claude-3 Opus for performance gains." |

##### D-106: Project Tags Container
| Property | Value |
|----------|-------|
| **Line** | 2786 |
| **HTML ID/Class** | `.project-tags` |
| **Description** | Container for project tags |
| **Nested Elements** | D-107, D-108 |

###### D-107: VPS Tag
| Property | Value |
|----------|-------|
| **Line** | 2787-2795 |
| **HTML ID/Class** | `.tag.vps` |
| **Description** | Tag indicating VPS connection |
| **Content** | "VPS: prod-01" |
| **Styles** | `display: inline-flex; align-items: center; gap: 4px;` |
| **Contains** | Server icon (SVG, 12x12) |

###### D-108: Node.js Tag
| Property | Value |
|----------|-------|
| **Line** | 2796-2803 |
| **HTML ID/Class** | `.tag` |
| **Description** | Tag indicating tech stack |
| **Content** | "Node.js" |
| **Styles** | `display: inline-flex; align-items: center; gap: 4px;` |
| **Contains** | Git branch icon (SVG, 12x12) |

##### D-109: Project Card Footer
| Property | Value |
|----------|-------|
| **Line** | 2805 |
| **HTML ID/Class** | `.project-card-footer` |
| **Description** | Footer with avatars and update time |
| **Nested Elements** | D-109a, D-109d |

###### D-109a: Project Avatars Container
| Property | Value |
|----------|-------|
| **Line** | 2806 |
| **HTML ID/Class** | `.project-avatars` |
| **Description** | Container for contributor avatars |
| **Nested Elements** | D-109b, D-109c |

###### D-109b: Avatar G (Green)
| Property | Value |
|----------|-------|
| **Line** | 2807 |
| **HTML ID/Class** | `.avatar` |
| **Description** | Contributor avatar |
| **Content** | "G" |
| **Styles** | `background: #22c55e;` |

###### D-109c: Avatar C (Blue)
| Property | Value |
|----------|-------|
| **Line** | 2808 |
| **HTML ID/Class** | `.avatar` |
| **Description** | Contributor avatar |
| **Content** | "C" |
| **Styles** | `background: #3b82f6;` |

###### D-109d: Project Updated Container
| Property | Value |
|----------|-------|
| **Line** | 2810 |
| **HTML ID/Class** | `.project-updated` |
| **Description** | Update timestamp with activity dot |
| **Content** | "Updated 2m ago" |
| **Nested Elements** | D-109e |

###### D-109e: Activity Dot
| Property | Value |
|----------|-------|
| **Line** | 2811 |
| **HTML ID/Class** | `.dot` |
| **Description** | Green dot indicating recent activity |

---

#### D-110: Project Card - Frontend UI Kit
| Property | Value |
|----------|-------|
| **Line** | 2817 |
| **HTML ID/Class** | `.project-card` |
| **Description** | Card for Frontend UI Kit project |
| **Event** | `onclick="showView('workspace')"` |
| **Nested Elements** | D-111 through D-118 |

##### D-111: Project Card Workspace Label
| Property | Value |
|----------|-------|
| **Line** | 2818 |
| **HTML ID/Class** | `.project-card-workspace` |
| **Description** | Workspace category label |
| **Content** | "Customers" |

##### D-112: Project Card Header
| Property | Value |
|----------|-------|
| **Line** | 2819 |
| **HTML ID/Class** | `.project-card-header` |
| **Description** | Header row with title and menu |
| **Nested Elements** | D-113, D-114 |

###### D-113: Project Card Title
| Property | Value |
|----------|-------|
| **Line** | 2820 |
| **HTML ID/Class** | `.project-card-title` |
| **Description** | Project name |
| **Content** | "Frontend UI Kit" |

###### D-114: Project Card Menu Button
| Property | Value |
|----------|-------|
| **Line** | 2821 |
| **HTML ID/Class** | `.icon-btn` |
| **Description** | Vertical ellipsis menu button |
| **Content** | ⋮ |
| **Styles** | `width: 32px; height: 32px;` |

##### D-115: Project Card Description
| Property | Value |
|----------|-------|
| **Line** | 2823 |
| **HTML ID/Class** | `.project-card-desc` (p) |
| **Description** | Project description text |
| **Content** | "Automated component generation from Figma designs using GPT-4..." |

##### D-116: Project Tags Container
| Property | Value |
|----------|-------|
| **Line** | 2824 |
| **HTML ID/Class** | `.project-tags` |
| **Description** | Container for project tags |
| **Nested Elements** | D-117, D-118 |

###### D-117: Local Tag
| Property | Value |
|----------|-------|
| **Line** | 2825 |
| **HTML ID/Class** | `.tag.local` |
| **Description** | Tag indicating local connection |
| **Content** | "💻 Local" |

###### D-118: React + Tailwind Tag
| Property | Value |
|----------|-------|
| **Line** | 2826 |
| **HTML ID/Class** | `.tag` |
| **Description** | Tag indicating tech stack |
| **Content** | "⚛️ React + Tailwind" |

##### D-119: Project Card Footer
| Property | Value |
|----------|-------|
| **Line** | 2828 |
| **HTML ID/Class** | `.project-card-footer` |
| **Description** | Footer with avatars and update time |
| **Nested Elements** | D-119a, D-119c |

###### D-119a: Project Avatars Container
| Property | Value |
|----------|-------|
| **Line** | 2829 |
| **HTML ID/Class** | `.project-avatars` |
| **Description** | Container for contributor avatars |
| **Nested Elements** | D-119b |

###### D-119b: Avatar G (Purple)
| Property | Value |
|----------|-------|
| **Line** | 2830 |
| **HTML ID/Class** | `.avatar` |
| **Description** | Contributor avatar |
| **Content** | "G" |
| **Styles** | `background: #8b5cf6;` |

###### D-119c: Project Updated
| Property | Value |
|----------|-------|
| **Line** | 2832-2834 |
| **HTML ID/Class** | `.project-updated` |
| **Description** | Update timestamp |
| **Content** | "Updated 4h ago" |

---

#### D-120: Project Card - Portfolio Website
| Property | Value |
|----------|-------|
| **Line** | 2838 |
| **HTML ID/Class** | `.project-card` |
| **Description** | Card for Portfolio Website project |
| **Event** | `onclick="showView('workspace')"` |
| **Nested Elements** | D-121 through D-126 |

##### D-121: Project Card Workspace Label
| Property | Value |
|----------|-------|
| **Line** | 2839 |
| **HTML ID/Class** | `.project-card-workspace` |
| **Description** | Workspace category label |
| **Content** | "Personal" |

##### D-122: Project Card Header
| Property | Value |
|----------|-------|
| **Line** | 2840 |
| **HTML ID/Class** | `.project-card-header` |
| **Description** | Header row with title and menu |
| **Nested Elements** | D-122a, D-122b |

###### D-122a: Project Card Title
| Property | Value |
|----------|-------|
| **Line** | 2841 |
| **HTML ID/Class** | `.project-card-title` |
| **Description** | Project name |
| **Content** | "Portfolio Website" |

###### D-122b: Project Card Menu Button
| Property | Value |
|----------|-------|
| **Line** | 2842 |
| **HTML ID/Class** | `.icon-btn` |
| **Description** | Vertical ellipsis menu button |
| **Content** | ⋮ |
| **Styles** | `width: 32px; height: 32px;` |

##### D-123: Project Card Description
| Property | Value |
|----------|-------|
| **Line** | 2844 |
| **HTML ID/Class** | `.project-card-desc` (p) |
| **Description** | Project description text |
| **Content** | "Personal portfolio site with blog integration and dark mode." |

##### D-124: Project Tags Container
| Property | Value |
|----------|-------|
| **Line** | 2845 |
| **HTML ID/Class** | `.project-tags` |
| **Description** | Container for project tags |
| **Nested Elements** | D-124a, D-124b |

###### D-124a: GitHub Tag
| Property | Value |
|----------|-------|
| **Line** | 2846 |
| **HTML ID/Class** | `.tag.github` |
| **Description** | Tag indicating GitHub connection |
| **Content** | "🐙 GitHub: portfolio" |

###### D-124b: Next.js Tag
| Property | Value |
|----------|-------|
| **Line** | 2847 |
| **HTML ID/Class** | `.tag` |
| **Description** | Tag indicating tech stack |
| **Content** | "🌿 Next.js" |

##### D-125: Project Card Footer
| Property | Value |
|----------|-------|
| **Line** | 2849 |
| **HTML ID/Class** | `.project-card-footer` |
| **Description** | Footer with avatars and update time |
| **Nested Elements** | D-125a, D-125c |

###### D-125a: Project Avatars Container
| Property | Value |
|----------|-------|
| **Line** | 2850 |
| **HTML ID/Class** | `.project-avatars` |
| **Description** | Container for contributor avatars |
| **Nested Elements** | D-125b |

###### D-125b: Avatar A (Orange)
| Property | Value |
|----------|-------|
| **Line** | 2851 |
| **HTML ID/Class** | `.avatar` |
| **Description** | Contributor avatar |
| **Content** | "A" |
| **Styles** | `background: #f97316;` |

###### D-125c: Project Updated
| Property | Value |
|----------|-------|
| **Line** | 2853-2855 |
| **HTML ID/Class** | `.project-updated` |
| **Description** | Update timestamp |
| **Content** | "Updated 1d ago" |

---

#### D-126: New Project Card
| Property | Value |
|----------|-------|
| **Line** | 2859 |
| **HTML ID/Class** | `.new-project-card` |
| **Description** | Call-to-action card for creating new project |
| **Event** | `onclick="showView('create-project')"` |
| **Nested Elements** | D-127, D-128, D-129 |

##### D-127: New Project Card Icon
| Property | Value |
|----------|-------|
| **Line** | 2860 |
| **HTML ID/Class** | `.new-project-card-icon` |
| **Description** | Plus icon in center of card |
| **Content** | ➕ |

##### D-128: New Project Card Title
| Property | Value |
|----------|-------|
| **Line** | 2861 |
| **HTML ID/Class** | `.new-project-card-title` |
| **Description** | Card heading |
| **Content** | "Start New Project" |

##### D-129: New Project Card Description
| Property | Value |
|----------|-------|
| **Line** | 2862 |
| **HTML ID/Class** | `.new-project-card-desc` |
| **Description** | Card subtext |
| **Content** | "Connect to a VPS, local folder, or GitHub repo." |

---

## ELEMENT SUMMARY

### Global Navigation (G-01 to G-09)
| ID | Name | Line | Type |
|----|------|------|------|
| G-01 | Global Navigation Bar Container | 2522 | Container |
| G-02 | Logo Container | 2524 | Container |
| G-03 | Logo Icon | 2525 | Icon |
| G-04 | Brand Name | 2526 | Text |
| G-05 | Navigation Tabs Container | 2528 | Container |
| G-06 | Dashboard Tab Button | 2529 | Button |
| G-07 | Workspace Tab Button | 2530 | Button |
| G-08 | Settings Tab Button | 2531 | Button |
| G-09 | Create Project Tab Button | 2532 | Button |

### Dashboard Sidebar (D-03 to D-47)
| ID | Name | Line | Type |
|----|------|------|------|
| D-03 | Sidebar | 2540 | Container |
| D-04 | Sidebar Expand Button | 2542 | Button |
| D-05 | Sidebar Navigation | 2543 | Container |
| D-06 | Main Nav Section | 2544 | Container |
| D-07 | Main Section Title | 2545 | Text |
| D-08 | Dashboard Nav Item | 2546 | Nav Item |
| D-09 | Dashboard Nav Icon Container | 2547 | Container |
| D-10 | Dashboard Nav Icon | 2548-2553 | SVG |
| D-11 | Settings Nav Item | 2557 | Nav Item |
| D-12 | Settings Nav Icon Container | 2558 | Container |
| D-13 | Settings Nav Icon | 2559-2562 | SVG |
| D-14 | Workspaces Nav Section | 2568 | Container |
| D-15 | Workspaces Section Title Container | 2569 | Container |
| D-16 | Workspaces Label | 2570 | Text |
| D-17 | Workspaces Title Actions Container | 2571 | Container |
| D-18 | Create Project Button (Small) | 2572 | Button |
| D-19 | Create Project Button Icon | 2573-2576 | SVG |
| D-20 | Sidebar Collapse Button | 2578 | Button |
| D-21 | Customers Workspace Item | 2583 | Clickable |
| D-22 | Customers Folder Icon | 2584-2586 | SVG |
| D-23 | Customers Label | 2587 | Text |
| D-24 | Customers Expand Indicator | 2588 | Text |
| D-25 | Customers Workspace Children | 2590 | Container |
| D-26 | Project: Acme Corp Website | 2591 | Clickable |
| D-27 | Acme Corp File Icon | 2592-2595 | SVG |
| D-28 | Project: API Backend (Active) | 2598 | Clickable |
| D-29 | API Backend File Icon | 2599-2602 | SVG |
| D-30 | Project: Beta Inc Dashboard | 2605 | Clickable |
| D-31 | Beta Inc File Icon | 2606-2609 | SVG |
| D-32 | Personal Workspace Item | 2615 | Clickable |
| D-33 | Personal Folder Icon | 2616-2618 | SVG |
| D-34 | Personal Label | 2619 | Text |
| D-35 | Personal Collapse Indicator | 2620 | Text |
| D-36 | Archives Workspace Item | 2624 | Item |
| D-37 | Archives Icon | 2625-2629 | SVG |
| D-38 | Archives Label | 2630 | Text |
| D-39 | Sidebar Footer | 2635 | Container |
| D-40 | New Project Button (Large) | 2636 | Button |
| D-41 | New Project Button Icon | 2637-2640 | SVG |
| D-42 | User Profile Container | 2643 | Clickable |
| D-43 | User Avatar | 2644 | Avatar |
| D-44 | User Info Container | 2645 | Container |
| D-45 | User Name | 2646 | Text |
| D-46 | User Plan | 2647 | Text |
| D-47 | User Settings Icon | 2649-2652 | SVG |

### Dashboard Main Content (D-48 to D-129)
| ID | Name | Line | Type |
|----|------|------|------|
| D-48 | Main Content Container | 2658 | Container |
| D-49 | Top Bar | 2659 | Container |
| D-50 | Search Bar Container | 2660 | Container |
| D-51 | Search Icon | 2661 | Icon |
| D-52 | Search Input | 2662 | Input |
| D-53 | Top Bar Actions Container | 2664 | Container |
| D-54 | Docs Link | 2665 | Link |
| D-55 | Community Link | 2666 | Link |
| D-56 | Notifications Button | 2667 | Button |
| D-57 | Chat/Messages Button | 2668 | Button |
| D-58 | Page Content Container | 2672 | Container |
| D-59 | Breadcrumb Navigation | 2673 | Container |
| D-60 | Breadcrumb Home Link | 2674 | Link |
| D-61 | Breadcrumb Separator | 2675 | Text |
| D-62 | Breadcrumb Current Page | 2676 | Text |
| D-63 | Page Header | 2679 | Container |
| D-64 | Page Header Text Container | 2680 | Container |
| D-65 | Page Title | 2681 | Text |
| D-66 | Page Subtitle | 2682 | Text |
| D-67 | Header Actions Container | 2684 | Container |
| D-68 | Refresh All Button | 2685 | Button |
| D-69 | Refresh Icon | 2686-2690 | SVG |
| D-70 | Create Project Button (Header) | 2693 | Button |
| D-71 | Create Icon | 2694-2697 | SVG |
| D-72 | Stats Grid | 2704 | Container |
| D-73 | Stat Card: Active Sessions | 2705 | Card |
| D-74 | Stat Header (Active Sessions) | 2706 | Container |
| D-75 | Stat Icon (Blue) | 2707 | Container |
| D-75a | Lightning Bolt Icon | 2708-2710 | SVG |
| D-76 | Stat Badge (+20%) | 2712 | Badge |
| D-77 | Stat Label: Active Sessions | 2714 | Text |
| D-78 | Stat Value: 12 | 2715 | Text |
| D-78a | Stat Desc: Providers | 2716 | Text |
| D-79 | Stat Card: Total Projects | 2718 | Card |
| D-80 | Stat Header (Total Projects) | 2719 | Container |
| D-80a | Stat Icon (Green) | 2720 | Container |
| D-80b | Users Icon | 2721-2726 | SVG |
| D-81 | Stat Badge (+5%) | 2728 | Badge |
| D-82 | Stat Label: Total Projects | 2730 | Text |
| D-83 | Stat Value: 48 | 2731 | Text |
| D-84 | Stat Desc: GitHub/Local | 2732 | Text |
| D-85 | Stat Card: Connected LLMs | 2734 | Card |
| D-86 | Stat Header (Connected LLMs) | 2735 | Container |
| D-86a | Stat Icon (Purple) | 2736 | Container |
| D-86b | Monitor Icon | 2737-2741 | SVG |
| D-87 | Stat Badge (Stable) | 2743 | Badge |
| D-88 | Stat Label: Connected LLMs | 2745 | Text |
| D-89 | Stat Value: 5 | 2746 | Text |
| D-90 | Stat Desc: OpenRouter | 2747 | Text |
| D-91 | Section Header | 2752 | Container |
| D-92 | Section Title Container | 2753 | Container |
| D-93 | Folder Icon | 2754-2756 | SVG |
| D-94 | View Toggle Container | 2759 | Container |
| D-95 | Grid View Button (Active) | 2760 | Button |
| D-96 | Grid Icon | 2761-2766 | SVG |
| D-97 | List View Button | 2768 | Button |
| D-98 | List Icon | 2769-2773 | SVG |
| D-99 | Projects Grid | 2778 | Container |
| D-100 | Project Card: API Backend | 2779 | Card |
| D-101 | Workspace Label: Customers | 2780 | Text |
| D-102 | Project Card Header | 2781 | Container |
| D-103 | Title: API Backend Optimization | 2782 | Text |
| D-104 | Menu Button | 2783 | Button |
| D-105 | Description | 2785 | Text |
| D-106 | Tags Container | 2786 | Container |
| D-107 | VPS Tag | 2787-2795 | Tag |
| D-108 | Node.js Tag | 2796-2803 | Tag |
| D-109 | Card Footer | 2805 | Container |
| D-109a | Avatars Container | 2806 | Container |
| D-109b | Avatar G | 2807 | Avatar |
| D-109c | Avatar C | 2808 | Avatar |
| D-109d | Updated Container | 2810 | Container |
| D-109e | Activity Dot | 2811 | Indicator |
| D-110 | Project Card: Frontend UI Kit | 2817 | Card |
| D-111 | Workspace Label: Customers | 2818 | Text |
| D-112 | Project Card Header | 2819 | Container |
| D-113 | Title: Frontend UI Kit | 2820 | Text |
| D-114 | Menu Button | 2821 | Button |
| D-115 | Description | 2823 | Text |
| D-116 | Tags Container | 2824 | Container |
| D-117 | Local Tag | 2825 | Tag |
| D-118 | React + Tailwind Tag | 2826 | Tag |
| D-119 | Card Footer | 2828 | Container |
| D-119a | Avatars Container | 2829 | Container |
| D-119b | Avatar G | 2830 | Avatar |
| D-119c | Updated | 2832-2834 | Text |
| D-120 | Project Card: Portfolio | 2838 | Card |
| D-121 | Workspace Label: Personal | 2839 | Text |
| D-122 | Project Card Header | 2840 | Container |
| D-122a | Title: Portfolio Website | 2841 | Text |
| D-122b | Menu Button | 2842 | Button |
| D-123 | Description | 2844 | Text |
| D-124 | Tags Container | 2845 | Container |
| D-124a | GitHub Tag | 2846 | Tag |
| D-124b | Next.js Tag | 2847 | Tag |
| D-125 | Card Footer | 2849 | Container |
| D-125a | Avatars Container | 2850 | Container |
| D-125b | Avatar A | 2851 | Avatar |
| D-125c | Updated | 2853-2855 | Text |
| D-126 | New Project Card | 2859 | Card |
| D-127 | New Project Icon | 2860 | Icon |
| D-128 | New Project Title | 2861 | Text |
| D-129 | New Project Description | 2862 | Text |

---

## ELEMENT COUNTS

| Category | Count |
|----------|-------|
| **Global Navigation** | 9 |
| **Dashboard Sidebar** | 45 |
| **Dashboard Main Content** | 73 |
| **TOTAL** | 127 |

### By Element Type
| Type | Count |
|------|-------|
| Containers | 42 |
| Buttons | 16 |
| Text/Labels | 35 |
| SVG Icons | 22 |
| Clickable Items | 8 |
| Cards | 4 |
| Tags | 8 |
| Avatars | 5 |
| Inputs | 1 |
| Links | 3 |
| Badges | 3 |
| Indicators | 1 |

---

## INTERACTION MAP

### Click Events
| Element ID | Event Handler | Target |
|------------|---------------|--------|
| G-06 | `showView('dashboard')` | Dashboard View |
| G-07 | `showView('workspace')` | Workspace View |
| G-08 | `showView('settings')` | Settings View |
| G-09 | `showView('create-project')` | Create Project View |
| D-04 | `toggleDashboardSidebar()` | Expand Sidebar |
| D-11 | `showView('settings')` | Settings View |
| D-18 | `showView('create-project')` | Create Project View |
| D-20 | `toggleDashboardSidebar()` | Collapse Sidebar |
| D-21 | `toggleWorkspace(this)` | Expand/Collapse Customers |
| D-26 | `showView('workspace')` | Workspace View |
| D-28 | `showView('workspace')` | Workspace View |
| D-30 | `showView('workspace')` | Workspace View |
| D-32 | `toggleWorkspace(this)` | Expand/Collapse Personal |
| D-40 | `showView('create-project')` | Create Project View |
| D-42 | `showView('settings')` | Settings View |
| D-70 | `showView('create-project')` | Create Project View |
| D-100 | `showView('workspace')` | Workspace View |
| D-110 | `showView('workspace')` | Workspace View |
| D-120 | `showView('workspace')` | Workspace View |
| D-126 | `showView('create-project')` | Create Project View |

# Session Notes: Landing Page Integration Plan

**Date**: 2026-02-07
**Source file**: `/root/dev/Hub-LLM/hubllm-demo-v7_3.html` (2058 lines, single-file HTML/CSS/JS)
**Context**: User designed a complete public landing page for hubllm.dev. Currently unauthenticated users go straight to AuthPage. This landing page should be the first thing visitors see.

---

## What Was Done This Session

1. **MODEL-04 reviewed and approved** — Dynamic model list from OpenRouter API. Merged to main, Coolify deploying.
2. **BUG-35 created** — Setup wizard white space on mobile. Root cause: `minHeight: 100vh` inside flex layout + no body background. Priority 2, pending.
3. **Landing page analyzed** — Full plan below.

---

## Landing Page Analysis (`hubllm-demo-v7_3.html`)

### Structure (what it contains)
- **Header**: Sticky, tagline "Pro Vibe-Coding", logo (Hub/LLM/.dev), pipeline "Code > Connect > Deploy", feature icons (SSH, VPS, Terminal)
- **Hub Box** (main interactive demo area):
  - Chat header with model selector dropdown (9 demo models with search/filter)
  - Nav menu: About, Pricing, Contact, Sign Up
  - Expandable info panels (About, Pricing)
  - **Pricing section**: 3 tiers — Pro (FREE for first 500, normally $9.99/mo), Free ($0, 1 VPS), Plus ($3.99/mo)
  - Demo chat messages (fake conversation)
  - Chat input with send button + typing indicator
  - File explorer with project selector + VS Code-style tree (3 demo projects)
  - Terminal toggle with fake terminal (supports ls, pwd, cd, clear)
- **VPS Section**: Cable animations connecting to 3 demo VPS cards (DigitalOcean, Vultr, Vercel) with active/standby states
- **Traveling light**: Animated glow that slides back and forth along the hub box top border
- **Floating particles**: Background particle animation
- **Footer**: Simple tagline

### Design Language
- Background: dark gradient `#0a0f1a` → `#0d1520` → `#080c14`
- Primary: `#38bdf8` (sky blue — different from app's `#3b82f6`)
- Accent: `#f97316` (orange — matches app)
- Success: `#22c55e` (matches app)
- Grid overlay pattern, floating particles
- Font: system-ui / Segoe UI (not monospace)

### Key Parsing Challenge
The file is a single HTML document with:
- ~1349 lines of CSS (in `<style>` tag)
- ~560 lines of HTML (body content)
- ~410 lines of vanilla JS (in `<script>` tag)
All must be converted to React patterns (state, JSX, CSS-in-JS or stylesheet).

---

## Integration Plan (3 tasks)

### Task 1: BUG-35 — Setup wizard mobile fix (already queued, priority 2, size S)
- Fix white space bleed on mobile
- Add `html, body { background-color: #0f1419 }` to index.css
- Change Setup.jsx `minHeight: 100vh` → `height: 100%` + `overflowY: auto`
- Responsive card padding with `clamp(20px, 5vw, 40px)`

### Task 2: FEAT-12 — Landing page React conversion (size L, priority 3)
**Convert `hubllm-demo-v7_3.html` into a React component.**

What to create:
- `frontend/src/pages/LandingPage.jsx` — main component
- `frontend/src/pages/LandingPage.css` — extracted styles (or inline styles matching project pattern)
- Possibly sub-components: `LandingHeader`, `HubBoxDemo`, `PricingSection`, `VPSDemo`

Conversion work:
1. CSS: Extract from `<style>` tag → either `LandingPage.css` or inline styles in JSX
2. HTML: Convert to JSX (className, camelCase styles, self-closing tags, etc.)
3. JS interactions → React state:
   - `useState` for: model selector open/close, selected model, search filter, file tree open/close, terminal open/close, VPS section open/close, current project, chat messages, panel open states
   - `useEffect` for: particle generation, traveling light animation (requestAnimationFrame)
   - Event handlers: model select, file toggle, terminal input, chat send, panel toggle
4. Keep all demo content as-is (fake chat, fake file tree, fake terminal commands)
5. "Sign Up" CTA → `onClick={() => navigate('/auth')}` or similar
6. Pricing buttons → navigate to sign up
7. Responsive — file already has some mobile considerations but may need `@media` queries

### Task 3: FEAT-13 — Landing page routing + auth flow (size S, priority 3)
**Wire the landing page into the app routing so unauthenticated visitors see it first.**

Current flow: Unauthenticated → `AuthPage` (login/signup form)
New flow: Unauthenticated → `LandingPage` → click "Sign Up" → `AuthPage` → wizard → dashboard

Changes:
- `App.jsx` (AppRouter, ~line 313): Instead of showing `AuthPage` directly when `!isAuthenticated`, show `LandingPage` as the default route
- Add route for `/auth` or `/login` that shows `AuthPage`
- Landing page "Sign Up" / "Log In" buttons navigate to `/auth`
- Landing page "Pricing" buttons also navigate to `/auth` with appropriate query params
- After successful auth → existing flow kicks in (wizard if setup not complete, else dashboard)

### Future considerations (not tasks yet)
- **Mobile landing page**: User mentioned having a mobile-specific design for signup flow — can be a follow-up
- **Mobile audit**: Check other views (Dashboard, Settings, Workspace) for mobile rendering issues
- **SEO/meta tags**: Landing page should have proper meta tags, OpenGraph, etc.
- **Analytics**: Track CTA clicks, pricing tier interest
- **A/B testing**: Different pricing displays

---

## Current Queue State After This Session

| Priority | ID | Name | Status |
|----------|----|------|--------|
| 2 | BUG-35 | Setup wizard mobile white space | pending |
| 4 | BUBBLE-01 | Bubble view polish | shelved |

**Next steps**:
1. Have Claude B do BUG-35 (quick fix)
2. Create FEAT-12 (landing page conversion) — this is the big one
3. Create FEAT-13 (routing) — depends on FEAT-12

# BRAHMA + ASTRA — Frontend Design Master v1

**Purpose:** One source-of-truth frontend design handoff for implementation.  
**Approval:** BRAHMA v1 and ASTRA v1 are approved and locked by the user.  
**Frontend:** React + JavaScript only. Do not use TypeScript or `.tsx`/`.ts` files.  
**Change control:** Do not change identity, colors, typography, layouts, or ASTRA's opening storyboard without explicit user approval.

## 1. Product relationship
- **BRAHMA** is the main intelligence platform.
- **ASTRA** is a separate coding/development workspace within the BRAHMA product family, not a renamed chat screen.
- Use distinct routes and workspace state for ASTRA while preserving family-level polish.
- No reuse of old FRIDAY code or OpenJarvis unless explicitly requested.

## 2. BRAHMA — locked design system

### Brand
- Wordmark: `BRAHMA`
- Tagline: **Think Deeper • Create Faster • Build Bigger**
- Identity direction: gold lotus/mandala mark.
- Visual language: premium dark cosmic UI; restrained glassmorphism; gold brand accents, violet interactions, cyan technical accents.
- Keep cosmic artwork mainly in splash/hero areas; text-heavy work surfaces must stay readable.

### Exact tokens
| Token | Value | Intended use |
|---|---|---|
| `--brand-gold` | `#F6C87A` | Brand mark/emphasis |
| `--brand-gold-light` | `#FFE5A7` | Highlights |
| `--brand-violet` | `#8B5CF6` | Main interactive/selected state |
| `--brand-cyan` | `#06B6D4` | Technical/status accent |
| `--brand-purple` | `#A855F7` | Secondary glow |
| `--bg-base` | `#0B0F1A` | App background |
| `--bg-elevated` | `#111827` | Elevated surfaces/sidebar |
| `--surface-card` | `#1E1B3D` | Cards/glass panels |
| `--text-primary` | `#F7F7FB` | Primary text |
| `--text-secondary` | `#A7AEC2` | Secondary text |
| `--border-default` | `#30384D` | Borders |
| `--status-success` | `#22C55E` | Success |
| `--status-warning` | `#F59E0B` | Warning |
| `--status-error` | `#EF4444` | Error |

### Typography
- UI: **Poppins**
- Code/terminal: **JetBrains Mono**
- Display: 32–40 px / 700
- Page title: 24 px / 600
- Section title: 20 px / 600
- Card title: 16 px / 500–600
- Body: 14–16 px / 400
- Metadata: 12 px / 400
- Code: 12–14 px / 400–500

### BRAHMA shell and screens
**Desktop shell:** persistent left sidebar with brand and navigation; header actions/account menu; consistent content grid; profile near sidebar bottom. Cards use dark elevated surfaces, subtle borders and restrained glow. Gold = brand emphasis; violet = primary selection/action; cyan = technical/status accent.

Screen inventory:
1. Splash / launch — approved mark, wordmark and tagline; progress only for real initialization.
2. Login / sign-up — validation, show/hide password, recovery and verification states.
3. Onboarding — explain capabilities, optional preferences/consent, skip/revisit.
4. Home dashboard — greeting, “Ask Brahma anything” composer, quick actions, recent activity/projects; never fabricate counts.
5. Chat — history, streaming, stop, copy, retry/regenerate, attachments and citations when available.
6. Research — query, source filters, progress, results, source details and no-results state.
7. Documents — upload validation, processing, list, preview/analysis, retry/delete.
8. Images — prompt, supported options, progress, gallery, variations/editing and failure state.
9. Projects — create/edit/search, project detail, files and activity.
10. Memory — inspect/add/edit/delete, pause/disable, export/delete controls.
11. Agents — capabilities, enabled/run state, permissions disclosure; no provider brand as primary agent identity.
12. ASTRA launcher — clearly opens a separate workspace; do not claim ready before initialization.
13. Settings/profile — appearance, security, sessions, integrations and data export/deletion; billing only if implemented.
14. Notifications/activity — read/unread, preferences, empty/loading/error.
15. Shared overlays and states — dialogs, toasts, loading, empty, offline, permission denied, validation/server/rate-limit errors, success, retry and cancellation.

### Home dashboard content hierarchy
1. Brand/header and account controls.
2. Clear greeting and primary “Ask Brahma anything” composer.
3. Quick actions for common workflows.
4. Recent projects and activity based on real data.
5. ASTRA entry point that visually reads as a distinct workspace.
Do not invent activity, metrics, model status, or decorative nonfunctional controls.

## 3. ASTRA — locked design system

### Identity
- Name: **ASTRA**
- Descriptor: **CODE · CREATE · DEPLOY**
- Visual direction: Indian-mythology-inspired celestial arrow/astral spear within a circular yantra-like orbit, abstract geometry and light.
- Do not reuse BRAHMA's lotus as ASTRA's logo.
- The concept image is a reference, not a production vector logo. Produce clean SVG assets based on the approved direction.

### Exact tokens
| Token | Value | Intended use |
|---|---|---|
| `--astra-bg` | `#070A18` | Main workspace background |
| `--astra-surface` | `#0D1428` | Sidebar/panels |
| `--astra-panel` | `#101B35` | Elevated work panels |
| `--astra-violet` | `#8B5CF6` | Primary interaction |
| `--astra-electric-blue` | `#38BDF8` | Code/technical highlight |
| `--astra-cyan` | `#22D3EE` | Secondary/status accent |
| `--astra-gold` | `#F6C87A` | Restrained family accent |
| `--astra-text` | `#F7F7FB` | Primary text |
| `--astra-muted` | `#A7AEC2` | Secondary text |
| `--astra-border` | `#263657` | Borders |
| `--astra-success` | `#22C55E` | Passing checks |
| `--astra-warning` | `#F59E0B` | Warnings |
| `--astra-error` | `#EF4444` | Failures |

Typography matches BRAHMA: Poppins UI, JetBrains Mono editor/terminal/diffs/logs.

### ASTRA workspace layout
- **Left rail:** ASTRA mark; New Project; Workspace; AI Chat; File Explorer; Code Editor; Terminal; Run & Debug; Testing; Deploy; Database; Extensions; Settings.
- **Project pane:** project/repository list and search, trust state, branch/status if Git is connected, file tree.
- **Editor center:** tabs, syntax highlighting, line numbers, diagnostics, search and diff view.
- **AI assistant pane:** task prompt, clarifying questions, plan, progress, proposed patch, tool activity and cancel.
- **Bottom panel:** Terminal, Problems, Output, Debug Console and Tests.
- **Header/context:** current project/repository, environment state, branch when available, safe run controls.
- **Responsive:** desktop is primary; tablet can collapse panels; mobile is a constrained review/monitoring mode, not a full IDE.

### ASTRA screens
1. Welcome/project chooser: create, recent project, import repository, trust warning and templates.
2. Project import/create: source/path, branch if relevant, runtime/dependency detection and trust confirmation.
3. Main coding workspace: explorer, editor, assistant, terminal, run/debug and tests.
4. Task planning: goal, clarifying questions, planned files/actions, risk and approval.
5. Patch/diff review: file-by-file diff, accept/reject/revert and impact summary.
6. Run/debug: start/stop, breakpoints, variables, logs and error explanation.
7. Testing: selected tests, pending/running/pass/fail/skipped, duration, output and rerun.
8. Git/repository: status, diff, branch and commit preparation; never silently commit/push.
9. Environment/dependencies: runtime, install proposal, lockfile changes and errors.
10. Deployment: target/environment, changes preview, explicit confirmation and actual result.
11. Permissions/audit: tool permissions, sandbox status, commands, approvals, cancellations and logs.
12. Settings/shortcuts: editor preferences, key bindings, AI and environment preferences.
13. Shared states: empty/loading, untrusted repository, blocked command, timeout, test failure, offline and service error.

## 4. ASTRA opening animation — locked storyboard
Approximate total: **5–7 seconds**, skippable after the emblem reveal.
1. **Handoff (0.0–0.6 s):** BRAHMA dims smoothly when ASTRA is selected.
2. **Celestial field (0.6–1.6 s):** indigo field and fine violet/blue orbital geometry.
3. **Energy gathers (1.6–2.6 s):** light points converge; symbolic celestial arrow forms.
4. **Emblem reveal (2.6–3.6 s):** ASTRA mark and `CODE · CREATE · DEPLOY` appear.
5. **Arrow transition (3.6–4.6 s):** narrow light trail leads into the workspace.
6. **Workspace materializes (4.6–6.0 s):** explorer, editor, assistant and terminal settle into place.
7. **Ready state:** only after actual project/services initialization; otherwise show loading/error and retry.

Motion rules: skip control after reveal; respect reduced-motion with short crossfade/static emblem; no strobing; sound off by default; do not delay an already-ready workspace or falsely indicate readiness.

## 5. Interaction and component rules
- All buttons, tabs, inputs and menu items must have real behavior.
- Buttons: default, hover, focus, disabled and loading.
- Inputs: label, focus, validation, disabled and error states.
- Cards: default, hover/selected only where meaningful.
- Dialogs: keyboard trap, Escape behavior where appropriate, focus return.
- Agent/task states: queued, planning, awaiting approval, editing, testing, succeeded, failed, cancelled.
- Diff states: pending review, accepted, rejected, reverted.
- Environment states: ready, initializing, blocked, failed.
- Test states: pending, running, passed, failed, skipped.
- Never use color alone to communicate status. Include text/icons.
- No fabricated metrics, test results, availability, activity or deployment success.

## 6. Responsive and accessibility requirements
- Mobile: up to 767 px; collapsible navigation, one-column cards, no horizontal overflow.
- Tablet: 768–1199 px; compact navigation and two columns where appropriate.
- Desktop: 1200 px and above; full navigation and dashboard/workspace grid.
- Keyboard access for navigation, forms, dialogs, chat and editor controls.
- Visible focus, semantic landmarks, labels, contrast checks and assistive-technology announcements.
- Respect reduced-motion preferences.
- Verify screenshots at agreed viewport sizes against approved visual references.

## 7. Frontend implementation handoff
Recommended frontend structure:
```text
frontend/
  public/
    brand/
      brahma-mark.svg
      astra-mark.svg
      favicon.svg
  src/
    app/
      App.jsx
      routes.jsx
    assets/
    components/
      ui/
      layout/
      feedback/
    design-system/
      tokens.css
      typography.css
      globals.css
    features/
      auth/
      home/
      chat/
      research/
      documents/
      images/
      projects/
      memory/
      agents/
      astra/
      settings/
      notifications/
    hooks/
    services/
    utils/
    main.jsx
```

Implementation order:
1. Add CSS tokens/fonts and build accessible shared primitives.
2. Build BRAHMA shell and approved Home Dashboard.
3. Add BRAHMA route skeletons and screen states.
4. Add separate ASTRA shell and project chooser.
5. Implement ASTRA editor/assistant/diff/bottom-panel layout.
6. Implement ASTRA animation and reduced-motion/skip behavior.
7. Connect real APIs; avoid mock status once integrated.
8. Add responsive, accessibility, visual regression and end-to-end tests.

Example central CSS tokens:
```css
:root {
  --brand-gold: #F6C87A;
  --brand-gold-light: #FFE5A7;
  --brand-violet: #8B5CF6;
  --brand-cyan: #06B6D4;
  --brand-purple: #A855F7;
  --bg-base: #0B0F1A;
  --bg-elevated: #111827;
  --surface-card: #1E1B3D;
  --text-primary: #F7F7FB;
  --text-secondary: #A7AEC2;
  --border-default: #30384D;
}
[data-product="astra"] {
  --bg-base: #070A18;
  --bg-elevated: #0D1428;
  --surface-card: #101B35;
  --brand-violet: #8B5CF6;
  --brand-cyan: #22D3EE;
  --border-default: #263657;
}
```
This example demonstrates centralized theming; use explicit product-scoped tokens for all ASTRA-specific values in the actual implementation.

## 8. Definition of frontend done
- Appearance matches approved references; no unauthorized design changes.
- All routes, controls and state transitions are functional.
- Loading, empty, error, success, permission-denied and cancellation states are covered.
- Responsive layouts verified at mobile/tablet/desktop breakpoints.
- Keyboard navigation, focus, labels, contrast and reduced motion verified.
- Logos are clean vector assets, not cropped concept art.
- Real API states replace placeholders; no fabricated success or metrics.
- Automated component, route, visual and end-to-end tests pass and results are reported honestly.

## 9. Reference images included
- `BRAHMA_Complete_Screen_Atlas_v1.png` — broad BRAHMA screen direction.
- `BRAHMA_Home_Dashboard_Reference_v1.png` — approved Home Dashboard reference.
- `ASTRA_Complete_Design_Concept_v1.png` — ASTRA identity, storyboard and workspace concept board.

**Final rule:** This master is the single frontend design handoff. BRAHMA and ASTRA identity, palettes, typography, layouts and ASTRA storyboard are locked. Ask before changing any visible design decision.

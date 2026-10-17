# BRAHMA — Screen-by-Screen Design References v1

**Status:** BRAHMA v1 design tokens and typography are approved and locked by the user. This document records the screen-by-screen behavior references. The atlas is a visual direction reference; production implementation should use the written rules below where generated collage text is illegible or inconsistent.

## Locked v1 design tokens

| Token | Value | Usage |
|---|---|---|
| `brand.gold` | `#F6C87A` | Brand mark and emphasis |
| `brand.goldLight` | `#FFE5A7` | Gold highlights |
| `brand.violet` | `#8B5CF6` | Main interactive accent |
| `brand.cyan` | `#06B6D4` | Technical/status accent |
| `brand.purple` | `#A855F7` | Secondary glow |
| `bg.base` | `#0B0F1A` | Main background |
| `bg.elevated` | `#111827` | Elevated panels |
| `surface.card` | `#1E1B3D` | Cards and glass panels |
| `text.primary` | `#F7F7FB` | Primary text |
| `text.secondary` | `#A7AEC2` | Secondary text |
| `border.default` | `#30384D` | Borders |
| `status.success` | `#22C55E` | Success |
| `status.warning` | `#F59E0B` | Warning |
| `status.error` | `#EF4444` | Error |
| `font.ui` | `Poppins` | All main UI text |
| `font.code` | `JetBrains Mono` | Code and terminal |

**Lock rule:** these values must not be silently changed. Any required exception must be proposed for explicit approval. The final production logo must be a clean vector asset, not a crop of a concept board.

## Shared shell
- Persistent desktop sidebar: BRAHMA mark and wordmark; Home, Chat, Research, Documents, Images, Projects, Memory, Agents, ASTRA; profile at bottom.
- Main content uses dark surfaces and restrained glassmorphism; cosmic artwork is reserved for splash/hero surfaces.
- Gold is brand emphasis; violet is primary selection/action; cyan is secondary technical/status accent.
- Poppins is the UI font; JetBrains Mono is reserved for code-like output.
- Focus, hover, disabled, loading, success, empty and error states are required; reduced-motion preferences must be honored.
- All actions must work and reflect real backend state. No fabricated activity, status, counts, or availability.

## Screen-by-screen reference notes

### 01 — Splash / Launch
Purpose: establish brand identity before entering the app. Show the approved gold lotus/mandala mark, BRAHMA wordmark, tagline, and progress only while real initialization work is running. If initialization fails, replace the progress state with a clear retry action.

### 02 — Login / Sign-up
Purpose: secure account entry. Include Login and Sign Up tabs, email and password fields, show/hide password, remember-me only if supported, password recovery, validation errors, and verification flow. Social login buttons appear only when the relevant provider integration is actually configured.

### 03 — Home Dashboard
Purpose: launchpad for the platform. Use the persistent sidebar, greeting, primary “Ask Brahma anything” composer, eight main module cards, recent activity, quick tools, and recent projects. Activity must be sourced from real user data; never hard-code fake live events or counts.

### 04 — Chat
Purpose: the primary conversational workspace. Include conversation history, agent/model selector only for available choices, streaming answer, stop generation, copy, retry/regenerate, attachment, and citation actions when available. Clearly distinguish user messages, assistant responses, tool activity, and errors.

### 05 — Research
Purpose: conduct source-backed research. Include topic search, source/category filters, progress state, result list, source count when real, source details, citations, and empty/error states. A result should not imply a source was consulted unless it was actually retrieved.

### 06 — Documents
Purpose: manage uploaded documents. Include upload, search, file name/type/date, processing state, preview/analysis actions, delete, file-size/type validation, and failed-processing recovery. Display permission and ownership boundaries on the server.

### 07 — Images
Purpose: create and manage generated images. Include prompt composer, supported options such as aspect ratio, generate action, progress/cancel, gallery, favorites, and variation/edit actions only where implemented. Do not show unsupported model controls.

### 08 — Projects
Purpose: organize multi-step work. Include project search, create project, status/filter controls, project cards, timestamps, file count only when real, and project detail with context/files/activity.

### 09 — Memory
Purpose: transparent user-controlled personalization. Include search, categories, add/edit/delete, pause/disable memory, explain what is stored, and export/delete options. Memory should be opt-in/controllable and never be hidden from the user.

### 10 — Agents
Purpose: expose product-owned specialist workflows. Each card should explain role, capabilities, permissions, and availability. Avoid provider/model brands as the primary agent identity; do not imply an agent is active or available unless it is.

### 11 — ASTRA Launcher
Purpose: transition from BRAHMA to a separate coding environment. Use ASTRA’s own celestial-arrow emblem and blue/violet identity. The launcher initiates the approved launch sequence; readiness is shown only after project context and services actually initialize.

### 12 — Settings
Purpose: account and product control. Sections include profile, appearance, AI/model preferences, privacy/security, sessions, data/storage, integrations, notifications, shortcuts, and about. Destructive actions require confirmation and should explain consequences.

## Shared responsive behavior
- Mobile: collapse sidebar into accessible navigation; one-column content; composer remains reachable; no horizontal overflow.
- Tablet: compact navigation and responsive two-column cards where practical.
- Desktop: full sidebar, dashboard grid, constrained text widths for chat/research.
- Suggested breakpoints: 767 px and 1199 px; validate via screenshot tests rather than assuming the breakpoints fit every component.

## Definition of done
A screen is accepted only when the approved tokens/assets are used; all controls work; loading, empty, error and success states exist; keyboard and screen-reader behavior is tested; responsive screenshots are reviewed; and deviations are approved. The atlas is not a substitute for final vector logo files or browser screenshots from the implemented application.

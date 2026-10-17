# Prompt 00 — Frontend Master Kickoff

Act as the lead frontend engineer for the existing BRAHMA + ASTRA repository at `M:\brahma-astra`.

## First: inspect, do not overwrite
1. Inspect the actual repository structure, `IMPLEMENTATION_STATUS.md`, `package.json`, existing backend API contracts, environment examples, and all frontend references in `docs/frontend-reference/` (or the supplied package location).
2. Read the complete frontend design master and inspect all reference images before coding.
3. Confirm which backend endpoints actually exist by inspecting source code and API contracts. Do not invent endpoints.
4. Produce a concise implementation plan and identify any conflict between repository state and the documents. Preserve existing backend files and data.

## Product and design freeze
- **BRAHMA** is the main intelligence platform. **ASTRA** is its distinct coding/development workspace.
- BRAHMA v1 and ASTRA v1 are approved and locked. Preserve exact identity, palettes, typography, screen layouts, logo directions, and ASTRA opening storyboard. No redesign or token substitutions without explicit user approval.
- Use Poppins for UI and JetBrains Mono for code/editor/terminal.
- Use the exact centralized tokens from the design master; use product-scoped ASTRA tokens.
- Do not call the product “Brahma AI.”
- Do not use OpenJarvis or reuse old FRIDAY code.

## Stack and environment
- Build frontend in `apps/web/` using React + JavaScript + Vite.
- No TypeScript, `.ts`, or `.tsx` files.
- Native Windows / PowerShell / npm workflow. Docker and Docker Compose must not be required.
- Preserve the existing Node.js + Express API and Python FastAPI services. Do not perform unrelated backend refactors.
- Configure API URLs through environment variables, with a safe local development default. Never expose secrets in frontend variables.

## Scope
Implement the approved frontend in incremental milestones:
1. Vite/React foundation, routing, centralized tokens, fonts, shared accessible components, and app shells.
2. Authentication pages and BRAHMA Home Dashboard.
3. BRAHMA chat and remaining approved screen routes/states.
4. Distinct ASTRA launcher, project chooser, workspace layout, assistant pane, diff review, bottom panel, and opening animation.
5. API integration, responsive/accessibility verification, and final test/reporting.

Use the approved docs for screen inventory and behavior. Visible controls must work or be removed/clearly disabled. Add loading, empty, error, offline, permission-denied, and success states as appropriate. Use clearly labeled mock data only where a real backend capability is unavailable; do not disguise mock data as real.

## ASTRA safety boundary
The ASTRA Runner currently reports execution disabled because a verified sandbox is not active. Preserve this. Never execute generated or user-supplied arbitrary code in the API host, AI service, or ordinary developer process. UI may display a disabled execution state and explain why. Do not claim sandbox verification unless it was actually performed.

## Quality gates
- Keep the approved design master as the source of truth.
- Verify desktop (>=1200px), tablet (768–1199px), and mobile (<=767px) layouts.
- Keyboard navigation, visible focus, semantic labels, contrast, reduced-motion support, and no horizontal overflow.
- Do not fabricate activity, counts, provider status, test results, or deployment success.
- Add/maintain tests and run the actual frontend build/tests after each milestone.
- Update `IMPLEMENTATION_STATUS.md` with what changed, exact commands, actual test output, working URLs, mock-vs-real integrations, and remaining blockers.
- Do not claim success without command output or browser verification.

Begin by inspecting the repository and docs, then present the plan. After that, implement the frontend in manageable milestones without altering the locked designs.

# Prompt 05 — Frontend Final Audit

Perform a verification-only audit of the BRAHMA + ASTRA frontend. Do not redesign or alter any approved visual decisions. Check:
- Exact design tokens, Poppins/JetBrains Mono, approved BRAHMA Home Dashboard, ASTRA identity/layout, and opening storyboard.
- All routes, controls, forms, dialogs, navigation, loading/empty/error/offline/success states.
- Real API integration versus labeled mock/demo behavior; no fabricated success or data.
- Desktop/tablet/mobile layout, no overflow, keyboard/focus/labels/contrast/reduced-motion.
- Native Windows PowerShell/npm install/start/build/test workflow without Docker.
- No secrets in client code or committed environment files.
- ASTRA arbitrary code execution remains disabled unless an actually verified sandbox exists.

Run the real build, unit/component tests, and any available end-to-end checks. Report pass/fail with exact commands and output; do not overstate coverage. Fix only verified defects without changing approved design. Update `IMPLEMENTATION_STATUS.md` with actual frontend URLs, environment variables, commands, implemented features, API integration map, mock-only features, tests, and remaining blockers.

# BRAHMA + ASTRA — Frontend Start Package v1

This package consolidates the previously approved frontend design decisions, visual references, API/repository references, and Antigravity prompts.

## Locked rules
- Product names are exactly **BRAHMA** and **ASTRA**. Do not call the product “Brahma AI”.
- BRAHMA v1 and ASTRA v1 visual designs are approved and locked. Do not change design tokens, typography, screen layouts, identity, or ASTRA opening storyboard without explicit user approval.
- Frontend: React + JavaScript + Vite. No TypeScript.
- Existing backend is in `M:\brahma-astra`; frontend belongs in `apps/web/`.
- Native Windows development; Docker must not be required.
- Do not use OpenJarvis or reuse old FRIDAY code.
- ASTRA Runner arbitrary code execution must remain disabled until a real sandbox is implemented and independently verified. Removing Docker must never bypass this.
- No fake metrics, activity, test results, model availability, deployment success, or pretend backend integration.

## How to use
1. Extract this package under `M:\brahma-astra\docs\frontend-reference\` or copy its contents into the matching repository paths. Do not overwrite the existing backend docs.
2. In Antigravity, begin with `prompts/00_FRONTEND_MASTER_KICKOFF.md`.
3. Let it inspect the repository and docs first. Review the plan and changed files.
4. Use prompts 01–05 one at a time after each milestone passes its checks. They are staged prompts, not instructions to run blindly all at once.
5. Always compare implementation against the reference images and the design master.

## Important authority order
1. Latest explicit user approval in the conversation.
2. `docs/design/BRAHMA_ASTRA_Frontend_Design_Master_v1.md` (single source of truth for frontend).
3. Other design references for detail and visual comparison.
4. Existing backend API contracts and actual implementation for integration.

Some older design documents contain pre-approval language such as “proposed” or “review candidate.” The final design master and latest explicit user approval supersede those older status labels. Do not reopen approved design decisions.

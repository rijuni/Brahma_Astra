# BRAHMA + ASTRA — Milestone 1 Foundation

This is the first frontend milestone: locked design tokens, typography, ambient background, glass primitives, separate BRAHMA/ASTRA palette preview, logo assets, responsive behavior, and reduced-motion support.

> This is a foundation preview, not the completed production frontend. Chat, auth, projects, AI calls, backend integration and the approved ASTRA intro sequence will be implemented and verified in later milestones.

## Install and run

From `M:\brahma-astra\apps\web` in PowerShell:

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

Build check:

```powershell
npm run build
```

## Integration

Copy these frontend files into your existing `apps/web` folder only after backing up the current frontend. Do not copy anything into `services/api` or Python service folders. This package does not change API ports, database settings, Prisma schema, or backend services.

## Design locks
- BRAHMA: dark cosmic environment, gold lotus/mandala identity, Poppins, gold/violet/cyan accents.
- ASTRA: distinct celestial arrow/yantra identity, dedicated blue/violet theme, Poppins + JetBrains Mono.
- Reduced motion is respected.
- No OpenJarvis and no legacy FRIDAY code.


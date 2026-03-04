# ADR 001: Monorepo with pnpm workspaces

## Status

Accepted

## Context

Pixel Office consists of multiple distinct packages:

- `packages/protocol` — shared TypeScript event types
- `packages/server` — standalone Node.js WebSocket server
- `packages/client` — Svelte + PixiJS browser application
- `adapters/crewai` — Python integration for CrewAI
- `adapters/claude-code` — TypeScript integration for Claude Code

These packages need to **share types** (the PixelEvent schema), be developed and tested together, and be published independently if needed. Managing them as separate repositories would require publishing `packages/protocol` to npm just to import it in the client or server during development — a significant friction for a fast-moving project.

## Decision

Use a **pnpm workspaces monorepo**. All packages live under the same repository root, declared in `pnpm-workspace.yaml`. Cross-package imports use the `workspace:*` protocol so that local packages are always resolved from disk during development.

pnpm was chosen over npm or Yarn workspaces because:
- It uses hard links to avoid duplicating `node_modules` across packages (disk efficient)
- Its workspace protocol (`workspace:*`) is explicit and easy to audit
- It has strong monorepo tooling support (filtering, recursive commands)

## Consequences

- All TypeScript packages share the same `packages/protocol` types without a publish step
- `pnpm install` from the repo root installs all dependencies for all packages
- Cross-package imports like `import type { PixelEvent } from '@pixel-office/protocol'` work out of the box in development
- The Python adapter (`adapters/crewai`) is excluded from the workspace (pnpm only manages JS/TS packages) and is installed separately with `pip`
- CI must use pnpm (pinned via `packageManager` in `package.json`)

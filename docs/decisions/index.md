# Architecture Decision Records

This section documents the key design decisions made during the creation of Pixel Office as **Architecture Decision Records (ADRs)**.

## What is an ADR?

An ADR is a short document that captures a single architectural decision: the context that prompted it, what was decided, and what the consequences are. ADRs are written once and rarely changed — they serve as a historical record of *why* the project is shaped the way it is.

## How to read these ADRs

Each ADR follows this structure:

- **Status** — `Accepted`, `Superseded`, or `Deprecated`
- **Context** — The problem or situation that made the decision necessary
- **Decision** — What was chosen and a brief rationale
- **Consequences** — What this decision implies going forward

## Index

| # | Title | Status |
|---|-------|--------|
| [001](/decisions/001-monorepo) | Monorepo with pnpm workspaces | Accepted |
| [002](/decisions/002-pixelevent-protocol) | Typed PixelEvent protocol | Accepted |
| [003](/decisions/003-websocket-architecture) | Autonomous WebSocket server + layered client | Accepted |

# ADR 003: Autonomous WebSocket Server + Layered Client

## Status

Accepted

## Context

The project needs to:

1. Accept events from multiple agent frameworks simultaneously (CrewAI running in Python, Claude Code running as a CLI, potentially others)
2. Display those events in a browser UI in real time
3. Allow the browser client to reconnect after a network interruption and immediately see the current office state
4. Keep the rendering layer (PixiJS) decoupled from the network layer so both can evolve and be tested independently

An in-process server (e.g., a server-side-rendered page or an embedded WebSocket in the client's dev server) would couple the adapter protocol to the frontend build tooling, making it harder to support Python adapters and impossible to have multiple simultaneous adapter connections.

A flat client architecture (WebSocket callbacks directly updating the PixiJS scene) would make testing difficult — you cannot render a PixiJS scene in a unit test environment — and would make it hard to add a secondary UI (e.g., a log panel) that needs the same data.

## Decision

### Autonomous WebSocket server

`packages/server` is a **standalone Node.js process** with no dependency on the client build. It:
- Listens on a configurable port (default `3001`)
- Accepts WebSocket connections from any adapter or browser client
- Maintains an **in-memory snapshot** of the full office state
- Broadcasts every incoming event to all connected browser clients
- Sends the current snapshot to new browser clients on connect

This makes the server language-agnostic from the adapter's perspective (plain WebSocket + JSON) and completely independent of the frontend framework.

### Strict 3-layer client

The client enforces a strict unidirectional data flow:

```
ws/ → stores/ → pixi/
```

- `ws/` is the only layer that touches `WebSocket`. It updates stores.
- `stores/` are the single source of truth for all application state.
- `pixi/` only reads from stores. It never touches `WebSocket`.

## Consequences

- **PixiJS never knows WebSocket.** The PixiJS layer can be tested by writing directly to stores — no WebSocket mock needed.
- **WebSocket never knows PixiJS.** The network layer can be tested by asserting on store state after receiving a mock message.
- **Stores are the seam.** Any future replacement of the rendering engine (e.g., swapping PixiJS for Three.js) requires touching only `lib/pixi/`.
- **The server has no persistence layer.** If it restarts, the snapshot is lost. Adapters must re-emit `agent_started` events for the state to rebuild. This is acceptable for the MVP; a Redis-backed snapshot is a straightforward future extension.
- **Snapshot on connect** ensures a newly connected (or reconnected) client sees the full current state immediately, with no special "catch-up" logic required in the client.

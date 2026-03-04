# Architecture

Pixel Office is organized as a **pnpm workspaces monorepo**. Each concern lives in its own package, while a single shared protocol package ties everything together.

## Monorepo structure

```
pixel-office/
├── packages/
│   ├── protocol/          # Shared typed PixelEvent schema (TypeScript)
│   ├── server/            # Autonomous WebSocket server
│   └── client/            # Svelte + PixiJS browser client
├── adapters/
│   ├── crewai/            # Python adapter using crewai_event_bus
│   └── claude-code/       # TypeScript adapter using a JSONL file watcher
└── docs/                  # This VitePress documentation site
```

## Packages

### `packages/protocol`

The single source of truth for all event types. Both the server and client import their types from here, and adapters serialize events that conform to this schema. See the [Protocol page](/protocol) for the full event catalogue.

### `packages/server`

A standalone Node.js WebSocket server that:
- Accepts connections from any adapter
- Maintains an **in-memory snapshot** of the full office state
- Broadcasts every incoming event to all connected browser clients
- Sends the current snapshot to any new client on connect

See the [Server page](/server) for details.

### `packages/client`

A Svelte application that renders a PixiJS pixel-art office scene. It is organized in three strict layers:

```
src/lib/
├── ws/          # WebSocket connection, event parsing, event handling
├── stores/      # Svelte writable stores (single source of truth)
└── pixi/        # PixiJS scene — reads only from stores
```

See the [Client page](/client) for the full breakdown.

### `adapters/crewai`

A Python package that hooks into the native `crewai_event_bus` and translates CrewAI lifecycle events into PixelEvents sent to the server. See [Adapters → CrewAI](/adapters/crewai).

### `adapters/claude-code`

A TypeScript package that watches `~/.claude/projects/*.jsonl` for new entries written by Claude Code, then converts them to PixelEvents. No modification to Claude agent code is required. See [Adapters → Claude Code](/adapters/claude-code).

## Client data flow

Every piece of state in the client follows a single, unidirectional path:

```
WebSocket
    │
    ▼
eventParser.ts       (raw string → typed PixelEvent)
    │
    ▼
eventHandler.ts      (dispatches to the correct store update)
    │
    ▼
Svelte Stores        (agents, logs, office, connection)
    │
    ▼
PixiJS scene         (subscribes to stores, renders the office)
    │
    ▼
Svelte UI            (subscribes to stores, renders overlays & HUD)
```

## The golden rule

> **PixiJS never knows WebSocket. WebSocket never knows PixiJS.**

The WebSocket layer only updates stores. The PixiJS layer only reads stores. This separation means that each layer can be tested in complete isolation, and replacing either the network transport or the rendering engine requires touching only one layer.

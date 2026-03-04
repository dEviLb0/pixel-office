# Client

The client is a **Svelte + PixiJS** single-page application. It renders a live pixel-art office scene where every agent gets its own desk. The internal architecture is split into three strict, independently testable layers.

## Layer overview

```
src/lib/
├── ws/
│   ├── socket.ts          # WebSocket connection with exponential-backoff reconnect
│   ├── eventParser.ts     # Raw string → typed PixelEvent
│   └── eventHandler.ts    # Dispatches events to the correct store update
├── stores/
│   ├── agents.ts          # Map of agentId → AgentState
│   ├── logs.ts            # Bounded log ring (max 500 entries)
│   ├── office.ts          # Office-level state (reset flag, etc.)
│   └── connection.ts      # WebSocket connection status
└── pixi/
    └── ...                # PixiJS scene graph — subscribes to stores only
```

---

## Layer 1 — `lib/ws/`

This layer owns the network connection. Nothing outside this layer ever touches a WebSocket object.

### `socket.ts`

Manages the WebSocket lifecycle:

- Opens a connection to the server URL (configurable via environment variable)
- On `message`, calls `eventParser.ts` then `eventHandler.ts`
- On `close` or `error`, schedules a reconnect attempt using **exponential backoff** (starting at 1 s, doubling up to a configurable maximum of 30 s)
- Updates the `connection` store with the current status (`connecting`, `connected`, `disconnected`)

### `eventParser.ts`

Converts a raw WebSocket message string into a typed `PixelEvent`:

- Calls `JSON.parse` on the raw string
- Validates the `type` field against the known event discriminators
- Returns a typed `PixelEvent` or throws a `ParseError` for unknown types
- Keeps the WebSocket layer free of type-switching logic

### `eventHandler.ts`

Receives a typed `PixelEvent` and applies the corresponding store mutation:

| Event | Store update |
|-------|-------------|
| `agent_started` | Adds agent to `agents` store |
| `agent_thinking` | Updates agent status to `thinking` |
| `agent_tool_start` | Updates agent status to `using_tool`, appends to `logs` |
| `agent_tool_end` | Updates agent status to `thinking`, appends to `logs` |
| `agent_finished` | Updates agent status to `finished`, appends to `logs` |
| `agent_error` | Updates agent status to `error`, appends to `logs` |
| `agent_removed` | Removes agent from `agents` store |
| `snapshot` | Replaces full `agents` store state |
| `office_reset` | Clears `agents` and `logs` stores |

---

## Layer 2 — `lib/stores/`

All application state lives in Svelte writable stores. This is the **single source of truth** for both the PixiJS scene and the Svelte UI.

### `agents.ts`

A `writable<Map<string, AgentState>>` where `AgentState` is:

```ts
interface AgentState {
  agentId: string
  name: string
  status: 'idle' | 'thinking' | 'using_tool' | 'finished' | 'error'
}
```

### `logs.ts`

A bounded ring buffer of log entries, capped at **500 entries**. When the limit is reached, the oldest entry is removed before the new one is added. This prevents unbounded memory growth during long-running agent sessions.

```ts
interface LogEntry {
  agentId: string
  type: string
  message: string
  timestamp: number
}
```

### `office.ts`

Office-level state, currently holding:

```ts
interface OfficeState {
  resetAt: number | null   // timestamp of the last office_reset event
}
```

### `connection.ts`

```ts
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'
```

Updated by `socket.ts` as the WebSocket lifecycle progresses. Used by the UI to display a connection indicator.

---

## Layer 3 — `lib/pixi/`

The PixiJS scene subscribes to the Svelte stores and re-renders whenever agent state changes. It **never** receives WebSocket events directly.

Key behaviors:
- On `agents` store update: adds, moves, or removes desk sprites
- On agent `status` change: plays the corresponding pixel-art animation (idle sit, thinking bubble, tool sparkle, etc.)
- On `office_reset`: clears the scene and re-renders from the (now empty) stores

Because the PixiJS layer only reads from stores, it can be exercised in tests by simply writing to the stores — no WebSocket mock needed.

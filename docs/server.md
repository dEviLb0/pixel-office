# Server

The Pixel Office server is a **standalone Node.js WebSocket server** in `packages/server`. It has no HTTP routes and no business logic — its only job is to receive PixelEvents from adapters, maintain a live snapshot, and broadcast events to all connected browser clients.

## Responsibilities

### 1. Accept adapter connections

Any adapter (CrewAI, Claude Code, or a custom integration) connects to the server via a plain WebSocket and sends JSON-serialized PixelEvents. The server validates the `type` field and ignores malformed messages.

### 2. Maintain an in-memory snapshot

The server keeps an `AgentState` map in memory — the **canonical office state**. It is updated on every incoming event using the same logic as the client's `eventHandler`:

- `agent_started` → adds an entry
- `agent_thinking`, `agent_tool_start`, `agent_tool_end`, `agent_finished`, `agent_error` → updates the agent's `status`
- `agent_removed` → removes the entry
- `office_reset` → clears the entire map

This snapshot is ephemeral — it lives only while the server process is running.

### 3. Broadcast to all clients

After updating the snapshot, the server forwards the raw event to every connected browser client. If a client connection is closed, it is removed from the broadcast list.

### 4. Send snapshot on connect

When a new browser client connects, the server immediately sends it a `snapshot` event containing the full current state of the office. This ensures the client can render the complete scene without waiting for incremental updates.

```json
{
  "type": "snapshot",
  "agentId": "system",
  "agents": [ ... ],
  "timestamp": 1700000015000
}
```

## Configuration

| Environment variable | Default | Description |
|----------------------|---------|-------------|
| `PORT` | `3001` | Port the WebSocket server listens on |

## Running the server

```bash
cd packages/server
pnpm install
pnpm dev       # development with watch mode
pnpm start     # production
```

## Design notes

The server intentionally has no persistence layer. The in-memory snapshot is sufficient for the real-time visualization use case: if the server restarts, agents simply re-emit their `agent_started` events and the snapshot rebuilds naturally. Adding a persistence layer (Redis, SQLite) is a straightforward future extension — see [ADR 003](/decisions/003-websocket-architecture) for the rationale.

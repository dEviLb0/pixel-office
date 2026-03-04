# PixelEvent Protocol

All communication between adapters, the server, and the client is carried by **PixelEvents** — a small, typed JSON schema defined in `packages/protocol`.

## Schema overview

Every PixelEvent is a JSON object with at minimum:

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | The event discriminator (one of the 9 types below) |
| `agentId` | `string` | Unique identifier for the agent (or `"system"` for office-level events) |
| `timestamp` | `number` | Unix timestamp in milliseconds |

Additional fields are present depending on the `type`.

## Event catalogue

### 1. `agent_started`

An agent lifecycle begins. The server creates a new agent entry in the in-memory snapshot.

```json
{
  "type": "agent_started",
  "agentId": "researcher-1",
  "name": "Researcher",
  "timestamp": 1700000000000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Human-readable agent name displayed in the UI |

---

### 2. `agent_thinking`

The agent is actively processing — deciding what to do next.

```json
{
  "type": "agent_thinking",
  "agentId": "researcher-1",
  "thought": "I need to search for recent papers on LLM alignment.",
  "timestamp": 1700000001000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `thought` | `string` | Optional textual description of the current reasoning step |

---

### 3. `agent_tool_start`

The agent has invoked a tool and is waiting for the result.

```json
{
  "type": "agent_tool_start",
  "agentId": "researcher-1",
  "tool": "web_search",
  "input": "LLM alignment survey 2024",
  "timestamp": 1700000002000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `tool` | `string` | Name of the tool being called |
| `input` | `string` | Serialized input passed to the tool |

---

### 4. `agent_tool_end`

The tool call has completed and a result was returned.

```json
{
  "type": "agent_tool_end",
  "agentId": "researcher-1",
  "tool": "web_search",
  "output": "Found 12 relevant papers...",
  "timestamp": 1700000003000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `tool` | `string` | Name of the tool that completed |
| `output` | `string` | Serialized output returned by the tool |

---

### 5. `agent_finished`

The agent has completed its task successfully.

```json
{
  "type": "agent_finished",
  "agentId": "researcher-1",
  "result": "Research complete. Summary attached.",
  "timestamp": 1700000010000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `result` | `string` | Optional final result or summary |

---

### 6. `agent_error`

The agent encountered an unrecoverable error.

```json
{
  "type": "agent_error",
  "agentId": "researcher-1",
  "error": "RateLimitError: Too many requests",
  "timestamp": 1700000005000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `error` | `string` | Error message or stack trace |

---

### 7. `agent_removed`

An agent was removed from the office. **Not implemented in the MVP** — reserved for future use.

```json
{
  "type": "agent_removed",
  "agentId": "researcher-1",
  "timestamp": 1700000020000
}
```

---

### 8. `snapshot`

Sent by the server to a newly connected client. Contains the full current state of the office so the client can render immediately without waiting for incremental events.

```json
{
  "type": "snapshot",
  "agentId": "system",
  "agents": [
    { "agentId": "researcher-1", "name": "Researcher", "status": "thinking" }
  ],
  "timestamp": 1700000015000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `agents` | `AgentState[]` | Array of all current agent states |

---

### 9. `office_reset`

Clears the full office state on all connected clients and on the server snapshot.

```json
{
  "type": "office_reset",
  "agentId": "system",
  "timestamp": 1700000030000
}
```

## Extending the protocol

To add a new event type:
1. Add a new discriminated union member to `packages/protocol/src/index.ts`
2. Handle it in `packages/server/src/handler.ts`
3. Handle it in `packages/client/src/lib/ws/eventHandler.ts`
4. Update this page

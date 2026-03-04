# Adapters

An **adapter** is a small bridge between an AI agent framework and the Pixel Office server. Its only job is to:

1. Listen to the agent framework's native lifecycle events
2. Convert those events to PixelEvents (see the [Protocol page](/protocol))
3. Send each PixelEvent to the Pixel Office WebSocket server

## Design principles

**Zero modification to agent code.** Adapters integrate at the framework hook level or at the output file level. You never need to touch your prompts, chains, or crew definitions.

**Single source of truth.** The PixelEvent schema in `packages/protocol` is the contract. Every adapter must produce events that conform to this schema. The server and client trust that any event arriving over the WebSocket is valid.

**Language agnostic.** The protocol is plain JSON over WebSocket, so adapters can be written in any language. The current implementations are Python (CrewAI) and TypeScript (Claude Code).

## Available adapters

| Adapter | Framework | Language | Integration method |
|---------|-----------|----------|--------------------|
| [CrewAI](/adapters/crewai) | CrewAI | Python | `crewai_event_bus` native hook |
| [Claude Code](/adapters/claude-code) | Claude Code CLI | TypeScript | JSONL file watcher |

## Writing a custom adapter

To integrate a new framework:

1. Connect to the Pixel Office server via WebSocket (`ws://localhost:3001` by default)
2. On connection, optionally send `agent_started` for each active agent
3. Map your framework's events to the appropriate PixelEvent types
4. Send each event as a JSON string over the WebSocket
5. On shutdown, optionally send `agent_finished` or `agent_removed`

See the [Protocol page](/protocol) for the full list of event types and their fields.

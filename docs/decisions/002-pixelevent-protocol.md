# ADR 002: Typed PixelEvent Protocol

## Status

Accepted

## Context

Pixel Office has three distinct consumers of event data:

1. **Adapters** (Python and TypeScript) — produce events
2. **Server** (`packages/server`) — receives, stores, and broadcasts events
3. **Client** (`packages/client`) — receives and renders events

These consumers are written in different languages, live in separate packages, and may be developed by different contributors. Without a shared, explicit contract, each side risks drifting out of sync — the Python adapter sends a field the TypeScript client doesn't expect, or the server forwards an event the client can't handle.

Additionally, the protocol needs to be **extensible**: new agent frameworks will require new event types, and these must be addable without breaking existing consumers.

## Decision

Define a **shared typed event schema** in `packages/protocol` as a TypeScript discriminated union:

```ts
export type PixelEvent =
  | AgentStartedEvent
  | AgentThinkingEvent
  | AgentToolStartEvent
  | AgentToolEndEvent
  | AgentFinishedEvent
  | AgentErrorEvent
  | AgentRemovedEvent
  | SnapshotEvent
  | OfficeResetEvent
```

Each member is a plain TypeScript interface with a unique `type` literal field. The server and client import these types directly from `@pixel-office/protocol`. The Python adapter maintains a parallel docstring-documented schema that mirrors the TypeScript definition.

Event validation happens at parse time in `eventParser.ts` — if the `type` field does not match a known discriminator, the message is discarded and a warning is logged.

## Consequences

- `packages/protocol` is the **single source of truth** for all event types
- Adding a new event type requires a change only in `packages/protocol`, then in the server handler and client handler — no ad-hoc string matching anywhere
- The TypeScript compiler enforces exhaustive `switch` statements over `PixelEvent.type`, catching missing cases at build time
- The Python adapter must be kept in sync manually (no code generation in MVP); this is acceptable because the schema is small and stable
- Consumers can safely ignore unknown event types after the discriminated union exhaustiveness check

# Adapter: CrewAI

The CrewAI adapter (`adapters/crewai`) connects Pixel Office to a [CrewAI](https://github.com/joaomdmoura/crewAI) multi-agent crew using the framework's native `crewai_event_bus` hook. No modification to your crew, agents, or tasks is required.

## Installation

```bash
pip install pixel-office-crewai
```

Or, if you are working inside the monorepo:

```bash
cd adapters/crewai
pip install -e .
```

## Quick start

```python
from pixel_office_crewai import attach

# Call once before kicking off your crew.
# Connects to ws://localhost:3001 by default.
attach()

# Your existing crew code — unchanged.
my_crew.kickoff()
```

That's it. The adapter installs itself as a listener on `crewai_event_bus` and begins forwarding events immediately.

## Configuration

```python
attach(server_url="ws://my-server:3001")
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `server_url` | `ws://localhost:3001` | URL of the Pixel Office WebSocket server |

## Event mapping

| CrewAI event | PixelEvent |
|--------------|------------|
| `AgentStartedEvent` | `agent_started` |
| `AgentThinkingEvent` | `agent_thinking` |
| `ToolStartedEvent` | `agent_tool_start` |
| `ToolFinishedEvent` | `agent_tool_end` |
| `AgentFinishedEvent` | `agent_finished` |
| `AgentErrorEvent` | `agent_error` |

## How it works

The adapter calls `crewai_event_bus.on(event_type, handler)` for each supported event type during `attach()`. Each handler extracts the relevant fields from the CrewAI event object, constructs a PixelEvent dict, serializes it to JSON, and sends it over the WebSocket connection.

The WebSocket connection is maintained for the lifetime of the process. If the connection drops, the adapter attempts to reconnect using exponential backoff before the next event is sent.

## Requirements

- Python ≥ 3.10
- `crewai` ≥ 0.28.0 (the version that introduced `crewai_event_bus`)
- `websockets` ≥ 12.0

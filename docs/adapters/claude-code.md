# Adapter: Claude Code

The Claude Code adapter (`adapters/claude-code`) connects Pixel Office to [Claude Code](https://claude.ai/code) by watching the JSONL activity files that Claude Code writes automatically to `~/.claude/projects/`. **Zero modification to your Claude agent code is required.**

## Installation

```bash
cd adapters/claude-code
pnpm install
pnpm build
```

## Quick start

```bash
# Start the adapter — it will watch for Claude Code activity automatically.
pnpm start
```

Or, programmatically:

```ts
import { startAdapter } from '@pixel-office/claude-code-adapter'

startAdapter({ serverUrl: 'ws://localhost:3001' })
```

## How it works

Claude Code writes structured JSONL log entries to files under `~/.claude/projects/<project-id>/`. Each line is a JSON object representing an agent action (tool use, thinking, response, etc.).

The adapter uses a file system watcher (via `chokidar`) to detect new lines appended to these files, parses each entry, and maps it to the corresponding PixelEvent.

Because the adapter reads output files rather than hooking into the Claude process, **no code changes to your Claude configuration are needed**.

## Event mapping

| Claude Code JSONL entry type | PixelEvent |
|-----------------------------|------------|
| Session start | `agent_started` |
| `thinking` content block | `agent_thinking` |
| `tool_use` content block | `agent_tool_start` |
| `tool_result` content block | `agent_tool_end` |
| Final assistant message | `agent_finished` |
| Error entry | `agent_error` |

## Configuration

```ts
startAdapter({
  serverUrl: 'ws://localhost:3001',   // Pixel Office server URL
  watchDir: '~/.claude/projects',     // Directory to watch (default shown)
})
```

| Option | Default | Description |
|--------|---------|-------------|
| `serverUrl` | `ws://localhost:3001` | URL of the Pixel Office WebSocket server |
| `watchDir` | `~/.claude/projects` | Root directory containing Claude Code project JSONL files |

## Requirements

- Node.js ≥ 18
- `chokidar` ≥ 3.6
- `ws` ≥ 8.0

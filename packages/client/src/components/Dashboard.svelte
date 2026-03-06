<script lang="ts">
  import { agentList, agentCount } from '../stores/agents';
  import { recentLogs } from '../stores/logs';
  import { connection } from '../stores/connection';
  import type { AgentState } from '../stores/agents';

  const STATUS_LABELS: Record<AgentState['status'], string> = {
    idle: 'idle',
    thinking: 'thinking...',
    tool_running: '⚡ tool use',
    finished: '✓ done',
    error: '✗ error',
  };

  const LOG_COLORS: Record<string, string> = {
    agent_started: 'info',
    agent_thinking: 'tool',
    agent_tool_start: 'tool',
    agent_tool_end: 'tool',
    agent_finished: 'done',
    agent_error: 'error',
    agent_removed: 'info',
  };

  const AGENT_COLORS = [
  '#ff6644', '#4499ff', '#ffaa33', '#44dd88',
  '#cc55ff', '#ff4488', '#aabbcc', '#33ccbb',
  '#ff9933', '#66aaff',
];

function agentColor(agentId: string): string {
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) {
    hash = agentId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AGENT_COLORS[Math.abs(hash) % AGENT_COLORS.length];
}
</script>

<div class="sidebar">

  <!-- Header -->
  <div class="sidebar-header">
    <span class="title">⬡ Pixel Office</span>
    <div class="connection" class:connected={$connection === 'connected'} class:error={$connection === 'error'}>
      <span class="connection-dot" />
      {$connection}
    </div>
  </div>

  <!-- Stats -->
  <div class="stats-row">
    <div class="stat">
      <span class="stat-value">{$agentCount}</span>
      <span class="stat-label">agents</span>
    </div>
    <div class="stat">
      <span class="stat-value">{$agentList.filter(a => a.status === 'thinking' || a.status === 'tool_running').length}</span>
      <span class="stat-label">active</span>
    </div>
    <div class="stat">
      <span class="stat-value">{$agentList.filter(a => a.status === 'error').length}</span>
      <span class="stat-label">errors</span>
    </div>
  </div>

  <!-- Agent List -->
  <div class="section-title">⬡ Agents</div>
  <div class="agent-list">
    {#each $agentList as agent (agent.agent_id)}
  <div class="agent-card" class:thinking={agent.status === 'thinking'} class:tool={agent.status === 'tool_running'} class:error={agent.status === 'error'} class:finished={agent.status === 'finished'}>
    <div class="agent-name">
      <span class="agent-color-tag" style="background: {agentColor(agent.agent_id)}" ></span>
      {agent.name}
    </div>
    <div class="agent-status">
      <span class="status-dot status-{agent.status}" ></span>
      <span class="status-text status-text-{agent.status}">{STATUS_LABELS[agent.status]}</span>
    </div>
  </div>
    {/each}

    {#if $agentCount === 0}
      <div class="empty">No agents connected</div>
    {/if}
  </div>

  <!-- Log Panel -->
  <div class="section-title" style="margin-top: 12px">⬡ Activity Log</div>
  <div class="log-list">
    {#each $recentLogs.slice(0, 20) as entry (entry.id)}
      <div class="log-entry log-{LOG_COLORS[entry.event.type] ?? 'info'}">
        {entry.event.type}
        {#if 'name' in entry.event}· {entry.event.name}{/if}
      </div>
    {/each}

    {#if $recentLogs.length === 0}
      <div class="empty">No activity yet</div>
    {/if}
  </div>

</div>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #0d0d1a;
    border-right: 1px solid #1e1e30;
    font-family: monospace;
    font-size: 11px;
    color: #a0a8c0;
    overflow: hidden;
  }

  .sidebar-header {
    padding: 12px;
    background: #0a0a14;
    border-bottom: 1px solid #1e1e30;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .title {
    font-size: 13px;
    font-weight: bold;
    color: #6080ff;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .connection {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    color: #506080;
  }

  .connection-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #506080;
    flex-shrink: 0;
  }

  .connection.connected .connection-dot { background: #44dd88; }
  .connection.connected { color: #44dd88; }
  .connection.error .connection-dot { background: #ff4466; }
  .connection.error { color: #ff4466; }

  .stats-row {
    display: flex;
    border-bottom: 1px solid #1e1e30;
  }

  .stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;
    border-right: 1px solid #1e1e30;
  }

  .stat:last-child { border-right: none; }

  .stat-value {
    font-size: 16px;
    font-weight: bold;
    color: #6080ff;
  }

  .stat-label {
    font-size: 9px;
    color: #506080;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .section-title {
    font-size: 11px;
    color: #6080ff;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 8px 12px 6px;
    border-bottom: 1px solid #1e1e30;
  }

  .agent-list {
    overflow-y: auto;
    flex-shrink: 0;
    max-height: 260px;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .agent-card {
    background: #12121f;
    border: 1px solid #1e1e30;
    border-radius: 3px;
    padding: 7px 9px;
    transition: border-color 0.2s;
    cursor: default;
  }

  .agent-card.thinking { border-color: #ffaa00; }
  .agent-card.tool     { border-color: #00ccff; }
  .agent-card.error    { border-color: #ff4466; }
  .agent-card.finished { border-color: #44dd88; }

  .agent-name {
    color: #e0e4ff;
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .agent-status {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-dot.status-idle         { background: #44dd88; }
  .status-dot.status-thinking     { background: #ffaa00; animation: pulse 1s infinite; }
  .status-dot.status-tool_running { background: #00ccff; animation: pulse 0.5s infinite; }
  .status-dot.status-finished     { background: #44ff88; }
  .status-dot.status-error        { background: #ff4455; }

  .status-text { font-size: 10px; color: #7080a0; }
  .status-text.status-text-thinking     { color: #ffaa00; }
  .status-text.status-text-tool_running { color: #00ccff; }
  .status-text.status-text-finished     { color: #44dd88; }
  .status-text.status-text-error        { color: #ff4466; }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  .log-list {
    flex: 1;
    overflow-y: auto;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .log-entry {
    font-size: 10px;
    color: #506080;
    border-left: 2px solid #1e1e30;
    padding-left: 6px;
    line-height: 1.5;
  }

  .log-entry.log-info  { border-color: #6080ff; color: #8090c0; }
  .log-entry.log-tool  { border-color: #00ccff; color: #50aacc; }
  .log-entry.log-done  { border-color: #44dd88; color: #60cc88; }
  .log-entry.log-error { border-color: #ff4466; color: #cc5566; }

  .empty {
    color: #334455;
    font-size: 10px;
    padding: 6px 0;
    font-style: italic;
  }

  .agent-color-tag {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 5px;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
<script lang="ts">
  import { agentList, agentCount } from '../stores/agents';
  import { isConnected, connection } from '../stores/connection';
  import type { AgentState } from '../stores/agents';

  const STATUS_LABELS: Record<AgentState['status'], string> = {
    idle: 'Idle',
    thinking: 'Thinking',
    tool_running: 'Using tool',
    finished: 'Finished',
    error: 'Error',
  };

  const STATUS_COLORS: Record<AgentState['status'], string> = {
    idle: '#95a5a6',
    thinking: '#f39c12',
    tool_running: '#3498db',
    finished: '#2ecc71',
    error: '#e74c3c',
  };

  const CONNECTION_COLORS: Record<string, string> = {
    connecting: '#f39c12',
    connected: '#2ecc71',
    disconnected: '#e74c3c',
  };
</script>

<div class="dashboard">
  <div class="dashboard-header">
    <span class="dashboard-title">Pixel Office</span>
    <div class="connection-badge" style="color: {CONNECTION_COLORS[$connection] ?? '#ffffff'}">
      <span class="connection-dot" style="background: {CONNECTION_COLORS[$connection] ?? '#ffffff'}" />
      {$connection}
    </div>
  </div>

  <div class="stats-row">
    <div class="stat-card">
      <span class="stat-value">{$agentCount}</span>
      <span class="stat-label">Agents</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">
        {$agentList.filter((a) => a.status === 'thinking' || a.status === 'tool_running').length}
      </span>
      <span class="stat-label">Active</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">
        {$agentList.filter((a) => a.status === 'error').length}
      </span>
      <span class="stat-label">Errors</span>
    </div>
  </div>

  <div class="agent-list">
    <div class="agent-list-header">Agents</div>
    {#each $agentList as agent (agent.agent_id)}
      <div class="agent-row">
        <div class="agent-status-dot" style="background: {STATUS_COLORS[agent.status]}" />
        <span class="agent-name">{agent.name}</span>
        <span class="agent-status" style="color: {STATUS_COLORS[agent.status]}">
          {STATUS_LABELS[agent.status]}
        </span>
      </div>
    {/each}

    {#if $agentCount === 0}
      <div class="agent-empty">No agents connected</div>
    {/if}
  </div>
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #1a1a2e;
    border-right: 1px solid #2c3e50;
    font-family: monospace;
    font-size: 12px;
    color: #ecf0f1;
  }

  .dashboard-header {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px;
    background: #16213e;
    border-bottom: 1px solid #2c3e50;
  }

  .dashboard-title {
    font-size: 15px;
    font-weight: bold;
    color: #3498db;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .connection-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    text-transform: capitalize;
  }

  .connection-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    display: inline-block;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: #2c3e50;
    border-bottom: 1px solid #2c3e50;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 4px;
    background: #1a1a2e;
    gap: 2px;
  }

  .stat-value {
    font-size: 22px;
    font-weight: bold;
    color: #ecf0f1;
  }

  .stat-label {
    font-size: 10px;
    color: #7f8c8d;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .agent-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .agent-list-header {
    padding: 6px 12px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #7f8c8d;
    border-bottom: 1px solid #2c3e50;
    margin-bottom: 4px;
  }

  .agent-row {
    display: grid;
    grid-template-columns: 10px 1fr auto;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-bottom: 1px solid #0d0d1a;
  }

  .agent-row:hover {
    background: #16213e;
  }

  .agent-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .agent-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #ecf0f1;
  }

  .agent-status {
    font-size: 10px;
    white-space: nowrap;
  }

  .agent-empty {
    padding: 20px 12px;
    color: #7f8c8d;
    text-align: center;
  }

  .agent-list::-webkit-scrollbar {
    width: 4px;
  }

  .agent-list::-webkit-scrollbar-track {
    background: #1a1a2e;
  }

  .agent-list::-webkit-scrollbar-thumb {
    background: #2c3e50;
    border-radius: 2px;
  }
</style>
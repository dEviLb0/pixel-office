<script lang="ts">
  import { recentLogs } from '../stores/logs';
  import type { PixelEvent } from '@pixel-office/protocol';

  const EVENT_COLORS: Record<string, string> = {
    agent_started: '#2ecc71',
    agent_thinking: '#f39c12',
    agent_tool_start: '#3498db',
    agent_tool_end: '#3498db',
    agent_finished: '#2ecc71',
    agent_error: '#e74c3c',
    agent_removed: '#95a5a6',
  };

  function getColor(type: string): string {
    return EVENT_COLORS[type] ?? '#ffffff';
  }

  function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  function getAgentId(event: PixelEvent): string {
    return 'agent_id' in event ? event.agent_id : 'system';
  }

  function getMessage(event: PixelEvent): string | null {
    if ('message' in event && typeof event.message === 'string') return event.message;
    if ('tool' in event && typeof event.tool === 'string') return event.tool;
    if ('error' in event && typeof event.error === 'string') return event.error;
    return null;
  }
</script>

<div class="log-panel">
  <div class="log-header">
    <span class="log-title">Event Log</span>
    <span class="log-count">{$recentLogs.length} events</span>
  </div>

  <div class="log-list">
    {#each $recentLogs as entry (entry.id)}
      <div class="log-entry">
        <span class="log-time">{formatTime(entry.receivedAt)}</span>
        <span class="log-type" style="color: {getColor(entry.event.type)}">{entry.event.type}</span>
        <span class="log-agent">{getAgentId(entry.event)}</span>
        {#if getMessage(entry.event)}
          <span class="log-message">{getMessage(entry.event)}</span>
        {/if}
      </div>
    {/each}

    {#if $recentLogs.length === 0}
      <div class="log-empty">Waiting for events...</div>
    {/if}
  </div>
</div>

<style>
  .log-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #1a1a2e;
    border-left: 1px solid #2c3e50;
    font-family: monospace;
    font-size: 12px;
    color: #ecf0f1;
  }

  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: #16213e;
    border-bottom: 1px solid #2c3e50;
  }

  .log-title {
    font-weight: bold;
    font-size: 13px;
    color: #3498db;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .log-count {
    color: #7f8c8d;
    font-size: 11px;
  }

  .log-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
    display: flex;
    flex-direction: column-reverse;
  }

  .log-entry {
    display: grid;
    grid-template-columns: 70px 160px 1fr;
    gap: 8px;
    padding: 4px 12px;
    border-bottom: 1px solid #0d0d1a;
    align-items: start;
  }

  .log-entry:hover {
    background: #16213e;
  }

  .log-time {
    color: #7f8c8d;
    white-space: nowrap;
  }

  .log-type {
    font-weight: bold;
    white-space: nowrap;
  }

  .log-agent {
    color: #9b59b6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .log-message {
    color: #bdc3c7;
    grid-column: 2 / -1;
    padding-top: 2px;
    word-break: break-word;
  }

  .log-empty {
    padding: 20px 12px;
    color: #7f8c8d;
    text-align: center;
  }

  .log-list::-webkit-scrollbar {
    width: 4px;
  }

  .log-list::-webkit-scrollbar-track {
    background: #1a1a2e;
  }

  .log-list::-webkit-scrollbar-thumb {
    background: #2c3e50;
    border-radius: 2px;
  }
</style>
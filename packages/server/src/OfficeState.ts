import { AgentState, PixelEvent } from '@pixel-office/protocol';

export class OfficeState {
  private agents: Map<string, AgentState> = new Map();

  apply(event: PixelEvent): void {
    switch (event.type) {
      case 'agent_started':
        this.agents.set(event.agent_id, {
          agent_id: event.agent_id,
          name: event.name,
          status: 'idle',
        });
        break;

      case 'agent_thinking':
        this.updateStatus(event.agent_id, 'thinking');
        break;

      case 'agent_tool_start':
        this.updateStatus(event.agent_id, 'tool_running');
        break;

      case 'agent_tool_end':
        this.updateStatus(event.agent_id, 'thinking');
        break;

      case 'agent_finished':
        this.updateStatus(event.agent_id, 'finished');
        break;

      case 'agent_error':
        this.updateStatus(event.agent_id, 'error');
        break;

      case 'agent_removed':
        this.agents.delete(event.agent_id);
        break;

      case 'office_reset':
        this.agents.clear();
        break;

      case 'snapshot':
        // snapshot est émis par le serveur, pas consommé
        break;
    }
  }

  getSnapshot() {
    return {
      type: 'snapshot' as const,
      agents: Array.from(this.agents.values()),
      timestamp: new Date().toISOString(),
    };
  }

  private updateStatus(agent_id: string, status: AgentState['status']): void {
    const agent = this.agents.get(agent_id);
    if (agent) {
      agent.status = status;
    }
  }
}
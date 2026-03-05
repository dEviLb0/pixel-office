import { writable, derived } from 'svelte/store';
import type { AgentStartedEvent, AgentFinishedEvent, AgentErrorEvent, AgentRemovedEvent, SnapshotEvent } from '@pixel-office/protocol';

export interface AgentState {
  agent_id: string;
  name: string;
  status: 'idle' | 'thinking' | 'tool_running' | 'finished' | 'error';
  lastEvent?: string;
  updatedAt: string;
}

function createAgentsStore() {
  const { subscribe, set, update } = writable<Map<string, AgentState>>(new Map());

  return {
    subscribe,

    applySnapshot(snapshot: SnapshotEvent) {
      const map = new Map<string, AgentState>();
      for (const agent of snapshot.agents) {
        map.set(agent.agent_id, {
          agent_id: agent.agent_id,
          name: agent.name,
          status: agent.status,
          updatedAt: snapshot.timestamp,
        });
      }
      set(map);
    },

    agentStarted(event: AgentStartedEvent) {
      update((map) => {
        map.set(event.agent_id, {
          agent_id: event.agent_id,
          name: event.name,
          status: 'idle',
          updatedAt: event.timestamp,
        });
        return map;
      });
    },

    agentThinking(event: { agent_id: string; timestamp: string }) {
      update((map) => {
        const agent = map.get(event.agent_id);
        if (agent) {
          map.set(event.agent_id, { ...agent, status: 'thinking', updatedAt: event.timestamp });
        }
        return map;
      });
    },

    agentToolStart(event: { agent_id: string; timestamp: string }) {
      update((map) => {
        const agent = map.get(event.agent_id);
        if (agent) {
          map.set(event.agent_id, { ...agent, status: 'tool_running', updatedAt: event.timestamp });
        }
        return map;
      });
    },

    agentToolEnd(event: { agent_id: string; timestamp: string }) {
      update((map) => {
        const agent = map.get(event.agent_id);
        if (agent) {
          map.set(event.agent_id, { ...agent, status: 'thinking', updatedAt: event.timestamp });
        }
        return map;
      });
    },

    agentFinished(event: AgentFinishedEvent) {
      update((map) => {
        const agent = map.get(event.agent_id);
        if (agent) {
          map.set(event.agent_id, { ...agent, status: 'finished', updatedAt: event.timestamp });
        }
        return map;
      });
    },

    agentError(event: AgentErrorEvent) {
      update((map) => {
        const agent = map.get(event.agent_id);
        if (agent) {
          map.set(event.agent_id, { ...agent, status: 'error', updatedAt: event.timestamp });
        }
        return map;
      });
    },

    agentRemoved(event: AgentRemovedEvent) {
      update((map) => {
        map.delete(event.agent_id);
        return map;
      });
    },

    reset() {
      set(new Map());
    },
  };
}

export const agents = createAgentsStore();
export const agentList = derived(agents, ($agents) => Array.from($agents.values()));
export const agentCount = derived(agents, ($agents) => $agents.size);
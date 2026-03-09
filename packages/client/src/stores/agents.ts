import { writable, derived } from 'svelte/store';
import type {
  AgentStartedEvent,
  AgentFinishedEvent,
  AgentErrorEvent,
  AgentRemovedEvent,
  SnapshotEvent,
  AgentRole,
} from '@pixel-office/protocol';

export interface AgentState {
  agent_id: string;
  name: string;
  role: AgentRole;    // 'worker' | 'orchestrator'
  status: 'idle' | 'thinking' | 'tool_running' | 'finished' | 'error';
  roomId: string;     // pièce actuelle — 'open_space' ou 'manager_office' selon le rôle
  lastEvent?: string;
  updatedAt: string;
}

// Détermine la pièce de départ selon le rôle
function defaultRoom(role: AgentRole): string {
  return role === 'orchestrator' ? 'manager_office' : 'open_space';
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
          role: agent.role ?? 'worker',
          status: agent.status,
          roomId: defaultRoom(agent.role ?? 'worker'),
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
          role: event.role ?? 'worker',
          status: 'idle',
          roomId: defaultRoom(event.role ?? 'worker'),
          updatedAt: event.timestamp,
        });
        return map;
      });
    },

    agentThinking(event: { agent_id: string; timestamp: string }) {
      update((map) => {
        const agent = map.get(event.agent_id);
        if (agent) map.set(event.agent_id, { ...agent, status: 'thinking', updatedAt: event.timestamp });
        return map;
      });
    },

    agentToolStart(event: { agent_id: string; timestamp: string }) {
      update((map) => {
        const agent = map.get(event.agent_id);
        if (agent) map.set(event.agent_id, { ...agent, status: 'tool_running', updatedAt: event.timestamp });
        return map;
      });
    },

    agentToolEnd(event: { agent_id: string; timestamp: string }) {
      update((map) => {
        const agent = map.get(event.agent_id);
        if (agent) map.set(event.agent_id, { ...agent, status: 'thinking', updatedAt: event.timestamp });
        return map;
      });
    },

    agentFinished(event: AgentFinishedEvent) {
      update((map) => {
        const agent = map.get(event.agent_id);
        if (agent) map.set(event.agent_id, { ...agent, status: 'finished', updatedAt: event.timestamp });
        return map;
      });
    },

    agentError(event: AgentErrorEvent) {
      update((map) => {
        const agent = map.get(event.agent_id);
        if (agent) map.set(event.agent_id, { ...agent, status: 'error', updatedAt: event.timestamp });
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
export const workerList = derived(agents, ($agents) =>
  Array.from($agents.values()).filter((a) => a.role === 'worker')
);
export const orchestratorList = derived(agents, ($agents) =>
  Array.from($agents.values()).filter((a) => a.role === 'orchestrator')
);
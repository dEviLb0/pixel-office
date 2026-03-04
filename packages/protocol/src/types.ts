export type AgentStatus =
  | 'idle'
  | 'thinking'
  | 'tool_running'
  | 'finished'
  | 'error';

export interface BaseEvent {
  agent_id: string;
  timestamp: string; // ISO 8601
}

export interface AgentStartedEvent extends BaseEvent {
  type: 'agent_started';
  name: string;
}

export interface AgentThinkingEvent extends BaseEvent {
  type: 'agent_thinking';
  message?: string;
}

export interface AgentToolStartEvent extends BaseEvent {
  type: 'agent_tool_start';
  tool: string;
  input?: unknown;
}

export interface AgentToolEndEvent extends BaseEvent {
  type: 'agent_tool_end';
  tool: string;
  output?: unknown;
}

export interface AgentFinishedEvent extends BaseEvent {
  type: 'agent_finished';
  result?: unknown;
}

export interface AgentErrorEvent extends BaseEvent {
  type: 'agent_error';
  error: string;
}

export interface AgentRemovedEvent extends BaseEvent {
  type: 'agent_removed';
}

export interface AgentState {
  agent_id: string;
  name: string;
  status: AgentStatus;
}

export interface SnapshotEvent {
  type: 'snapshot';
  agents: AgentState[];
  timestamp: string;
}

export interface OfficeResetEvent {
  type: 'office_reset';
  timestamp: string;
}

export type PixelEvent =
  | AgentStartedEvent
  | AgentThinkingEvent
  | AgentToolStartEvent
  | AgentToolEndEvent
  | AgentFinishedEvent
  | AgentErrorEvent
  | AgentRemovedEvent
  | SnapshotEvent
  | OfficeResetEvent;
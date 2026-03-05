import type { PixelEvent } from '@pixel-office/protocol';
import { agents } from '../stores/agents';
import { logs } from '../stores/logs';
import { office } from '../stores/office';

export function handleEvent(raw: unknown): void {
  const event = raw as PixelEvent;

  switch (event.type) {
    case 'snapshot':
      agents.applySnapshot(event);
      break;

    case 'agent_started':
      agents.agentStarted(event);
      logs.push(event);
      break;

    case 'agent_thinking':
      agents.agentThinking(event);
      logs.push(event);
      break;

    case 'agent_tool_start':
      agents.agentToolStart(event);
      logs.push(event);
      break;

    case 'agent_tool_end':
      agents.agentToolEnd(event);
      logs.push(event);
      break;

    case 'agent_finished':
      agents.agentFinished(event);
      logs.push(event);
      break;

    case 'agent_error':
      agents.agentError(event);
      logs.push(event);
      break;

    case 'agent_removed':
      agents.agentRemoved(event);
      logs.push(event);
      break;

    case 'office_reset':
      agents.reset();
      logs.reset();
      office.reset();
      break;

    default:
      console.warn('[eventHandler] Unknown event type:', (event as any).type);
  }
}
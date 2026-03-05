import { writable, derived } from 'svelte/store';
import type { PixelEvent } from '@pixel-office/protocol';

export interface LogEntry {
  id: string;
  event: PixelEvent;
  receivedAt: string;
}

const MAX_LOGS = 500;
let logCounter = 0;

function createLogsStore() {
  const { subscribe, update, set } = writable<LogEntry[]>([]);

  return {
    subscribe,

    push(event: PixelEvent) {
      update((logs) => {
        const entry: LogEntry = {
          id: `log-${++logCounter}`,
          event,
          receivedAt: new Date().toISOString(),
        };
        const updated = [...logs, entry];
        return updated.length > MAX_LOGS ? updated.slice(updated.length - MAX_LOGS) : updated;
      });
    },

    reset() {
      set([]);
      logCounter = 0;
    },
  };
}

export const logs = createLogsStore();
export const recentLogs = derived(logs, ($logs) => [...$logs].reverse().slice(0, 50));
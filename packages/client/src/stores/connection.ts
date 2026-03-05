import { writable, derived } from 'svelte/store';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

function createConnectionStore() {
  const { subscribe, set } = writable<ConnectionStatus>('disconnected');

  return {
    subscribe,
    setConnecting() { set('connecting'); },
    setConnected() { set('connected'); },
    setDisconnected() { set('disconnected'); },
    setError() { set('error'); },
  };
}

export const connection = createConnectionStore();
export const isConnected = derived(connection, ($connection) => $connection === 'connected');
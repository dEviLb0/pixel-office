import { handleEvent } from './eventHandler';
import { connection } from '../stores/connection';

const SERVER_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001';

let socket: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 1000;
const MAX_DELAY = 30000;

function connect(): void {
  connection.setConnecting();
  socket = new WebSocket(SERVER_URL);

  socket.addEventListener('open', () => {
    connection.setConnected();
    reconnectDelay = 1000;
  });

  socket.addEventListener('message', (event) => {
    try {
      const parsed = JSON.parse(event.data);
      handleEvent(parsed);
    } catch {
      console.warn('[socket] Invalid JSON, ignoring');
    }
  });

  socket.addEventListener('close', () => {
    connection.setDisconnected();
    scheduleReconnect();
  });

  socket.addEventListener('error', () => {
    connection.setError();
    socket?.close();
  });
}

function scheduleReconnect(): void {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  reconnectTimeout = setTimeout(() => {
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_DELAY);
    connect();
  }, reconnectDelay);
}

export const ws = {
  connect,
  close() {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    socket?.close();
    socket = null;
  },
};
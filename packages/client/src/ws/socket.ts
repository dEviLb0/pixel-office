import { handleEvent } from './eventHandler';
import { connection } from '../stores/connection';

const SERVER_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:4242';

let socket: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 1000;
const MAX_DELAY = 30000;
let isClosingIntentionally = false;

function connect(): void {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  isClosingIntentionally = false;
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
    if (!isClosingIntentionally) {
      scheduleReconnect();
    }
  });

  socket.addEventListener('error', () => {
    connection.setError();
    // Ne pas appeler socket.close() ici : le navigateur déclenche 'close' automatiquement
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
  send(data: unknown) {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      console.warn('[socket] Cannot send, socket not open');
    }
  },
  close() {
    isClosingIntentionally = true;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    socket?.close();
    socket = null;
  },
};
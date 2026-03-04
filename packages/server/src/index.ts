import { WebSocketServer } from 'ws';
import { OfficeState } from './OfficeState';
import { handleConnection } from './handleConnection';

const PORT = Number(process.env.PORT) || 4242;

const wss = new WebSocketServer({ port: PORT });
const state = new OfficeState();

console.log(`[pixel-office] WebSocket server listening on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  handleConnection(ws, wss, state);
});
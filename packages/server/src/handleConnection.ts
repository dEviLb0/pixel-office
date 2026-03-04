import { WebSocket, WebSocketServer } from 'ws';
import { PixelEvent } from '@pixel-office/protocol';
import { OfficeState } from './OfficeState';

export function handleConnection(
  ws: WebSocket,
  wss: WebSocketServer,
  state: OfficeState
): void {
  console.log('[pixel-office] New client connected');

  // Envoie le snapshot initial au client qui vient de se connecter
  ws.send(JSON.stringify(state.getSnapshot()));

  ws.on('message', (raw) => {
    let event: PixelEvent;

    try {
      event = JSON.parse(raw.toString()) as PixelEvent;
    } catch {
      console.warn('[pixel-office] Invalid JSON received, ignoring');
      return;
    }

    // Met à jour l'état in-memory
    state.apply(event);

    // Broadcast à tous les clients connectés (y compris l'émetteur)
    const payload = JSON.stringify(event);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  });

  ws.on('close', () => {
    console.log('[pixel-office] Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('[pixel-office] WebSocket error:', err);
  });
}
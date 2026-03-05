import WebSocket from 'ws';
import { PixelEvent } from '@pixel-office/protocol';

type EventHandler = (event: PixelEvent) => void;
type SnapshotHandler = (snapshot: Extract<PixelEvent, { type: 'snapshot' }>) => void;

export class PixelOfficeClient {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, EventHandler[]> = new Map();
  private reconnectDelay: number;
  private shouldReconnect: boolean = true;

  constructor(url: string, options: { reconnectDelay?: number } = {}) {
    this.url = url;
    this.reconnectDelay = options.reconnectDelay ?? 3000;
  }

  connect(): void {
    this.shouldReconnect = true;
    this._connect();
  }

  private _connect(): void {
    this.ws = new WebSocket(this.url);

    this.ws.on('open', () => {
      console.log(`[pixel-office/client] Connected to ${this.url}`);
    });

    this.ws.on('message', (raw) => {
      try {
        const event = JSON.parse(raw.toString()) as PixelEvent;
        this._emit(event.type, event);
      } catch {
        console.warn('[pixel-office/client] Invalid JSON received, ignoring');
      }
    });

    this.ws.on('close', () => {
      console.log('[pixel-office/client] Disconnected');
      if (this.shouldReconnect) {
        console.log(`[pixel-office/client] Reconnecting in ${this.reconnectDelay}ms...`);
        setTimeout(() => this._connect(), this.reconnectDelay);
      }
    });

    this.ws.on('error', (err) => {
      console.error('[pixel-office/client] Error:', err);
    });
  }

  send(event: PixelEvent): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[pixel-office/client] Cannot send: not connected');
      return;
    }
    this.ws.send(JSON.stringify(event));
  }

  on(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  off(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      this.handlers.set(eventType, handlers.filter((h) => h !== handler));
    }
  }

  onSnapshot(handler: SnapshotHandler): void {
    this.on('snapshot', handler as EventHandler);
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.ws?.close();
  }

  private _emit(eventType: string, event: PixelEvent): void {
    const handlers = this.handlers.get(eventType) ?? [];
    for (const handler of handlers) {
      handler(event);
    }
  }
}
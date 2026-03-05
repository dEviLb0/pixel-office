import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { OfficeLayout } from '../stores/office';

const TILE_SIZE = 48;

export class SeatManager {
  private container: Container;
  private seats: Map<string, Graphics> = new Map();
  private seatOverrides: Map<string, string> = new Map(); // seat_id -> agent_id

  constructor(layer: Container) {
    this.container = new Container();
    layer.addChild(this.container);
  }

  buildFromLayout(layout: OfficeLayout): void {
    this.clear();
    for (const seat of layout.seats.values()) {
      this.addSeat(seat.seat_id, seat.x, seat.y);
    }
  }

  private addSeat(seatId: string, x: number, y: number): void {
    const graphic = new Graphics();
    graphic.roundRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4, 6).fill({ color: 0x2c3e50 });
    graphic.roundRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4, 6).stroke({ color: 0x3d5166, width: 1 });

    const label = new Text({
      text: seatId,
      style: new TextStyle({
        fontSize: 8,
        fill: 0x7f8c8d,
        fontFamily: 'monospace',
      }),
    });
    label.anchor.set(0.5, 0.5);
    label.position.set(TILE_SIZE / 2, TILE_SIZE / 2);

    const wrapper = new Container();
    wrapper.addChild(graphic);
    wrapper.addChild(label);
    wrapper.position.set(x * TILE_SIZE, y * TILE_SIZE);
    wrapper.eventMode = 'static';
    wrapper.cursor = 'pointer';

    this.seats.set(seatId, graphic);
    this.container.addChild(wrapper);
  }

  assignAgent(seatId: string, agentId: string): void {
    this.seatOverrides.set(seatId, agentId);
    this.updateSeatColor(seatId, true);
  }

  unassignAgent(seatId: string): void {
    this.seatOverrides.delete(seatId);
    this.updateSeatColor(seatId, false);
  }

  overrideSeat(seatId: string, agentId: string): void {
    const previous = this.getAgentOnSeat(seatId);
    if (previous) this.unassignAgent(seatId);
    this.assignAgent(seatId, agentId);
  }

  getAgentOnSeat(seatId: string): string | undefined {
    return this.seatOverrides.get(seatId);
  }

  getSeatForAgent(agentId: string): string | undefined {
    for (const [seatId, aId] of this.seatOverrides.entries()) {
      if (aId === agentId) return seatId;
    }
    return undefined;
  }

  private updateSeatColor(seatId: string, occupied: boolean): void {
    const graphic = this.seats.get(seatId);
    if (!graphic) return;
    graphic.clear();
    const color = occupied ? 0x1a6b3a : 0x2c3e50;
    const border = occupied ? 0x2ecc71 : 0x3d5166;
    graphic.roundRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4, 6).fill({ color });
    graphic.roundRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4, 6).stroke({ color: border, width: 1 });
  }

  clear(): void {
    this.seats.clear();
    this.seatOverrides.clear();
    this.container.removeChildren();
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
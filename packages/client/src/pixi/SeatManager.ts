import { Container, Graphics } from 'pixi.js';
import { get } from 'svelte/store';
import { office, seatList } from '../stores/office';
import type { Seat, SeatState } from '../stores/office';

const TILE_SIZE = 48;

// Couleur du siège selon son état
const SEAT_COLORS: Record<SeatState, number> = {
  free: 0x2ecc71,
  reserved: 0xf39c12,
  occupied: 0xe74c3c,
};

export class SeatManager {
  private layer: Container;
  private seatGraphics: Map<string, Graphics> = new Map();
  private unsubscribe: (() => void) | null = null;

  constructor(layer: Container) {
    this.layer = layer;
  }

  init(): void {
    this.unsubscribe = seatList.subscribe((seats) => {
      this.syncSeats(seats);
    });
  }

  // Crée ou met à jour les graphiques pour chaque siège
  private syncSeats(seats: Seat[]): void {
    const activeIds = new Set(seats.map((s) => s.seat_id));

    for (const seat of seats) {
      if (!this.seatGraphics.has(seat.seat_id)) {
        this.createSeatGraphic(seat);
      } else {
        this.updateSeatGraphic(seat);
      }
    }

    // Retire les sièges supprimés
    for (const [id, graphic] of this.seatGraphics) {
      if (!activeIds.has(id)) {
        this.layer.removeChild(graphic);
        graphic.destroy();
        this.seatGraphics.delete(id);
      }
    }
  }

  private createSeatGraphic(seat: Seat): void {
    const g = new Graphics();
    this.drawSeat(g, seat);
    this.layer.addChild(g);
    this.seatGraphics.set(seat.seat_id, g);
  }

  // Met à jour la couleur du siège selon son SeatState
  private updateSeatGraphic(seat: Seat): void {
    const g = this.seatGraphics.get(seat.seat_id)!;
    g.clear();
    this.drawSeat(g, seat);
  }

  private drawSeat(g: Graphics, seat: Seat): void {
    const x = seat.x * TILE_SIZE;
    const y = seat.y * TILE_SIZE;
    const color = SEAT_COLORS[seat.state];
    g.roundRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8, 6).fill({ color });
  }

  destroy(): void {
    this.unsubscribe?.();
    for (const graphic of this.seatGraphics.values()) {
      graphic.destroy();
    }
    this.seatGraphics.clear();
  }
}
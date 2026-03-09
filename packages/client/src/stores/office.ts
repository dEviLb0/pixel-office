import { writable, derived } from 'svelte/store';

export type SeatState = 'free' | 'reserved' | 'occupied';
export type FacingDirection = 'up' | 'down' | 'left' | 'right';

export interface Seat {
  seat_id: string;
  x: number;
  y: number;
  state: SeatState;
  facingDirection: FacingDirection;
  assignedAgentId?: string;
}

export interface OfficeLayout {
  width: number;
  height: number;
  seats: Map<string, Seat>;
}

const DEFAULT_LAYOUT: OfficeLayout = {
  width: 20,
  height: 15,
  seats: new Map(),
};

function createOfficeStore() {
  const { subscribe, update, set } = writable<OfficeLayout>({ ...DEFAULT_LAYOUT, seats: new Map() });

  return {
    subscribe,

    addSeat(seat: Seat) {
      update((office) => {
        office.seats.set(seat.seat_id, seat);
        return office;
      });
    },

    // Marque le siège comme réservé (agent en chemin)
    reserveSeat(seat_id: string, agent_id: string) {
      update((office) => {
        const seat = office.seats.get(seat_id);
        if (seat) office.seats.set(seat_id, { ...seat, state: 'reserved', assignedAgentId: agent_id });
        return office;
      });
    },

    // Marque le siège comme occupé (agent arrivé)
    assignSeat(seat_id: string, agent_id: string) {
      update((office) => {
        const seat = office.seats.get(seat_id);
        if (seat) office.seats.set(seat_id, { ...seat, state: 'occupied', assignedAgentId: agent_id });
        return office;
      });
    },

    // Libère le siège de l'agent
    releaseSeat(agent_id: string) {
      update((office) => {
        for (const [id, seat] of office.seats) {
          if (seat.assignedAgentId === agent_id) {
            office.seats.set(id, { ...seat, state: 'free', assignedAgentId: undefined });
          }
        }
        return office;
      });
    },

    reset() {
      set({ ...DEFAULT_LAYOUT, seats: new Map() });
    },
  };
}

export const office = createOfficeStore();
export const seatList = derived(office, ($office) => Array.from($office.seats.values()));
export const freeSeats = derived(office, ($office) =>
  Array.from($office.seats.values()).filter((s) => s.state === 'free')
);
export const occupiedSeats = derived(office, ($office) =>
  Array.from($office.seats.values()).filter((s) => s.state === 'occupied')
);
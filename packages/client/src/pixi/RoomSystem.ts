import type { WorldMap } from './WorldMap';

export type RoomType =
  | 'open_space'
  | 'manager_office'
  | 'meeting_room'
  | 'server_room'
  | 'kitchen'
  | 'rest_room'
  | 'corridor';

export type RoomBehavior = 'scalable' | 'instanciable' | 'fixed' | 'unique';

export interface Room {
  id: string;
  type: RoomType;
  behavior: RoomBehavior;
  bounds: { x: number; y: number; width: number; height: number };
  capacity: number;
}

// Définition statique des 7 pièces sur une grille 40x30
// Rangée haute : manager_office | meeting_room | open_space
// Couloir horizontal
// Rangée basse : server_room | kitchen | rest_room
const ROOM_DEFINITIONS: Room[] = [
  {
    id: 'manager_office',
    type: 'manager_office',
    behavior: 'unique',
    bounds: { x: 1, y: 1, width: 8, height: 10 },
    capacity: 1,
  },
  {
    id: 'meeting_room',
    type: 'meeting_room',
    behavior: 'instanciable',
    bounds: { x: 11, y: 1, width: 10, height: 10 },
    capacity: 6,
  },
  {
    id: 'open_space',
    type: 'open_space',
    behavior: 'scalable',
    bounds: { x: 23, y: 1, width: 16, height: 10 },
    capacity: 20,
  },
  {
    id: 'corridor',
    type: 'corridor',
    behavior: 'scalable',
    bounds: { x: 1, y: 13, width: 38, height: 3 },
    capacity: 99,
  },
  {
    id: 'server_room',
    type: 'server_room',
    behavior: 'instanciable',
    bounds: { x: 1, y: 18, width: 8, height: 10 },
    capacity: 4,
  },
  {
    id: 'kitchen',
    type: 'kitchen',
    behavior: 'fixed',
    bounds: { x: 11, y: 18, width: 10, height: 10 },
    capacity: 3,
  },
  {
    id: 'rest_room',
    type: 'rest_room',
    behavior: 'fixed',
    bounds: { x: 23, y: 18, width: 16, height: 10 },
    capacity: 4,
  },
];

export class RoomSystem {
  private rooms: Map<string, Room> = new Map();
  private worldMap: WorldMap;

  constructor(worldMap: WorldMap) {
    this.worldMap = worldMap;
    this.init();
  }

  // Inscrit toutes les pièces dans la WorldMap
  private init(): void {
    for (const room of ROOM_DEFINITIONS) {
      this.rooms.set(room.id, room);
      this.worldMap.setRoom(room.id, room.bounds.x, room.bounds.y, room.bounds.width, room.bounds.height);
    }
  }

  // Retourne une pièce par son id
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  // Retourne toutes les pièces
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  // Retourne l'id de la pièce à laquelle appartient une position
  getRoomAtPosition(x: number, y: number): string | null {
    const cell = this.worldMap.getCell(x, y);
    return cell?.roomId ?? null;
  }

  // Retourne les cellules franchissables et libres d'une pièce
  // Utilisé par CharacterManager pour trouver où spawner un agent
  getFreeWalkableCells(roomId: string): { x: number; y: number }[] {
    return this.worldMap
      .getCellsInRoom(roomId)
      .filter((cell) => this.worldMap.isWalkable(cell.x, cell.y))
      .map((cell) => ({ x: cell.x, y: cell.y }));
  }
}
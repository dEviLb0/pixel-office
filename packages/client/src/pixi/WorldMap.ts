export type CellType = 'floor' | 'wall' | 'door';

export interface Cell {
  x: number;
  y: number;
  type: CellType;
  roomId: string | null;       // à quelle pièce appartient cette cellule
  staticOccupant: string | null;  // id du meuble qui bloque (ou null)
  dynamicOccupant: string | null; // id de l'agent présent (ou null)
  walkable: boolean;           // calculé : floor && pas de meuble bloquant
}

export class WorldMap {
  readonly width: number;
  readonly height: number;
  private grid: Cell[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    // Initialise toutes les cellules comme du sol libre, sans pièce assignée
    this.grid = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => ({
        x,
        y,
        type: 'floor' as CellType,
        roomId: null,
        staticOccupant: null,
        dynamicOccupant: null,
        walkable: true,
      }))
    );
  }

  // Retourne une cellule à une position donnée, ou null si hors limites
  getCell(x: number, y: number): Cell | null {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
    return this.grid[y][x];
  }

  // Assigne une pièce à une zone rectangulaire de cellules
  setRoom(roomId: string, x: number, y: number, width: number, height: number): void {
    for (let row = y; row < y + height; row++) {
      for (let col = x; col < x + width; col++) {
        const cell = this.getCell(col, row);
        if (cell) cell.roomId = roomId;
      }
    }
  }

  // Place un mur sur une cellule — la rend non franchissable
  setWall(x: number, y: number): void {
    const cell = this.getCell(x, y);
    if (cell) {
      cell.type = 'wall';
      cell.walkable = false;
    }
  }

  // Place une porte sur une cellule — reste franchissable
  setDoor(x: number, y: number): void {
    const cell = this.getCell(x, y);
    if (cell) {
      cell.type = 'door';
      cell.walkable = true;
    }
  }

  // Pose un meuble bloquant sur une cellule (couche statique)
  setStaticOccupant(x: number, y: number, furnitureId: string, blocking: boolean): void {
    const cell = this.getCell(x, y);
    if (cell) {
      cell.staticOccupant = furnitureId;
      if (blocking) cell.walkable = false;
    }
  }

  // Met à jour la position d'un agent sur la grille (couche dynamique)
  // Efface l'ancienne position et marque la nouvelle
  moveAgent(agentId: string, from: { x: number; y: number } | null, to: { x: number; y: number }): void {
    if (from) {
      const prev = this.getCell(from.x, from.y);
      if (prev && prev.dynamicOccupant === agentId) prev.dynamicOccupant = null;
    }
    const next = this.getCell(to.x, to.y);
    if (next) next.dynamicOccupant = agentId;
  }

  // Retire un agent de la grille (despawn)
  removeAgent(agentId: string): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        if (cell.dynamicOccupant === agentId) {
          cell.dynamicOccupant = null;
          return;
        }
      }
    }
  }

  // Retourne true si une cellule est franchissable ET non occupée par un agent
  isWalkable(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    if (!cell) return false;
    return cell.walkable && cell.dynamicOccupant === null;
  }

  // Retourne toutes les cellules d'une pièce donnée
  getCellsInRoom(roomId: string): Cell[] {
    const result: Cell[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x].roomId === roomId) result.push(this.grid[y][x]);
      }
    }
    return result;
  }
}
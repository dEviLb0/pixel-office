import type { Container } from 'pixi.js';
import { get } from 'svelte/store';
import { Character } from './Character';
import { SeatManager } from './SeatManager';
import { agents } from '../stores/agents';
import { office } from '../stores/office';
import type { AgentState } from '../stores/agents';

export class CharacterManager {
  private characters: Map<string, Character> = new Map();
  private seatManager: SeatManager;
  private layer: Container;
  private grid: boolean[][] = [];

  constructor(furnitureLayer: Container, charactersLayer: Container) {
    this.layer = charactersLayer;
    this.seatManager = new SeatManager(furnitureLayer);
  }

  init(): void {
    const layout = get(office);

    if (layout) {
      const seatList = Array.from(layout.seats.values());
      this.buildGrid(layout.width, layout.height, seatList);
      this.seatManager.buildFromLayout(layout);

      // Spawn les agents déjà assignés à un siège
      const currentAgents = get(agents);
      for (const seat of seatList) {
        if (seat.assignedAgentId) {
          const agent = currentAgents.get(seat.assignedAgentId);
          if (agent) this.spawnCharacter(agent, { x: seat.x, y: seat.y });
        }
      }
    }

    // Spawn les agents sans siège
    const currentAgents = get(agents);
    for (const agent of currentAgents.values()) {
      if (!this.characters.has(agent.agent_id)) {
        this.spawnCharacter(agent);
      }
    }
  }

  private buildGrid(width: number, height: number, seats: { x: number; y: number }[]): void {
    this.grid = Array.from({ length: height }, () => Array(width).fill(false));
    for (const seat of seats) {
      if (seat.y < height && seat.x < width) {
        this.grid[seat.y][seat.x] = true;
      }
    }
  }

  private spawnCharacter(agent: AgentState, pos?: { x: number; y: number }): void {
    if (this.characters.has(agent.agent_id)) return;

    const spawnPos = pos ?? this.findFreeSpawnPosition();
    const character = new Character(agent.agent_id, agent.name, spawnPos);
    character.syncFromStore(agent);
    this.layer.addChild(character.container);
    this.characters.set(agent.agent_id, character);
  }

  private findFreeSpawnPosition(): { x: number; y: number } {
    const layout = get(office);
    if (!layout) return { x: 0, y: 0 };

    for (let y = 0; y < layout.height; y++) {
      for (let x = 0; x < layout.width; x++) {
        if (!this.grid[y][x]) {
          this.grid[y][x] = true;
          return { x, y };
        }
      }
    }
    return { x: 0, y: 0 };
  }

  update(): void {
    const currentAgents = get(agents);

    // Spawn nouveaux agents
    for (const agent of currentAgents.values()) {
      if (!this.characters.has(agent.agent_id)) {
        this.spawnCharacter(agent);
      }
    }

    // Supprimer agents disparus
    for (const [id, character] of this.characters.entries()) {
      if (!currentAgents.has(id)) {
        character.destroy();
        this.characters.delete(id);
      }
    }

    // Sync état + update mouvement
    for (const [id, character] of this.characters.entries()) {
      const agent = currentAgents.get(id);
      if (agent) character.syncFromStore(agent);
      character.update();
    }
  }

  moveAgentTo(agentId: string, target: { x: number; y: number }): void {
    const character = this.characters.get(agentId);
    if (character) {
      character.moveTo(target, this.grid);
    }
  }

  destroy(): void {
    for (const character of this.characters.values()) {
      character.destroy();
    }
    this.characters.clear();
    this.seatManager.destroy();
  }
}
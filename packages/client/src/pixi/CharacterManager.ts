import { Container } from 'pixi.js';
import { get } from 'svelte/store';
import { agents, agentList } from '../stores/agents';
import type { AgentState } from '../stores/agents';
import { Character } from './Character';
import type { WorldMap } from './WorldMap';
import type { RoomSystem } from './RoomSystem';

export class CharacterManager {
  private furnitureLayer: Container;
  private characterLayer: Container;
  private worldMap: WorldMap;
  private roomSystem: RoomSystem;
  private characters: Map<string, Character> = new Map();
  private unsubscribe: (() => void) | null = null;

  constructor(
    furnitureLayer: Container,
    characterLayer: Container,
    worldMap: WorldMap,       // reçu depuis OfficeRenderer
    roomSystem: RoomSystem,   // reçu depuis OfficeRenderer
  ) {
    this.furnitureLayer = furnitureLayer;
    this.characterLayer = characterLayer;
    this.worldMap = worldMap;
    this.roomSystem = roomSystem;
  }

  init(): void {
    // Souscrit aux changements du store agents
    this.unsubscribe = agentList.subscribe((list) => {
      this.syncAgents(list);
    });
  }

  // Synchronise les personnages avec l'état du store
  private syncAgents(list: AgentState[]): void {
    const activeIds = new Set(list.map((a) => a.agent_id));

    // Spawn les nouveaux agents
    for (const agent of list) {
      if (!this.characters.has(agent.agent_id)) {
        this.spawnCharacter(agent);
      } else {
        // Met à jour le statut visuel des agents existants
        this.characters.get(agent.agent_id)!.syncFromStore(agent);
      }
    }

    // Retire les agents qui ne sont plus dans le store
    for (const [id, character] of this.characters) {
      if (!activeIds.has(id)) {
        this.worldMap.removeAgent(id);
        this.characterLayer.removeChild(character.container);
        character.destroy();
        this.characters.delete(id);
      }
    }
  }

  // Spawne un agent dans la pièce correspondant à son rôle
  private spawnCharacter(agent: AgentState): void {
    const roomId = agent.roomId; // 'open_space' ou 'manager_office'
    const freeCells = this.roomSystem.getFreeWalkableCells(roomId);

    if (freeCells.length === 0) {
      console.warn(`No free cells in room ${roomId} for agent ${agent.agent_id}`);
      return;
    }

    // Choisit une cellule libre aléatoire dans la pièce
    const pos = freeCells[Math.floor(Math.random() * freeCells.length)];

    const character = new Character(agent.agent_id, agent.name, agent.role, pos);
    character.syncFromStore(agent);

    // Marque la cellule comme occupée dans la WorldMap
    this.worldMap.moveAgent(agent.agent_id, null, pos);

    this.characters.set(agent.agent_id, character);
    this.characterLayer.addChild(character.container);
  }

  update(): void {
    for (const character of this.characters.values()) {
      const prevPos = { ...character.gridPos };
      character.update();

      // Si le personnage a bougé, met à jour la WorldMap
      if (
        character.gridPos.x !== prevPos.x ||
        character.gridPos.y !== prevPos.y
      ) {
        this.worldMap.moveAgent(character.id, prevPos, character.gridPos);
      }
    }
  }

  destroy(): void {
    this.unsubscribe?.();
    for (const character of this.characters.values()) {
      character.destroy();
    }
    this.characters.clear();
  }
}
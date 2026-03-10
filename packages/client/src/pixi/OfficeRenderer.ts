import type { PixiApp } from './PixiApp';
import { WorldMap } from './WorldMap';
import { RoomSystem } from './RoomSystem';
import { CharacterManager } from './CharacterManager';

// Dimensions de la grille — cohérentes avec RoomSystem
const GRID_WIDTH = 40;
const GRID_HEIGHT = 30;

export class OfficeRenderer {
  private worldMap: WorldMap;
  private roomSystem: RoomSystem;
  private characterManager: CharacterManager;

  constructor(pixiApp: PixiApp) {
    // 1. Crée la grille
    this.worldMap = new WorldMap(GRID_WIDTH, GRID_HEIGHT);

    // 2. Définit les pièces et les inscrit dans la WorldMap
    this.roomSystem = new RoomSystem(this.worldMap);

    // 3. Crée le CharacterManager avec accès aux layers, à la WorldMap et au RoomSystem
    this.characterManager = new CharacterManager(
      pixiApp.layers.furniture,
      pixiApp.layers.characters,
      this.worldMap,
      this.roomSystem,
    );
  }

  // Appelé une seule fois après le constructeur — lit l'état courant des stores
  init(): void {
    this.characterManager.init();
  }

  // Appelé à chaque tick du PixiApp ticker
  update(): void {
    this.characterManager.update();
  }

  // Nettoyage complet à la destruction du composant Svelte
  destroy(): void {
    this.characterManager.destroy();
  }
}
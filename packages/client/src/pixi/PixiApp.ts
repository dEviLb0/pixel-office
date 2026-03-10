import { Application, Container } from 'pixi.js';

export interface PixiLayers {
  floor: Container;
  furniture: Container;
  characters: Container;
  ui: Container;
}

// Dimensions de la grille — doivent correspondre à celles de OfficeRenderer
const GRID_WIDTH_PX = 40 * 48;  // 1920px
const GRID_HEIGHT_PX = 30 * 48; // 1440px

export class PixiApp {
  private app: Application;
  public layers!: PixiLayers;

  constructor() {
    this.app = new Application();
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    await this.app.init({
      canvas,
      resizeTo: canvas.parentElement ?? canvas,
      backgroundColor: 0x1a1a2e,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.setupLayers();
    this.setupViewport();
  }

  private setupLayers(): void {
    this.layers = {
      floor: new Container(),
      furniture: new Container(),
      characters: new Container(),
      ui: new Container(),
    };

    this.app.stage.addChild(this.layers.floor);
    this.app.stage.addChild(this.layers.furniture);
    this.app.stage.addChild(this.layers.characters);
    this.app.stage.addChild(this.layers.ui);
  }

  private setupViewport(): void {
    const stage = this.app.stage;

    // Calcule le scale initial pour que la grille rentre dans l'écran
    const scaleX = this.app.screen.width / GRID_WIDTH_PX;
    const scaleY = this.app.screen.height / GRID_HEIGHT_PX;
    const initialScale = Math.min(scaleX, scaleY) * 0.95; // 5% de marge
    stage.scale.set(initialScale);

    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let stageStart = { x: 0, y: 0 };

    // Zoom
    this.app.canvas.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      const scaleAmount = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(stage.scale.x * scaleAmount, 0.1), 4);
      stage.scale.set(newScale);
    });

    // Pan
    this.app.canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      isDragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
      stageStart = { x: stage.x, y: stage.y };
    });

    this.app.canvas.addEventListener('pointermove', (e: PointerEvent) => {
      if (!isDragging) return;
      stage.x = stageStart.x + (e.clientX - dragStart.x);
      stage.y = stageStart.y + (e.clientY - dragStart.y);
    });

    this.app.canvas.addEventListener('pointerup', () => {
      isDragging = false;
    });

    this.app.canvas.addEventListener('pointerleave', () => {
      isDragging = false;
    });
  }

  resize(): void {
    this.app.resize();
  }

  destroy(): void {
    this.app.destroy();
  }

  get renderer() {
    return this.app.renderer;
  }

  get stage() {
    return this.app.stage;
  }

  get ticker() {
    return this.app.ticker;
  }
}
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { AgentState } from '../stores/agents';

export type CharacterState = 'idle' | 'working' | 'moving' | 'thinking' | 'error';

export interface Position {
  x: number;
  y: number;
}

const STATE_COLORS: Record<CharacterState, number> = {
  idle: 0x95a5a6,
  working: 0x2ecc71,
  moving: 0x3498db,
  thinking: 0xf39c12,
  error: 0xe74c3c,
};

const TILE_SIZE = 48;

export class Character {
  public container: Container;
  private body: Graphics;
  private statusIndicator: Graphics;
  private nameLabel: Text;

  public id: string;
  public state: CharacterState = 'idle';
  public gridPos: Position = { x: 0, y: 0 };
  private targetPos: Position | null = null;
  private path: Position[] = [];
  private moveSpeed = 3;

  constructor(id: string, name: string, gridPos: Position) {
    this.id = id;
    this.gridPos = { ...gridPos };
    this.container = new Container();
    this.body = new Graphics();
    this.statusIndicator = new Graphics();
    this.nameLabel = new Text({
      text: name,
      style: new TextStyle({
        fontSize: 10,
        fill: 0xffffff,
        fontFamily: 'monospace',
      }),
    });

    this.buildSprite();
    this.setWorldPosition(gridPos);
  }

  private buildSprite(): void {
    this.body.circle(0, 0, 14).fill({ color: 0x4a90d9 });
    this.statusIndicator.circle(10, -10, 5).fill({ color: STATE_COLORS[this.state] });

    this.nameLabel.anchor.set(0.5, 0);
    this.nameLabel.position.set(0, 18);

    this.container.addChild(this.body);
    this.container.addChild(this.statusIndicator);
    this.container.addChild(this.nameLabel);
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
  }

  setState(newState: CharacterState): void {
    this.state = newState;
    this.statusIndicator.clear();
    this.statusIndicator.circle(10, -10, 5).fill({ color: STATE_COLORS[newState] });
  }

  setWorldPosition(gridPos: Position): void {
    this.gridPos = { ...gridPos };
    this.container.x = gridPos.x * TILE_SIZE + TILE_SIZE / 2;
    this.container.y = gridPos.y * TILE_SIZE + TILE_SIZE / 2;
  }

  moveTo(target: Position, grid: boolean[][]): void {
    this.path = this.bfsPath(this.gridPos, target, grid);
    if (this.path.length > 0) {
      this.targetPos = this.path.shift()!;
      this.setState('moving');
    }
  }

  private bfsPath(start: Position, end: Position, grid: boolean[][]): Position[] {
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const prev = Array.from({ length: rows }, () => Array<Position | null>(cols).fill(null));

    const queue: Position[] = [start];
    visited[start.y][start.x] = true;

    const directions = [
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: -1, y: 0 }, { x: 1, y: 0 },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(prev, start, end);
      }
      for (const dir of directions) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && !visited[ny][nx] && !grid[ny][nx]) {
          visited[ny][nx] = true;
          prev[ny][nx] = current;
          queue.push({ x: nx, y: ny });
        }
      }
    }
    return [];
  }

  private reconstructPath(
    prev: (Position | null)[][],
    start: Position,
    end: Position,
  ): Position[] {
    const path: Position[] = [];
    let current: Position | null = end;
    while (current && !(current.x === start.x && current.y === start.y)) {
      path.unshift(current);
      current = prev[current.y][current.x];
    }
    return path;
  }

  update(): void {
    if (!this.targetPos) return;

    const targetX = this.targetPos.x * TILE_SIZE + TILE_SIZE / 2;
    const targetY = this.targetPos.y * TILE_SIZE + TILE_SIZE / 2;

    const dx = targetX - this.container.x;
    const dy = targetY - this.container.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.moveSpeed) {
      this.container.x = targetX;
      this.container.y = targetY;
      this.gridPos = { ...this.targetPos };

      if (this.path.length > 0) {
        this.targetPos = this.path.shift()!;
      } else {
        this.targetPos = null;
        this.setState('idle');
      }
    } else {
      this.container.x += (dx / dist) * this.moveSpeed;
      this.container.y += (dy / dist) * this.moveSpeed;
    }
  }

  syncFromStore(agent: AgentState): void {
    const stateMap: Record<AgentState['status'], CharacterState> = {
      idle: 'idle',
      thinking: 'thinking',
      tool_running: 'working',
      finished: 'idle',
      error: 'error',
    };
    const newState = stateMap[agent.status] ?? 'idle';
    if (newState !== this.state) {
      this.setState(newState);
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
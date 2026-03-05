export { PixelOfficeClient } from './PixelOfficeClient';

// Stores
export { agents, agentList, agentCount } from './stores/agents';
export type { AgentState } from './stores/agents';

export { logs, recentLogs } from './stores/logs';
export type { LogEntry } from './stores/logs';

export { connection, isConnected } from './stores/connection';
export type { ConnectionStatus } from './stores/connection';

export { office, seatList, occupiedSeats } from './stores/office';
export type { Seat, OfficeLayout } from './stores/office';

// Pixi
export { PixiApp } from './pixi/PixiApp';
export type { PixiLayers } from './pixi/PixiApp';
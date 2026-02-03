// Enums
export enum TileType {
  GRASS = 'GRASS',
  DIRT = 'DIRT',
  TILLED = 'TILLED',
  WATER = 'WATER',
  STONE = 'STONE',
  TREE = 'TREE',
  BUILDING = 'BUILDING',
}

export enum CropType {
  PARSNIP = 'PARSNIP',
  POTATO = 'POTATO',
  CAULIFLOWER = 'CAULIFLOWER',
}

export enum CropStage {
  SEED = 'SEED',
  SPROUT = 'SPROUT',
  GROWING = 'GROWING',
  MATURE = 'MATURE',
  HARVEST = 'HARVEST',
}

export enum ToolType {
  HOE = 'HOE',
  WATERING_CAN = 'WATERING_CAN',
  SCYTHE = 'SCYTHE',
  AXE = 'AXE',
  PICKAXE = 'PICKAXE',
}

export enum ItemType {
  TOOL = 'TOOL',
  SEED = 'SEED',
  CROP = 'CROP',
}

export enum GameScreen {
  TITLE = 'TITLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  SHOP = 'SHOP',
  DIALOG = 'DIALOG',
  INVENTORY = 'INVENTORY',
  SLEEPING = 'SLEEPING',
  END = 'END',
}

export enum MapId {
  FARM = 'FARM',
  TOWN = 'TOWN',
  BEACH = 'BEACH',
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

// Interfaces
export interface Position {
  x: number;
  y: number;
}

export interface Crop {
  type: CropType;
  stage: CropStage;
  daysGrown: number;
  wateredToday: boolean;
}

export interface Tile {
  type: TileType;
  watered: boolean;
  crop: Crop | null;
}

export interface Item {
  type: ItemType;
  subType: CropType | ToolType;
  quantity: number;
}

export interface InventorySlot {
  item: Item | null;
}

export interface Schedule {
  startHour: number;
  endHour: number;
  mapId: MapId;
  pos: Position;
}

export interface NPC {
  id: string;
  name: string;
  pos: Position;
  friendship: number;
  schedule: Schedule[];
  talkedToday: boolean;
}

export interface Player {
  pos: Position;
  energy: number;
  maxEnergy: number;
  gold: number;
  inventory: InventorySlot[];
  selectedToolIndex: number;
  facing: Direction;
}

export interface TimeState {
  day: number;
  hour: number;
  minute: number;
  season: string;
}

export interface GameState {
  screen: GameScreen;
  player: Player;
  time: TimeState;
  farmGrid: Tile[][];
  townGrid: Tile[][];
  beachGrid: Tile[][];
  currentMap: MapId;
  npcs: NPC[];
  shippingBin: Item[];
  dialogText: string | null;
  dialogNPC: string | null;
  messages: string[];
}

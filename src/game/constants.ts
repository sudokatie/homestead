import { CropType, ToolType, MapId, Schedule } from './types';

// Grid dimensions
export const FARM_WIDTH = 32;
export const FARM_HEIGHT = 24;
export const TOWN_WIDTH = 24;
export const TOWN_HEIGHT = 24;
export const BEACH_WIDTH = 24;
export const BEACH_HEIGHT = 16;
export const TILE_SIZE = 32;

// Canvas
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;

// Time
export const DAY_START_HOUR = 6;
export const DAY_END_HOUR = 26; // 2 AM (next day)
export const MINUTES_PER_TICK = 10;
export const TICKS_PER_SECOND = 1;
export const SHOP_OPEN_HOUR = 9;
export const SHOP_CLOSE_HOUR = 17;
export const SPRING_LENGTH = 28;

// Energy
export const MAX_ENERGY = 100;
export const PASSOUT_ENERGY = 75;
export const TOOL_ENERGY: Record<ToolType, number> = {
  [ToolType.HOE]: 2,
  [ToolType.WATERING_CAN]: 1,
  [ToolType.SCYTHE]: 2,
  [ToolType.AXE]: 4,
  [ToolType.PICKAXE]: 4,
};

// Economy
export const STARTING_GOLD = 500;
export const STARTING_PARSNIP_SEEDS = 15;

// Crops
export const CROP_DATA: Record<CropType, { seedCost: number; growthDays: number; sellPrice: number }> = {
  [CropType.PARSNIP]: { seedCost: 20, growthDays: 4, sellPrice: 35 },
  [CropType.POTATO]: { seedCost: 50, growthDays: 6, sellPrice: 80 },
  [CropType.CAULIFLOWER]: { seedCost: 80, growthDays: 12, sellPrice: 175 },
};

// Growth stages - how many days to reach each stage
export const STAGE_PROGRESS: Record<CropType, number[]> = {
  [CropType.PARSNIP]: [1, 2, 3, 4], // SEED->SPROUT at day 1, SPROUT->GROWING at day 2, etc.
  [CropType.POTATO]: [1, 2, 4, 6],
  [CropType.CAULIFLOWER]: [1, 4, 8, 12],
};

// Inventory
export const INVENTORY_SIZE = 12;
export const MAX_STACK = 99;

// NPC - Emily's schedule
export const EMILY_SCHEDULE: Schedule[] = [
  { startHour: 6, endHour: 9, mapId: MapId.TOWN, pos: { x: 18, y: 4 } }, // Home
  { startHour: 9, endHour: 12, mapId: MapId.BEACH, pos: { x: 10, y: 8 } }, // Beach
  { startHour: 12, endHour: 17, mapId: MapId.TOWN, pos: { x: 12, y: 12 } }, // Shop area
  { startHour: 17, endHour: 22, mapId: MapId.TOWN, pos: { x: 18, y: 4 } }, // Home
];

// Friendship
export const TALK_FRIENDSHIP = 10;
export const LIKED_GIFT_FRIENDSHIP = 50;
export const LOVED_GIFT_FRIENDSHIP = 100;
export const DISLIKED_GIFT_FRIENDSHIP = -20;
export const POINTS_PER_HEART = 100;
export const MAX_HEARTS = 10;

// Gift preferences for Emily
export const EMILY_LOVED_GIFTS: (CropType | ToolType)[] = []; // Empty for MVP - no flowers/gems
export const EMILY_LIKED_GIFTS: CropType[] = [CropType.PARSNIP, CropType.POTATO, CropType.CAULIFLOWER];
export const EMILY_DISLIKED_GIFTS: (CropType | ToolType)[] = []; // Empty for MVP

// Map exit positions
export const FARM_TO_TOWN_EXIT = { x: 31, y: 12 };
export const TOWN_TO_FARM_ENTRY = { x: 0, y: 12 };
export const TOWN_TO_BEACH_EXIT = { x: 12, y: 23 };
export const BEACH_TO_TOWN_ENTRY = { x: 12, y: 0 };
export const TOWN_TO_FARM_EXIT = { x: 0, y: 12 };
export const FARM_TO_TOWN_ENTRY = { x: 31, y: 12 };
export const BEACH_TO_TOWN_EXIT = { x: 12, y: 0 };
export const TOWN_TO_BEACH_ENTRY = { x: 12, y: 23 };

// Player starting position (farmhouse door)
export const PLAYER_START_POS = { x: 10, y: 12 };
export const FARMHOUSE_POS = { x: 8, y: 10 };
export const SHIPPING_BIN_POS = { x: 12, y: 10 };

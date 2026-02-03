import { ToolType, TileType, Tile, Player, CropStage } from './types';
import { TOOL_ENERGY } from './constants';
import { tillTile, waterTile, canTill, canWater } from './Tile';
import { harvestCrop } from './Crop';

export interface ToolResult {
  success: boolean;
  message?: string;
  energyCost: number;
}

export function useTool(
  tool: ToolType,
  player: Player,
  grid: Tile[][],
  x: number,
  y: number
): ToolResult {
  const tile = grid[y]?.[x];
  if (!tile) {
    return { success: false, message: 'Invalid position', energyCost: 0 };
  }

  if (!canUseTool(tool, tile)) {
    return { success: false, message: 'Cannot use tool here', energyCost: 0 };
  }

  const energyCost = getToolEnergyCost(tool);
  if (player.energy < energyCost) {
    return { success: false, message: 'Not enough energy', energyCost: 0 };
  }

  switch (tool) {
    case ToolType.HOE:
      grid[y][x] = tillTile(tile);
      return { success: true, message: 'Tilled the soil', energyCost };

    case ToolType.WATERING_CAN:
      waterTile(tile);
      if (tile.crop) {
        tile.crop.wateredToday = true;
      }
      return { success: true, message: 'Watered', energyCost };

    case ToolType.SCYTHE:
      if (tile.crop && tile.crop.stage === CropStage.HARVEST) {
        const item = harvestCrop(tile);
        if (item) {
          return { success: true, message: 'Harvested crop', energyCost };
        }
      }
      return { success: false, message: 'Nothing to harvest', energyCost: 0 };

    case ToolType.AXE:
      if (tile.type === TileType.TREE) {
        grid[y][x] = { type: TileType.GRASS, watered: false, crop: null };
        return { success: true, message: 'Chopped tree', energyCost };
      }
      return { success: false, message: 'Nothing to chop', energyCost: 0 };

    case ToolType.PICKAXE:
      if (tile.type === TileType.STONE) {
        grid[y][x] = { type: TileType.GRASS, watered: false, crop: null };
        return { success: true, message: 'Broke rock', energyCost };
      }
      return { success: false, message: 'Nothing to break', energyCost: 0 };

    default:
      return { success: false, message: 'Unknown tool', energyCost: 0 };
  }
}

export function getToolEnergyCost(tool: ToolType): number {
  return TOOL_ENERGY[tool];
}

export function canUseTool(tool: ToolType, tile: Tile): boolean {
  switch (tool) {
    case ToolType.HOE:
      return canTill(tile);

    case ToolType.WATERING_CAN:
      return canWater(tile);

    case ToolType.SCYTHE:
      return tile.crop !== null && tile.crop.stage === CropStage.HARVEST;

    case ToolType.AXE:
      return tile.type === TileType.TREE;

    case ToolType.PICKAXE:
      return tile.type === TileType.STONE;

    default:
      return false;
  }
}

export function getToolName(tool: ToolType): string {
  switch (tool) {
    case ToolType.HOE:
      return 'Hoe';
    case ToolType.WATERING_CAN:
      return 'Watering Can';
    case ToolType.SCYTHE:
      return 'Scythe';
    case ToolType.AXE:
      return 'Axe';
    case ToolType.PICKAXE:
      return 'Pickaxe';
  }
}

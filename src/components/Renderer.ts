import {
  GameState,
  Tile,
  TileType,
  CropStage,
  MapId,
  Direction,
  NPC,
} from '../game/types';
import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants';
import { getCurrentGrid, getCurrentMapDimensions } from '../game/Game';
import { getNPCPosition } from '../game/NPC';

// Colors for different tile types
const TILE_COLORS: Record<TileType, string> = {
  [TileType.GRASS]: '#4a7c4a',
  [TileType.DIRT]: '#8b6914',
  [TileType.TILLED]: '#5a4a2a',
  [TileType.WATER]: '#3a8aaa',
  [TileType.STONE]: '#6a6a6a',
  [TileType.TREE]: '#2a5a2a',
  [TileType.BUILDING]: '#6a4a3a',
};

// Colors for crop growth stages
const CROP_COLORS: Record<CropStage, string> = {
  [CropStage.SEED]: '#5a4a3a',
  [CropStage.SPROUT]: '#7a9a5a',
  [CropStage.GROWING]: '#5a8a4a',
  [CropStage.MATURE]: '#4a7a3a',
  [CropStage.HARVEST]: '#ffa500',
};

/**
 * Main render function.
 */
export function renderGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  // Clear canvas
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const grid = getCurrentGrid(state);
  const { width, height } = getCurrentMapDimensions(state);

  // Calculate camera offset to center player
  const cameraX = Math.max(
    0,
    Math.min(
      state.player.pos.x * TILE_SIZE - CANVAS_WIDTH / 2 + TILE_SIZE / 2,
      width * TILE_SIZE - CANVAS_WIDTH
    )
  );
  const cameraY = Math.max(
    0,
    Math.min(
      state.player.pos.y * TILE_SIZE - CANVAS_HEIGHT / 2 + TILE_SIZE / 2,
      height * TILE_SIZE - CANVAS_HEIGHT
    )
  );

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  // Render map
  renderMap(ctx, grid, width, height);

  // Render crops
  renderCrops(ctx, grid, width, height);

  // Render NPCs
  renderNPCs(ctx, state.npcs, state.currentMap, state.time.hour);

  // Render player
  renderPlayer(ctx, state);

  ctx.restore();

  // Render day/night overlay
  renderDayNightOverlay(ctx, state.time.hour);
}

/**
 * Render the tile-based map.
 */
export function renderMap(
  ctx: CanvasRenderingContext2D,
  grid: Tile[][],
  width: number,
  height: number
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = grid[y]?.[x];
      if (!tile) continue;

      const screenX = x * TILE_SIZE;
      const screenY = y * TILE_SIZE;

      // Base tile color
      ctx.fillStyle = getTileColor(tile.type);
      ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

      // Watered indicator (darker tint)
      if (tile.watered) {
        ctx.fillStyle = 'rgba(0, 50, 100, 0.3)';
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
      }

      // Tile border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
    }
  }
}

/**
 * Render crops on tiles.
 */
export function renderCrops(
  ctx: CanvasRenderingContext2D,
  grid: Tile[][],
  width: number,
  height: number
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = grid[y]?.[x];
      if (!tile?.crop) continue;

      const screenX = x * TILE_SIZE;
      const screenY = y * TILE_SIZE;
      const crop = tile.crop;

      // Crop size based on growth stage
      const sizeFactor = getCropSizeFactor(crop.stage);
      const cropSize = TILE_SIZE * 0.6 * sizeFactor;
      const offset = (TILE_SIZE - cropSize) / 2;

      // Draw crop
      ctx.fillStyle = getCropColor(crop.stage);
      ctx.fillRect(
        screenX + offset,
        screenY + offset,
        cropSize,
        cropSize
      );

      // Harvest ready indicator
      if (crop.stage === CropStage.HARVEST) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          screenX + offset - 2,
          screenY + offset - 2,
          cropSize + 4,
          cropSize + 4
        );
        ctx.lineWidth = 1;
      }
    }
  }
}

/**
 * Render the player.
 */
export function renderPlayer(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  const { player } = state;
  const screenX = player.pos.x * TILE_SIZE;
  const screenY = player.pos.y * TILE_SIZE;

  // Player body
  ctx.fillStyle = '#3a7aca';
  ctx.fillRect(
    screenX + 4,
    screenY + 4,
    TILE_SIZE - 8,
    TILE_SIZE - 8
  );

  // Facing direction indicator
  ctx.fillStyle = '#2a5a9a';
  const dirOffset = 8;
  switch (player.facing) {
    case Direction.UP:
      ctx.fillRect(screenX + 10, screenY + 4, 12, 6);
      break;
    case Direction.DOWN:
      ctx.fillRect(screenX + 10, screenY + TILE_SIZE - 10, 12, 6);
      break;
    case Direction.LEFT:
      ctx.fillRect(screenX + 4, screenY + 10, 6, 12);
      break;
    case Direction.RIGHT:
      ctx.fillRect(screenX + TILE_SIZE - 10, screenY + 10, 6, 12);
      break;
  }
}

/**
 * Render NPCs on the current map.
 */
export function renderNPCs(
  ctx: CanvasRenderingContext2D,
  npcs: NPC[],
  currentMap: MapId,
  currentHour: number
): void {
  for (const npc of npcs) {
    const location = getNPCPosition(npc, currentHour);
    if (!location || location.mapId !== currentMap) continue;

    const screenX = location.pos.x * TILE_SIZE;
    const screenY = location.pos.y * TILE_SIZE;

    // NPC body
    ctx.fillStyle = '#ca5a7a';
    ctx.fillRect(
      screenX + 4,
      screenY + 4,
      TILE_SIZE - 8,
      TILE_SIZE - 8
    );

    // Name label
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, screenX + TILE_SIZE / 2, screenY - 2);
  }
}

/**
 * Render day/night overlay.
 */
export function renderDayNightOverlay(
  ctx: CanvasRenderingContext2D,
  hour: number
): void {
  let alpha = 0;

  // Dusk (6 PM - 8 PM)
  if (hour >= 18 && hour < 20) {
    alpha = (hour - 18) * 0.15;
  }
  // Night (8 PM - 2 AM)
  else if (hour >= 20 || hour < 2) {
    alpha = 0.3;
  }
  // Dawn (5 AM - 6 AM)
  else if (hour >= 5 && hour < 6) {
    alpha = 0.3 - (hour - 5) * 0.3;
  }

  if (alpha > 0) {
    ctx.fillStyle = `rgba(20, 20, 50, ${alpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

/**
 * Get color for tile type.
 */
export function getTileColor(type: TileType): string {
  return TILE_COLORS[type] || '#ff00ff';
}

/**
 * Get color for crop stage.
 */
export function getCropColor(stage: CropStage): string {
  return CROP_COLORS[stage] || '#ff00ff';
}

/**
 * Get size factor for crop stage.
 */
export function getCropSizeFactor(stage: CropStage): number {
  switch (stage) {
    case CropStage.SEED:
      return 0.3;
    case CropStage.SPROUT:
      return 0.5;
    case CropStage.GROWING:
      return 0.7;
    case CropStage.MATURE:
      return 0.9;
    case CropStage.HARVEST:
      return 1.0;
    default:
      return 1.0;
  }
}

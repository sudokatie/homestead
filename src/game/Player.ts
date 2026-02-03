import { Player, Position, Direction, ToolType, ItemType, Tile } from './types';
import { initializeStartingInventory } from './Inventory';
import { MAX_ENERGY, STARTING_GOLD, INVENTORY_SIZE } from './constants';
import { isWalkable } from './Grid';

/**
 * Create a new player with starting inventory and position.
 */
export function createPlayer(): Player {
  return {
    pos: { x: 10, y: 12 }, // Near farmhouse door
    energy: MAX_ENERGY,
    maxEnergy: MAX_ENERGY,
    gold: STARTING_GOLD,
    inventory: initializeStartingInventory(),
    selectedToolIndex: 0,
    facing: Direction.DOWN,
  };
}

/**
 * Move player by delta if the target position is walkable.
 * Returns true if movement succeeded.
 */
export function movePlayer(
  player: Player,
  dx: number,
  dy: number,
  grid: Tile[][],
  mapWidth: number,
  mapHeight: number
): boolean {
  const newX = player.pos.x + dx;
  const newY = player.pos.y + dy;

  // Update facing direction based on movement
  if (dx < 0) player.facing = Direction.LEFT;
  else if (dx > 0) player.facing = Direction.RIGHT;
  else if (dy < 0) player.facing = Direction.UP;
  else if (dy > 0) player.facing = Direction.DOWN;

  // Check bounds
  if (newX < 0 || newX >= mapWidth || newY < 0 || newY >= mapHeight) {
    return false;
  }

  // Check walkability
  const tile = grid[newY]?.[newX];
  if (!tile || !isWalkable(tile)) {
    return false;
  }

  player.pos = { x: newX, y: newY };
  return true;
}

/**
 * Select a tool by index (0-4).
 */
export function selectTool(player: Player, index: number): void {
  if (index >= 0 && index < 5) {
    player.selectedToolIndex = index;
  }
}

/**
 * Get the currently selected tool type.
 */
export function getSelectedTool(player: Player): ToolType {
  const toolOrder: ToolType[] = [
    ToolType.HOE,
    ToolType.WATERING_CAN,
    ToolType.SCYTHE,
    ToolType.AXE,
    ToolType.PICKAXE,
  ];
  return toolOrder[player.selectedToolIndex] || ToolType.HOE;
}

/**
 * Set the player's facing direction.
 */
export function setFacing(player: Player, direction: Direction): void {
  player.facing = direction;
}

/**
 * Get the tile position the player is facing.
 */
export function getFacingPosition(player: Player): Position {
  const { x, y } = player.pos;
  switch (player.facing) {
    case Direction.UP:
      return { x, y: y - 1 };
    case Direction.DOWN:
      return { x, y: y + 1 };
    case Direction.LEFT:
      return { x: x - 1, y };
    case Direction.RIGHT:
      return { x: x + 1, y };
  }
}

/**
 * Check if player is at a specific position.
 */
export function isPlayerAt(player: Player, pos: Position): boolean {
  return player.pos.x === pos.x && player.pos.y === pos.y;
}

/**
 * Reset player energy and position for a new day.
 */
export function resetPlayerForNewDay(player: Player): void {
  player.energy = player.maxEnergy;
}

/**
 * Get energy as a percentage (0-100).
 */
export function getEnergyPercent(player: Player): number {
  return Math.floor((player.energy / player.maxEnergy) * 100);
}

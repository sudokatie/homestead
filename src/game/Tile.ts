import { Tile, TileType } from './types';

export function createTile(type: TileType): Tile {
  return {
    type,
    watered: false,
    crop: null,
  };
}

export function tillTile(tile: Tile): Tile {
  if (!canTill(tile)) {
    return tile;
  }
  return {
    ...tile,
    type: TileType.TILLED,
  };
}

export function waterTile(tile: Tile): void {
  if (canWater(tile)) {
    tile.watered = true;
  }
}

export function clearWatered(grid: Tile[][]): void {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      grid[y][x].watered = false;
    }
  }
}

export function canTill(tile: Tile): boolean {
  return tile.type === TileType.GRASS || tile.type === TileType.DIRT;
}

export function canWater(tile: Tile): boolean {
  return tile.type === TileType.TILLED;
}

export function canPlant(tile: Tile): boolean {
  return tile.type === TileType.TILLED && tile.crop === null;
}

import { Tile, TileType } from './types';
import { createTile } from './Tile';
import {
  FARM_WIDTH,
  FARM_HEIGHT,
  TOWN_WIDTH,
  TOWN_HEIGHT,
  BEACH_WIDTH,
  BEACH_HEIGHT,
} from './constants';

// Seeded random for deterministic grids
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function createFarmGrid(): Tile[][] {
  const grid: Tile[][] = [];
  const rand = seededRandom(42);

  for (let y = 0; y < FARM_HEIGHT; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < FARM_WIDTH; x++) {
      // Border with trees
      if (x === 0 || y === 0 || x === FARM_WIDTH - 1 || y === FARM_HEIGHT - 1) {
        // Leave opening for town exit at right edge middle
        if (x === FARM_WIDTH - 1 && y >= 11 && y <= 13) {
          row.push(createTile(TileType.GRASS));
        } else {
          row.push(createTile(TileType.TREE));
        }
      }
      // House area (top-left corner)
      else if (x >= 2 && x <= 5 && y >= 2 && y <= 4) {
        row.push(createTile(TileType.BUILDING));
      }
      // Clear farming area near house (to the right of house)
      else if (x >= 7 && x <= 20 && y >= 3 && y <= 16) {
        row.push(createTile(TileType.GRASS));
      }
      // Random rocks and trees elsewhere
      else {
        const r = rand();
        if (r < 0.1) {
          row.push(createTile(TileType.STONE));
        } else if (r < 0.2) {
          row.push(createTile(TileType.TREE));
        } else {
          row.push(createTile(TileType.GRASS));
        }
      }
    }
    grid.push(row);
  }

  return grid;
}

export function createTownGrid(): Tile[][] {
  const grid: Tile[][] = [];

  for (let y = 0; y < TOWN_HEIGHT; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < TOWN_WIDTH; x++) {
      // Border
      if (x === 0 || y === 0 || x === TOWN_WIDTH - 1 || y === TOWN_HEIGHT - 1) {
        // Farm entrance at left
        if (x === 0 && y >= 11 && y <= 13) {
          row.push(createTile(TileType.DIRT));
        }
        // Beach exit at bottom
        else if (y === TOWN_HEIGHT - 1 && x >= 11 && x <= 13) {
          row.push(createTile(TileType.DIRT));
        } else {
          row.push(createTile(TileType.TREE));
        }
      }
      // Shop building
      else if (x >= 10 && x <= 14 && y >= 4 && y <= 6) {
        row.push(createTile(TileType.BUILDING));
      }
      // Emily's house
      else if (x >= 17 && x <= 20 && y >= 3 && y <= 5) {
        row.push(createTile(TileType.BUILDING));
      }
      // Main paths (stone)
      else if (y === 12 || x === 12) {
        row.push(createTile(TileType.STONE));
      }
      // Grass elsewhere
      else {
        row.push(createTile(TileType.GRASS));
      }
    }
    grid.push(row);
  }

  return grid;
}

export function createBeachGrid(): Tile[][] {
  const grid: Tile[][] = [];

  for (let y = 0; y < BEACH_HEIGHT; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < BEACH_WIDTH; x++) {
      // Town entrance at top
      if (y === 0) {
        if (x >= 11 && x <= 13) {
          row.push(createTile(TileType.DIRT));
        } else {
          row.push(createTile(TileType.TREE));
        }
      }
      // Water at bottom
      else if (y >= BEACH_HEIGHT - 3) {
        row.push(createTile(TileType.WATER));
      }
      // Sand/dirt in middle
      else {
        row.push(createTile(TileType.DIRT));
      }
    }
    grid.push(row);
  }

  return grid;
}

export function getTile(grid: Tile[][], x: number, y: number): Tile | null {
  if (!isValidPosition(grid[0]?.length || 0, grid.length, x, y)) {
    return null;
  }
  return grid[y][x];
}

export function setTile(grid: Tile[][], x: number, y: number, tile: Tile): void {
  if (isValidPosition(grid[0]?.length || 0, grid.length, x, y)) {
    grid[y][x] = tile;
  }
}

export function isWalkable(tile: Tile | null): boolean {
  if (!tile) return false;
  return (
    tile.type === TileType.GRASS ||
    tile.type === TileType.DIRT ||
    tile.type === TileType.TILLED ||
    tile.type === TileType.STONE
  );
}

export function isValidPosition(
  width: number,
  height: number,
  x: number,
  y: number
): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

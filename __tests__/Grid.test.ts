import { TileType, MapId } from '../src/game/types';
import {
  createFarmGrid,
  createTownGrid,
  createBeachGrid,
  getTile,
  setTile,
  isWalkable,
  isValidPosition,
} from '../src/game/Grid';
import {
  createTile,
  tillTile,
  waterTile,
  clearWatered,
  canTill,
  canWater,
  canPlant,
} from '../src/game/Tile';
import {
  getMapDimensions,
  getExitPosition,
  getEntryPosition,
  checkMapTransition,
} from '../src/game/Maps';
import {
  FARM_WIDTH,
  FARM_HEIGHT,
  TOWN_WIDTH,
  TOWN_HEIGHT,
  BEACH_WIDTH,
  BEACH_HEIGHT,
} from '../src/game/constants';

describe('Grid', () => {
  describe('createFarmGrid', () => {
    it('creates grid with correct dimensions', () => {
      const grid = createFarmGrid();
      expect(grid.length).toBe(FARM_HEIGHT);
      expect(grid[0].length).toBe(FARM_WIDTH);
    });

    it('has tree border', () => {
      const grid = createFarmGrid();
      expect(grid[0][0].type).toBe(TileType.TREE);
      expect(grid[0][15].type).toBe(TileType.TREE);
    });

    it('has opening for town exit', () => {
      const grid = createFarmGrid();
      expect(grid[12][FARM_WIDTH - 1].type).toBe(TileType.GRASS);
    });

    it('has house building area', () => {
      const grid = createFarmGrid();
      expect(grid[3][3].type).toBe(TileType.BUILDING);
    });

    it('produces deterministic output', () => {
      const grid1 = createFarmGrid();
      const grid2 = createFarmGrid();
      expect(grid1[10][10].type).toBe(grid2[10][10].type);
    });
  });

  describe('createTownGrid', () => {
    it('creates grid with correct dimensions', () => {
      const grid = createTownGrid();
      expect(grid.length).toBe(TOWN_HEIGHT);
      expect(grid[0].length).toBe(TOWN_WIDTH);
    });

    it('has farm entrance on left', () => {
      const grid = createTownGrid();
      expect(grid[12][0].type).toBe(TileType.DIRT);
    });

    it('has beach exit at bottom', () => {
      const grid = createTownGrid();
      expect(grid[TOWN_HEIGHT - 1][12].type).toBe(TileType.DIRT);
    });

    it('has shop building', () => {
      const grid = createTownGrid();
      expect(grid[5][12].type).toBe(TileType.BUILDING);
    });
  });

  describe('createBeachGrid', () => {
    it('creates grid with correct dimensions', () => {
      const grid = createBeachGrid();
      expect(grid.length).toBe(BEACH_HEIGHT);
      expect(grid[0].length).toBe(BEACH_WIDTH);
    });

    it('has water at bottom', () => {
      const grid = createBeachGrid();
      expect(grid[BEACH_HEIGHT - 1][5].type).toBe(TileType.WATER);
    });

    it('has town entrance at top', () => {
      const grid = createBeachGrid();
      expect(grid[0][12].type).toBe(TileType.DIRT);
    });
  });

  describe('getTile', () => {
    it('returns tile at valid position', () => {
      const grid = createFarmGrid();
      const tile = getTile(grid, 10, 10);
      expect(tile).not.toBeNull();
    });

    it('returns null for out of bounds', () => {
      const grid = createFarmGrid();
      expect(getTile(grid, -1, 0)).toBeNull();
      expect(getTile(grid, 0, -1)).toBeNull();
      expect(getTile(grid, 100, 0)).toBeNull();
      expect(getTile(grid, 0, 100)).toBeNull();
    });
  });

  describe('setTile', () => {
    it('sets tile at valid position', () => {
      const grid = createFarmGrid();
      const newTile = createTile(TileType.WATER);
      setTile(grid, 10, 10, newTile);
      expect(grid[10][10].type).toBe(TileType.WATER);
    });

    it('does nothing for out of bounds', () => {
      const grid = createFarmGrid();
      const newTile = createTile(TileType.WATER);
      setTile(grid, -1, 0, newTile);
      // Should not throw
    });
  });

  describe('isWalkable', () => {
    it('grass is walkable', () => {
      expect(isWalkable(createTile(TileType.GRASS))).toBe(true);
    });

    it('dirt is walkable', () => {
      expect(isWalkable(createTile(TileType.DIRT))).toBe(true);
    });

    it('tilled is walkable', () => {
      expect(isWalkable(createTile(TileType.TILLED))).toBe(true);
    });

    it('stone is walkable', () => {
      expect(isWalkable(createTile(TileType.STONE))).toBe(true);
    });

    it('water is not walkable', () => {
      expect(isWalkable(createTile(TileType.WATER))).toBe(false);
    });

    it('tree is not walkable', () => {
      expect(isWalkable(createTile(TileType.TREE))).toBe(false);
    });

    it('building is not walkable', () => {
      expect(isWalkable(createTile(TileType.BUILDING))).toBe(false);
    });

    it('null is not walkable', () => {
      expect(isWalkable(null)).toBe(false);
    });
  });

  describe('isValidPosition', () => {
    it('returns true for valid positions', () => {
      expect(isValidPosition(10, 10, 5, 5)).toBe(true);
      expect(isValidPosition(10, 10, 0, 0)).toBe(true);
      expect(isValidPosition(10, 10, 9, 9)).toBe(true);
    });

    it('returns false for out of bounds', () => {
      expect(isValidPosition(10, 10, -1, 0)).toBe(false);
      expect(isValidPosition(10, 10, 0, -1)).toBe(false);
      expect(isValidPosition(10, 10, 10, 0)).toBe(false);
      expect(isValidPosition(10, 10, 0, 10)).toBe(false);
    });
  });
});

describe('Tile', () => {
  describe('createTile', () => {
    it('creates tile with correct type', () => {
      const tile = createTile(TileType.GRASS);
      expect(tile.type).toBe(TileType.GRASS);
      expect(tile.watered).toBe(false);
      expect(tile.crop).toBeNull();
    });
  });

  describe('tillTile', () => {
    it('tills grass to tilled', () => {
      const tile = createTile(TileType.GRASS);
      const tilled = tillTile(tile);
      expect(tilled.type).toBe(TileType.TILLED);
    });

    it('tills dirt to tilled', () => {
      const tile = createTile(TileType.DIRT);
      const tilled = tillTile(tile);
      expect(tilled.type).toBe(TileType.TILLED);
    });

    it('does not till water', () => {
      const tile = createTile(TileType.WATER);
      const result = tillTile(tile);
      expect(result.type).toBe(TileType.WATER);
    });
  });

  describe('waterTile', () => {
    it('waters tilled tile', () => {
      const tile = createTile(TileType.TILLED);
      waterTile(tile);
      expect(tile.watered).toBe(true);
    });

    it('does not water grass', () => {
      const tile = createTile(TileType.GRASS);
      waterTile(tile);
      expect(tile.watered).toBe(false);
    });
  });

  describe('clearWatered', () => {
    it('clears all watered flags', () => {
      const grid = [[createTile(TileType.TILLED), createTile(TileType.TILLED)]];
      grid[0][0].watered = true;
      grid[0][1].watered = true;
      clearWatered(grid);
      expect(grid[0][0].watered).toBe(false);
      expect(grid[0][1].watered).toBe(false);
    });
  });

  describe('canTill', () => {
    it('can till grass', () => {
      expect(canTill(createTile(TileType.GRASS))).toBe(true);
    });

    it('can till dirt', () => {
      expect(canTill(createTile(TileType.DIRT))).toBe(true);
    });

    it('cannot till water', () => {
      expect(canTill(createTile(TileType.WATER))).toBe(false);
    });
  });

  describe('canWater', () => {
    it('can water tilled', () => {
      expect(canWater(createTile(TileType.TILLED))).toBe(true);
    });

    it('cannot water grass', () => {
      expect(canWater(createTile(TileType.GRASS))).toBe(false);
    });
  });

  describe('canPlant', () => {
    it('can plant on empty tilled tile', () => {
      expect(canPlant(createTile(TileType.TILLED))).toBe(true);
    });

    it('cannot plant on grass', () => {
      expect(canPlant(createTile(TileType.GRASS))).toBe(false);
    });

    it('cannot plant on tile with crop', () => {
      const tile = createTile(TileType.TILLED);
      tile.crop = { type: 0, stage: 0, daysGrown: 0, wateredToday: false };
      expect(canPlant(tile)).toBe(false);
    });
  });
});

describe('Maps', () => {
  describe('getMapDimensions', () => {
    it('returns farm dimensions', () => {
      const dims = getMapDimensions(MapId.FARM);
      expect(dims.width).toBe(FARM_WIDTH);
      expect(dims.height).toBe(FARM_HEIGHT);
    });

    it('returns town dimensions', () => {
      const dims = getMapDimensions(MapId.TOWN);
      expect(dims.width).toBe(TOWN_WIDTH);
      expect(dims.height).toBe(TOWN_HEIGHT);
    });

    it('returns beach dimensions', () => {
      const dims = getMapDimensions(MapId.BEACH);
      expect(dims.width).toBe(BEACH_WIDTH);
      expect(dims.height).toBe(BEACH_HEIGHT);
    });
  });

  describe('getExitPosition', () => {
    it('returns farm to town exit', () => {
      const pos = getExitPosition(MapId.FARM, MapId.TOWN);
      expect(pos).toEqual({ x: 31, y: 12 });
    });

    it('returns town to beach exit', () => {
      const pos = getExitPosition(MapId.TOWN, MapId.BEACH);
      expect(pos).toEqual({ x: 12, y: 23 });
    });

    it('returns null for invalid transition', () => {
      expect(getExitPosition(MapId.FARM, MapId.BEACH)).toBeNull();
    });
  });

  describe('getEntryPosition', () => {
    it('returns town entry from farm', () => {
      const pos = getEntryPosition(MapId.TOWN, MapId.FARM);
      expect(pos).toEqual({ x: 0, y: 12 });
    });

    it('returns beach entry from town', () => {
      const pos = getEntryPosition(MapId.BEACH, MapId.TOWN);
      expect(pos).toEqual({ x: 12, y: 0 });
    });
  });

  describe('checkMapTransition', () => {
    it('detects farm to town transition', () => {
      expect(checkMapTransition(MapId.FARM, FARM_WIDTH - 1, 12)).toBe(MapId.TOWN);
    });

    it('detects town to farm transition', () => {
      expect(checkMapTransition(MapId.TOWN, 0, 12)).toBe(MapId.FARM);
    });

    it('detects town to beach transition', () => {
      expect(checkMapTransition(MapId.TOWN, 12, TOWN_HEIGHT - 1)).toBe(MapId.BEACH);
    });

    it('detects beach to town transition', () => {
      expect(checkMapTransition(MapId.BEACH, 12, 0)).toBe(MapId.TOWN);
    });

    it('returns null for no transition', () => {
      expect(checkMapTransition(MapId.FARM, 10, 10)).toBeNull();
    });
  });
});

import {
  createPlayer,
  movePlayer,
  selectTool,
  getSelectedTool,
  setFacing,
  getFacingPosition,
  isPlayerAt,
  resetPlayerForNewDay,
  getEnergyPercent,
} from '../src/game/Player';
import { createFarmGrid } from '../src/game/Grid';
import { Direction, ToolType, TileType } from '../src/game/types';
import { STARTING_GOLD, MAX_ENERGY, FARM_WIDTH, FARM_HEIGHT } from '../src/game/constants';

describe('Player', () => {
  describe('createPlayer', () => {
    it('creates player at starting position', () => {
      const player = createPlayer();
      expect(player.pos).toEqual({ x: 10, y: 12 });
    });

    it('creates player with full energy', () => {
      const player = createPlayer();
      expect(player.energy).toBe(MAX_ENERGY);
      expect(player.maxEnergy).toBe(MAX_ENERGY);
    });

    it('creates player with starting gold', () => {
      const player = createPlayer();
      expect(player.gold).toBe(STARTING_GOLD);
    });

    it('creates player with inventory', () => {
      const player = createPlayer();
      expect(player.inventory).toBeDefined();
      expect(player.inventory.length).toBe(12);
    });

    it('starts with hoe selected', () => {
      const player = createPlayer();
      expect(player.selectedToolIndex).toBe(0);
      expect(getSelectedTool(player)).toBe(ToolType.HOE);
    });

    it('starts facing down', () => {
      const player = createPlayer();
      expect(player.facing).toBe(Direction.DOWN);
    });
  });

  describe('movePlayer', () => {
    it('moves player to walkable tile', () => {
      const player = createPlayer();
      const grid = createFarmGrid();
      const startX = player.pos.x;
      const startY = player.pos.y;

      const moved = movePlayer(player, 0, 1, grid, FARM_WIDTH, FARM_HEIGHT);
      expect(moved).toBe(true);
      expect(player.pos.y).toBe(startY + 1);
    });

    it('does not move onto non-walkable tiles', () => {
      const player = createPlayer();
      const grid = createFarmGrid();
      // Place player next to a building tile
      player.pos = { x: 5, y: 5 };
      grid[4][5] = { type: TileType.BUILDING, watered: false, crop: null };

      const moved = movePlayer(player, 0, -1, grid, FARM_WIDTH, FARM_HEIGHT);
      expect(moved).toBe(false);
      expect(player.pos.y).toBe(5);
    });

    it('does not move outside map bounds', () => {
      const player = createPlayer();
      const grid = createFarmGrid();
      player.pos = { x: 0, y: 0 };

      const moved = movePlayer(player, -1, 0, grid, FARM_WIDTH, FARM_HEIGHT);
      expect(moved).toBe(false);
      expect(player.pos.x).toBe(0);
    });

    it('updates facing direction on move', () => {
      const player = createPlayer();
      const grid = createFarmGrid();

      movePlayer(player, 1, 0, grid, FARM_WIDTH, FARM_HEIGHT);
      expect(player.facing).toBe(Direction.RIGHT);

      movePlayer(player, -1, 0, grid, FARM_WIDTH, FARM_HEIGHT);
      expect(player.facing).toBe(Direction.LEFT);

      movePlayer(player, 0, -1, grid, FARM_WIDTH, FARM_HEIGHT);
      expect(player.facing).toBe(Direction.UP);

      movePlayer(player, 0, 1, grid, FARM_WIDTH, FARM_HEIGHT);
      expect(player.facing).toBe(Direction.DOWN);
    });
  });

  describe('selectTool', () => {
    it('selects tool by index', () => {
      const player = createPlayer();

      selectTool(player, 1);
      expect(player.selectedToolIndex).toBe(1);
      expect(getSelectedTool(player)).toBe(ToolType.WATERING_CAN);

      selectTool(player, 2);
      expect(player.selectedToolIndex).toBe(2);
      expect(getSelectedTool(player)).toBe(ToolType.SCYTHE);
    });

    it('ignores invalid indices', () => {
      const player = createPlayer();
      player.selectedToolIndex = 0;

      selectTool(player, -1);
      expect(player.selectedToolIndex).toBe(0);

      selectTool(player, 5);
      expect(player.selectedToolIndex).toBe(0);
    });
  });

  describe('getSelectedTool', () => {
    it('returns correct tool for each index', () => {
      const player = createPlayer();

      player.selectedToolIndex = 0;
      expect(getSelectedTool(player)).toBe(ToolType.HOE);

      player.selectedToolIndex = 1;
      expect(getSelectedTool(player)).toBe(ToolType.WATERING_CAN);

      player.selectedToolIndex = 2;
      expect(getSelectedTool(player)).toBe(ToolType.SCYTHE);

      player.selectedToolIndex = 3;
      expect(getSelectedTool(player)).toBe(ToolType.AXE);

      player.selectedToolIndex = 4;
      expect(getSelectedTool(player)).toBe(ToolType.PICKAXE);
    });
  });

  describe('setFacing', () => {
    it('sets facing direction', () => {
      const player = createPlayer();

      setFacing(player, Direction.UP);
      expect(player.facing).toBe(Direction.UP);

      setFacing(player, Direction.LEFT);
      expect(player.facing).toBe(Direction.LEFT);
    });
  });

  describe('getFacingPosition', () => {
    it('returns position above when facing up', () => {
      const player = createPlayer();
      player.pos = { x: 5, y: 5 };
      player.facing = Direction.UP;

      const facing = getFacingPosition(player);
      expect(facing).toEqual({ x: 5, y: 4 });
    });

    it('returns position below when facing down', () => {
      const player = createPlayer();
      player.pos = { x: 5, y: 5 };
      player.facing = Direction.DOWN;

      const facing = getFacingPosition(player);
      expect(facing).toEqual({ x: 5, y: 6 });
    });

    it('returns position left when facing left', () => {
      const player = createPlayer();
      player.pos = { x: 5, y: 5 };
      player.facing = Direction.LEFT;

      const facing = getFacingPosition(player);
      expect(facing).toEqual({ x: 4, y: 5 });
    });

    it('returns position right when facing right', () => {
      const player = createPlayer();
      player.pos = { x: 5, y: 5 };
      player.facing = Direction.RIGHT;

      const facing = getFacingPosition(player);
      expect(facing).toEqual({ x: 6, y: 5 });
    });
  });

  describe('isPlayerAt', () => {
    it('returns true when player is at position', () => {
      const player = createPlayer();
      player.pos = { x: 5, y: 10 };

      expect(isPlayerAt(player, { x: 5, y: 10 })).toBe(true);
    });

    it('returns false when player is not at position', () => {
      const player = createPlayer();
      player.pos = { x: 5, y: 10 };

      expect(isPlayerAt(player, { x: 5, y: 11 })).toBe(false);
      expect(isPlayerAt(player, { x: 4, y: 10 })).toBe(false);
    });
  });

  describe('resetPlayerForNewDay', () => {
    it('restores energy to max', () => {
      const player = createPlayer();
      player.energy = 30;

      resetPlayerForNewDay(player);
      expect(player.energy).toBe(player.maxEnergy);
    });
  });

  describe('getEnergyPercent', () => {
    it('returns 100 at full energy', () => {
      const player = createPlayer();
      expect(getEnergyPercent(player)).toBe(100);
    });

    it('returns 50 at half energy', () => {
      const player = createPlayer();
      player.energy = player.maxEnergy / 2;
      expect(getEnergyPercent(player)).toBe(50);
    });

    it('returns 0 at zero energy', () => {
      const player = createPlayer();
      player.energy = 0;
      expect(getEnergyPercent(player)).toBe(0);
    });
  });
});

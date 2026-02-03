import { ToolType, TileType, CropType, CropStage, Direction } from '../src/game/types';
import { useTool, getToolEnergyCost, canUseTool, getToolName } from '../src/game/Tool';
import { createTile } from '../src/game/Tile';
import { createCrop, plantCrop } from '../src/game/Crop';
import { TOOL_ENERGY, MAX_ENERGY, INVENTORY_SIZE } from '../src/game/constants';

function createTestPlayer() {
  return {
    pos: { x: 5, y: 5 },
    energy: MAX_ENERGY,
    maxEnergy: MAX_ENERGY,
    gold: 500,
    inventory: Array(INVENTORY_SIZE).fill(null).map(() => ({ item: null })),
    selectedToolIndex: 0,
    facing: Direction.DOWN,
  };
}

function createTestGrid(): ReturnType<typeof createTile>[][] {
  const grid = [];
  for (let y = 0; y < 10; y++) {
    const row = [];
    for (let x = 0; x < 10; x++) {
      row.push(createTile(TileType.GRASS));
    }
    grid.push(row);
  }
  return grid;
}

describe('Tool', () => {
  describe('useTool - HOE', () => {
    it('tills grass to tilled', () => {
      const player = createTestPlayer();
      const grid = createTestGrid();
      const result = useTool(ToolType.HOE, player, grid, 5, 5);
      expect(result.success).toBe(true);
      expect(grid[5][5].type).toBe(TileType.TILLED);
    });

    it('costs correct energy', () => {
      const player = createTestPlayer();
      const grid = createTestGrid();
      const result = useTool(ToolType.HOE, player, grid, 5, 5);
      expect(result.energyCost).toBe(TOOL_ENERGY[ToolType.HOE]);
    });

    it('fails on water', () => {
      const player = createTestPlayer();
      const grid = createTestGrid();
      grid[5][5] = createTile(TileType.WATER);
      const result = useTool(ToolType.HOE, player, grid, 5, 5);
      expect(result.success).toBe(false);
    });
  });

  describe('useTool - WATERING_CAN', () => {
    it('waters tilled tile', () => {
      const player = createTestPlayer();
      const grid = createTestGrid();
      grid[5][5] = createTile(TileType.TILLED);
      const result = useTool(ToolType.WATERING_CAN, player, grid, 5, 5);
      expect(result.success).toBe(true);
      expect(grid[5][5].watered).toBe(true);
    });

    it('waters crop', () => {
      const player = createTestPlayer();
      const grid = createTestGrid();
      grid[5][5] = createTile(TileType.TILLED);
      plantCrop(grid[5][5], CropType.PARSNIP);
      const result = useTool(ToolType.WATERING_CAN, player, grid, 5, 5);
      expect(result.success).toBe(true);
      expect(grid[5][5].crop?.wateredToday).toBe(true);
    });

    it('fails on grass', () => {
      const player = createTestPlayer();
      const grid = createTestGrid();
      const result = useTool(ToolType.WATERING_CAN, player, grid, 5, 5);
      expect(result.success).toBe(false);
    });
  });

  describe('useTool - SCYTHE', () => {
    it('harvests ready crop', () => {
      const player = createTestPlayer();
      const grid = createTestGrid();
      grid[5][5] = createTile(TileType.TILLED);
      plantCrop(grid[5][5], CropType.PARSNIP);
      grid[5][5].crop!.stage = CropStage.HARVEST;
      grid[5][5].crop!.daysGrown = 4;

      const result = useTool(ToolType.SCYTHE, player, grid, 5, 5);
      expect(result.success).toBe(true);
      expect(grid[5][5].crop).toBeNull();
    });

    it('fails on non-ready crop', () => {
      const player = createTestPlayer();
      const grid = createTestGrid();
      grid[5][5] = createTile(TileType.TILLED);
      plantCrop(grid[5][5], CropType.PARSNIP);

      const result = useTool(ToolType.SCYTHE, player, grid, 5, 5);
      expect(result.success).toBe(false);
    });
  });

  describe('useTool - AXE', () => {
    it('chops tree', () => {
      const player = createTestPlayer();
      const grid = createTestGrid();
      grid[5][5] = createTile(TileType.TREE);
      const result = useTool(ToolType.AXE, player, grid, 5, 5);
      expect(result.success).toBe(true);
      expect(grid[5][5].type).toBe(TileType.GRASS);
    });

    it('fails on grass', () => {
      const player = createTestPlayer();
      const grid = createTestGrid();
      const result = useTool(ToolType.AXE, player, grid, 5, 5);
      expect(result.success).toBe(false);
    });
  });

  describe('useTool - PICKAXE', () => {
    it('breaks stone', () => {
      const player = createTestPlayer();
      const grid = createTestGrid();
      grid[5][5] = createTile(TileType.STONE);
      const result = useTool(ToolType.PICKAXE, player, grid, 5, 5);
      expect(result.success).toBe(true);
      expect(grid[5][5].type).toBe(TileType.GRASS);
    });

    it('fails on grass', () => {
      const player = createTestPlayer();
      const grid = createTestGrid();
      const result = useTool(ToolType.PICKAXE, player, grid, 5, 5);
      expect(result.success).toBe(false);
    });
  });

  describe('useTool - energy', () => {
    it('fails when not enough energy', () => {
      const player = createTestPlayer();
      player.energy = 0;
      const grid = createTestGrid();
      const result = useTool(ToolType.HOE, player, grid, 5, 5);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Not enough energy');
    });
  });

  describe('useTool - invalid position', () => {
    it('fails on out of bounds', () => {
      const player = createTestPlayer();
      const grid = createTestGrid();
      const result = useTool(ToolType.HOE, player, grid, -1, 5);
      expect(result.success).toBe(false);
    });
  });

  describe('getToolEnergyCost', () => {
    it('returns correct cost for each tool', () => {
      expect(getToolEnergyCost(ToolType.HOE)).toBe(2);
      expect(getToolEnergyCost(ToolType.WATERING_CAN)).toBe(1);
      expect(getToolEnergyCost(ToolType.SCYTHE)).toBe(2);
      expect(getToolEnergyCost(ToolType.AXE)).toBe(4);
      expect(getToolEnergyCost(ToolType.PICKAXE)).toBe(4);
    });
  });

  describe('canUseTool', () => {
    it('hoe can till grass', () => {
      expect(canUseTool(ToolType.HOE, createTile(TileType.GRASS))).toBe(true);
    });

    it('hoe cannot till water', () => {
      expect(canUseTool(ToolType.HOE, createTile(TileType.WATER))).toBe(false);
    });

    it('watering can works on tilled', () => {
      expect(canUseTool(ToolType.WATERING_CAN, createTile(TileType.TILLED))).toBe(true);
    });

    it('scythe works on harvest-ready crop', () => {
      const tile = createTile(TileType.TILLED);
      plantCrop(tile, CropType.PARSNIP);
      tile.crop!.stage = CropStage.HARVEST;
      expect(canUseTool(ToolType.SCYTHE, tile)).toBe(true);
    });

    it('axe works on tree', () => {
      expect(canUseTool(ToolType.AXE, createTile(TileType.TREE))).toBe(true);
    });

    it('pickaxe works on stone', () => {
      expect(canUseTool(ToolType.PICKAXE, createTile(TileType.STONE))).toBe(true);
    });
  });

  describe('getToolName', () => {
    it('returns correct names', () => {
      expect(getToolName(ToolType.HOE)).toBe('Hoe');
      expect(getToolName(ToolType.WATERING_CAN)).toBe('Watering Can');
      expect(getToolName(ToolType.SCYTHE)).toBe('Scythe');
      expect(getToolName(ToolType.AXE)).toBe('Axe');
      expect(getToolName(ToolType.PICKAXE)).toBe('Pickaxe');
    });
  });
});

import {
  canAfford,
  buySeeds,
  getShippingValue,
  processShippingBin,
  addToShippingBin,
  shipItem,
  getSeedCost,
  getSellPrice,
  getCropProfit,
  getGold,
  addGold,
  spendGold,
} from '../src/game/Economy';
import { createInventory, addItem } from '../src/game/Inventory';
import { Player, Item, ItemType, CropType, ToolType, Direction } from '../src/game/types';
import { STARTING_GOLD, CROP_DATA, MAX_ENERGY, INVENTORY_SIZE } from '../src/game/constants';

function createTestPlayer(gold: number = STARTING_GOLD): Player {
  return {
    pos: { x: 10, y: 10 },
    energy: MAX_ENERGY,
    maxEnergy: MAX_ENERGY,
    gold: gold,
    inventory: createInventory(),
    selectedToolIndex: 0,
    facing: Direction.DOWN,
  };
}

describe('Economy', () => {
  describe('canAfford', () => {
    it('returns true when player has enough gold', () => {
      const player = createTestPlayer(100);
      expect(canAfford(player, 50)).toBe(true);
      expect(canAfford(player, 100)).toBe(true);
    });

    it('returns false when player lacks gold', () => {
      const player = createTestPlayer(100);
      expect(canAfford(player, 101)).toBe(false);
    });
  });

  describe('buySeeds', () => {
    it('buys seeds and deducts gold', () => {
      const player = createTestPlayer(500);
      expect(buySeeds(player, CropType.PARSNIP, 5)).toBe(true);
      expect(player.gold).toBe(500 - 20 * 5); // 400
    });

    it('adds seeds to inventory', () => {
      const player = createTestPlayer(500);
      buySeeds(player, CropType.PARSNIP, 10);
      expect(player.inventory[0].item).not.toBeNull();
      expect(player.inventory[0].item!.type).toBe(ItemType.SEED);
      expect(player.inventory[0].item!.subType).toBe(CropType.PARSNIP);
      expect(player.inventory[0].item!.quantity).toBe(10);
    });

    it('returns false when insufficient gold', () => {
      const player = createTestPlayer(10);
      expect(buySeeds(player, CropType.PARSNIP, 5)).toBe(false);
      expect(player.gold).toBe(10); // Unchanged
    });

    it('returns false when inventory full', () => {
      const player = createTestPlayer(500);
      // Fill inventory with tools
      for (let i = 0; i < INVENTORY_SIZE; i++) {
        player.inventory[i].item = { type: ItemType.TOOL, subType: ToolType.HOE, quantity: 1 };
      }
      expect(buySeeds(player, CropType.PARSNIP, 5)).toBe(false);
      expect(player.gold).toBe(500); // Unchanged
    });

    it('works with different crop types', () => {
      const player = createTestPlayer(500);
      expect(buySeeds(player, CropType.POTATO, 2)).toBe(true);
      expect(player.gold).toBe(500 - 50 * 2); // 400
    });
  });

  describe('getShippingValue', () => {
    it('calculates value of crops', () => {
      const items: Item[] = [
        { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 5 },
      ];
      expect(getShippingValue(items)).toBe(35 * 5); // 175
    });

    it('sums multiple items', () => {
      const items: Item[] = [
        { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 2 },
        { type: ItemType.CROP, subType: CropType.POTATO, quantity: 3 },
      ];
      expect(getShippingValue(items)).toBe(35 * 2 + 80 * 3); // 310
    });

    it('ignores non-crop items', () => {
      const items: Item[] = [
        { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 10 },
        { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 2 },
      ];
      expect(getShippingValue(items)).toBe(35 * 2); // 70
    });

    it('returns 0 for empty bin', () => {
      expect(getShippingValue([])).toBe(0);
    });
  });

  describe('processShippingBin', () => {
    it('adds gold to player', () => {
      const player = createTestPlayer(100);
      const bin: Item[] = [
        { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 5 },
      ];
      const result = processShippingBin(player, bin);
      expect(result.gold).toBe(35 * 5);
      expect(player.gold).toBe(100 + 175);
    });

    it('clears the shipping bin', () => {
      const player = createTestPlayer(100);
      const bin: Item[] = [
        { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 5 },
      ];
      processShippingBin(player, bin);
      expect(bin.length).toBe(0);
    });

    it('returns items shipped count', () => {
      const player = createTestPlayer(100);
      const bin: Item[] = [
        { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 3 },
        { type: ItemType.CROP, subType: CropType.POTATO, quantity: 2 },
      ];
      const result = processShippingBin(player, bin);
      expect(result.itemsShipped).toBe(5);
    });
  });

  describe('addToShippingBin', () => {
    it('adds crop to empty bin', () => {
      const bin: Item[] = [];
      const item: Item = { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 5 };
      addToShippingBin(bin, item);
      expect(bin.length).toBe(1);
      expect(bin[0].quantity).toBe(5);
    });

    it('stacks with existing items', () => {
      const bin: Item[] = [
        { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 3 },
      ];
      const item: Item = { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 5 };
      addToShippingBin(bin, item);
      expect(bin.length).toBe(1);
      expect(bin[0].quantity).toBe(8);
    });

    it('does not stack different crops', () => {
      const bin: Item[] = [
        { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 3 },
      ];
      const item: Item = { type: ItemType.CROP, subType: CropType.POTATO, quantity: 5 };
      addToShippingBin(bin, item);
      expect(bin.length).toBe(2);
    });

    it('ignores non-crop items', () => {
      const bin: Item[] = [];
      const item: Item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 5 };
      addToShippingBin(bin, item);
      expect(bin.length).toBe(0);
    });
  });

  describe('shipItem', () => {
    it('moves crop from inventory to bin', () => {
      const player = createTestPlayer(100);
      const bin: Item[] = [];
      player.inventory[0].item = { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 10 };
      expect(shipItem(player, bin, 0, 5)).toBe(true);
      expect(player.inventory[0].item!.quantity).toBe(5);
      expect(bin.length).toBe(1);
      expect(bin[0].quantity).toBe(5);
    });

    it('returns false for non-crop items', () => {
      const player = createTestPlayer(100);
      const bin: Item[] = [];
      player.inventory[0].item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 10 };
      expect(shipItem(player, bin, 0, 5)).toBe(false);
      expect(player.inventory[0].item!.quantity).toBe(10); // Put back
      expect(bin.length).toBe(0);
    });

    it('returns false for empty slot', () => {
      const player = createTestPlayer(100);
      const bin: Item[] = [];
      expect(shipItem(player, bin, 0, 1)).toBe(false);
    });
  });

  describe('getSeedCost', () => {
    it('returns correct cost for parsnip', () => {
      expect(getSeedCost(CropType.PARSNIP)).toBe(20);
    });

    it('returns correct cost for potato', () => {
      expect(getSeedCost(CropType.POTATO)).toBe(50);
    });

    it('returns correct cost for cauliflower', () => {
      expect(getSeedCost(CropType.CAULIFLOWER)).toBe(80);
    });
  });

  describe('getSellPrice', () => {
    it('returns correct price for parsnip', () => {
      expect(getSellPrice(CropType.PARSNIP)).toBe(35);
    });

    it('returns correct price for potato', () => {
      expect(getSellPrice(CropType.POTATO)).toBe(80);
    });

    it('returns correct price for cauliflower', () => {
      expect(getSellPrice(CropType.CAULIFLOWER)).toBe(175);
    });
  });

  describe('getCropProfit', () => {
    it('calculates profit correctly', () => {
      expect(getCropProfit(CropType.PARSNIP)).toBe(35 - 20); // 15
      expect(getCropProfit(CropType.POTATO)).toBe(80 - 50); // 30
      expect(getCropProfit(CropType.CAULIFLOWER)).toBe(175 - 80); // 95
    });
  });

  describe('getGold', () => {
    it('returns player gold', () => {
      const player = createTestPlayer(123);
      expect(getGold(player)).toBe(123);
    });
  });

  describe('addGold', () => {
    it('adds gold to player', () => {
      const player = createTestPlayer(100);
      addGold(player, 50);
      expect(player.gold).toBe(150);
    });
  });

  describe('spendGold', () => {
    it('deducts gold when affordable', () => {
      const player = createTestPlayer(100);
      expect(spendGold(player, 30)).toBe(true);
      expect(player.gold).toBe(70);
    });

    it('returns false when insufficient', () => {
      const player = createTestPlayer(100);
      expect(spendGold(player, 150)).toBe(false);
      expect(player.gold).toBe(100);
    });
  });
});

import { CropType, CropStage, TileType, ItemType } from '../src/game/types';
import {
  createCrop,
  plantCrop,
  waterCrop,
  advanceCropDay,
  harvestCrop,
  getCropStage,
  isReadyToHarvest,
  getCropData,
  getDaysToMature,
  getCropSellPrice,
  getCropSeedCost,
} from '../src/game/Crop';
import { createTile } from '../src/game/Tile';

describe('Crop', () => {
  describe('createCrop', () => {
    it('creates crop with correct type', () => {
      const crop = createCrop(CropType.PARSNIP);
      expect(crop.type).toBe(CropType.PARSNIP);
    });

    it('starts at seed stage', () => {
      const crop = createCrop(CropType.POTATO);
      expect(crop.stage).toBe(CropStage.SEED);
    });

    it('starts with zero days grown', () => {
      const crop = createCrop(CropType.CAULIFLOWER);
      expect(crop.daysGrown).toBe(0);
    });

    it('starts not watered', () => {
      const crop = createCrop(CropType.PARSNIP);
      expect(crop.wateredToday).toBe(false);
    });
  });

  describe('plantCrop', () => {
    it('plants crop on tilled tile', () => {
      const tile = createTile(TileType.TILLED);
      const success = plantCrop(tile, CropType.PARSNIP);
      expect(success).toBe(true);
      expect(tile.crop).not.toBeNull();
      expect(tile.crop?.type).toBe(CropType.PARSNIP);
    });

    it('fails to plant on grass', () => {
      const tile = createTile(TileType.GRASS);
      const success = plantCrop(tile, CropType.PARSNIP);
      expect(success).toBe(false);
      expect(tile.crop).toBeNull();
    });

    it('fails to plant on tile with existing crop', () => {
      const tile = createTile(TileType.TILLED);
      plantCrop(tile, CropType.PARSNIP);
      const success = plantCrop(tile, CropType.POTATO);
      expect(success).toBe(false);
      expect(tile.crop?.type).toBe(CropType.PARSNIP);
    });
  });

  describe('waterCrop', () => {
    it('sets wateredToday to true', () => {
      const crop = createCrop(CropType.PARSNIP);
      waterCrop(crop);
      expect(crop.wateredToday).toBe(true);
    });
  });

  describe('advanceCropDay', () => {
    it('increases daysGrown when watered', () => {
      const crop = createCrop(CropType.PARSNIP);
      crop.wateredToday = true;
      advanceCropDay(crop);
      expect(crop.daysGrown).toBe(1);
    });

    it('does not increase daysGrown when not watered', () => {
      const crop = createCrop(CropType.PARSNIP);
      advanceCropDay(crop);
      expect(crop.daysGrown).toBe(0);
    });

    it('resets wateredToday flag', () => {
      const crop = createCrop(CropType.PARSNIP);
      crop.wateredToday = true;
      advanceCropDay(crop);
      expect(crop.wateredToday).toBe(false);
    });

    it('updates crop stage', () => {
      const crop = createCrop(CropType.PARSNIP); // 4 days to mature
      crop.wateredToday = true;
      crop.daysGrown = 3; // Will become 4 after advance
      advanceCropDay(crop);
      expect(crop.stage).toBe(CropStage.HARVEST);
    });
  });

  describe('harvestCrop', () => {
    it('harvests ready crop', () => {
      const tile = createTile(TileType.TILLED);
      plantCrop(tile, CropType.PARSNIP);
      tile.crop!.daysGrown = 4;
      tile.crop!.stage = CropStage.HARVEST;

      const item = harvestCrop(tile);
      expect(item).not.toBeNull();
      expect(item?.type).toBe(ItemType.CROP);
      expect(item?.subType).toBe(CropType.PARSNIP);
      expect(item?.quantity).toBe(1);
    });

    it('clears crop from tile', () => {
      const tile = createTile(TileType.TILLED);
      plantCrop(tile, CropType.PARSNIP);
      tile.crop!.daysGrown = 4;
      tile.crop!.stage = CropStage.HARVEST;

      harvestCrop(tile);
      expect(tile.crop).toBeNull();
    });

    it('keeps tile tilled after harvest', () => {
      const tile = createTile(TileType.TILLED);
      plantCrop(tile, CropType.PARSNIP);
      tile.crop!.daysGrown = 4;
      tile.crop!.stage = CropStage.HARVEST;

      harvestCrop(tile);
      expect(tile.type).toBe(TileType.TILLED);
    });

    it('returns null for non-ready crop', () => {
      const tile = createTile(TileType.TILLED);
      plantCrop(tile, CropType.PARSNIP);

      const item = harvestCrop(tile);
      expect(item).toBeNull();
      expect(tile.crop).not.toBeNull();
    });

    it('returns null for empty tile', () => {
      const tile = createTile(TileType.TILLED);
      const item = harvestCrop(tile);
      expect(item).toBeNull();
    });
  });

  describe('getCropStage', () => {
    it('returns SEED at 0%', () => {
      const crop = createCrop(CropType.PARSNIP);
      expect(getCropStage(crop)).toBe(CropStage.SEED);
    });

    it('returns SPROUT at 25%', () => {
      const crop = createCrop(CropType.PARSNIP);
      crop.daysGrown = 1; // 25% of 4 days
      expect(getCropStage(crop)).toBe(CropStage.SPROUT);
    });

    it('returns GROWING at 50%', () => {
      const crop = createCrop(CropType.PARSNIP);
      crop.daysGrown = 2; // 50% of 4 days
      expect(getCropStage(crop)).toBe(CropStage.GROWING);
    });

    it('returns MATURE at 75%', () => {
      const crop = createCrop(CropType.PARSNIP);
      crop.daysGrown = 3; // 75% of 4 days
      expect(getCropStage(crop)).toBe(CropStage.MATURE);
    });

    it('returns HARVEST at 100%', () => {
      const crop = createCrop(CropType.PARSNIP);
      crop.daysGrown = 4; // 100% of 4 days
      expect(getCropStage(crop)).toBe(CropStage.HARVEST);
    });
  });

  describe('isReadyToHarvest', () => {
    it('returns true for HARVEST stage', () => {
      const crop = createCrop(CropType.PARSNIP);
      crop.stage = CropStage.HARVEST;
      expect(isReadyToHarvest(crop)).toBe(true);
    });

    it('returns false for other stages', () => {
      const crop = createCrop(CropType.PARSNIP);
      crop.stage = CropStage.MATURE;
      expect(isReadyToHarvest(crop)).toBe(false);
    });
  });

  describe('getCropData', () => {
    it('returns parsnip data', () => {
      const data = getCropData(CropType.PARSNIP);
      expect(data.seedCost).toBe(20);
      expect(data.growthDays).toBe(4);
      expect(data.sellPrice).toBe(35);
    });

    it('returns potato data', () => {
      const data = getCropData(CropType.POTATO);
      expect(data.seedCost).toBe(50);
      expect(data.growthDays).toBe(6);
      expect(data.sellPrice).toBe(80);
    });

    it('returns cauliflower data', () => {
      const data = getCropData(CropType.CAULIFLOWER);
      expect(data.seedCost).toBe(80);
      expect(data.growthDays).toBe(12);
      expect(data.sellPrice).toBe(175);
    });
  });

  describe('getDaysToMature', () => {
    it('returns correct days for each crop', () => {
      expect(getDaysToMature(CropType.PARSNIP)).toBe(4);
      expect(getDaysToMature(CropType.POTATO)).toBe(6);
      expect(getDaysToMature(CropType.CAULIFLOWER)).toBe(12);
    });
  });

  describe('getCropSellPrice', () => {
    it('returns correct price for each crop', () => {
      expect(getCropSellPrice(CropType.PARSNIP)).toBe(35);
      expect(getCropSellPrice(CropType.POTATO)).toBe(80);
      expect(getCropSellPrice(CropType.CAULIFLOWER)).toBe(175);
    });
  });

  describe('getCropSeedCost', () => {
    it('returns correct cost for each crop', () => {
      expect(getCropSeedCost(CropType.PARSNIP)).toBe(20);
      expect(getCropSeedCost(CropType.POTATO)).toBe(50);
      expect(getCropSeedCost(CropType.CAULIFLOWER)).toBe(80);
    });
  });
});

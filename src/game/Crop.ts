import { Crop, CropType, CropStage, Tile, TileType, Item, ItemType } from './types';
import { CROP_DATA } from './constants';
import { canPlant } from './Tile';

export function createCrop(type: CropType): Crop {
  return {
    type,
    stage: CropStage.SEED,
    daysGrown: 0,
    wateredToday: false,
  };
}

export function plantCrop(tile: Tile, cropType: CropType): boolean {
  if (!canPlant(tile)) {
    return false;
  }
  tile.crop = createCrop(cropType);
  return true;
}

export function waterCrop(crop: Crop): void {
  crop.wateredToday = true;
}

export function advanceCropDay(crop: Crop): void {
  if (crop.wateredToday) {
    crop.daysGrown++;
    crop.stage = getCropStage(crop);
  }
  crop.wateredToday = false;
}

export function harvestCrop(tile: Tile): Item | null {
  if (!tile.crop || !isReadyToHarvest(tile.crop)) {
    return null;
  }
  const crop = tile.crop;
  tile.crop = null;
  tile.type = TileType.TILLED;
  return {
    type: ItemType.CROP,
    subType: crop.type,
    quantity: 1,
  };
}

export function getCropStage(crop: Crop): CropStage {
  const data = getCropData(crop.type);
  const percent = crop.daysGrown / data.growthDays;

  if (percent >= 1) {
    return CropStage.HARVEST;
  } else if (percent >= 0.75) {
    return CropStage.MATURE;
  } else if (percent >= 0.5) {
    return CropStage.GROWING;
  } else if (percent >= 0.25) {
    return CropStage.SPROUT;
  }
  return CropStage.SEED;
}

export function isReadyToHarvest(crop: Crop): boolean {
  return crop.stage === CropStage.HARVEST;
}

export function getCropData(type: CropType): {
  seedCost: number;
  growthDays: number;
  sellPrice: number;
} {
  return CROP_DATA[type];
}

export function getDaysToMature(type: CropType): number {
  return CROP_DATA[type].growthDays;
}

export function getCropSellPrice(type: CropType): number {
  return CROP_DATA[type].sellPrice;
}

export function getCropSeedCost(type: CropType): number {
  return CROP_DATA[type].seedCost;
}

import { Player, Item, ItemType, CropType } from './types';
import { CROP_DATA, STARTING_GOLD } from './constants';
import { addItem, removeItem, findItem, countItem } from './Inventory';

/**
 * Check if player can afford an amount.
 */
export function canAfford(player: Player, amount: number): boolean {
  return player.gold >= amount;
}

/**
 * Buy seeds of a crop type.
 * Returns true if successful, false if insufficient gold or inventory full.
 */
export function buySeeds(
  player: Player,
  cropType: CropType,
  quantity: number
): boolean {
  const data = CROP_DATA[cropType];
  if (!data) {
    return false;
  }

  const totalCost = data.seedCost * quantity;

  if (!canAfford(player, totalCost)) {
    return false;
  }

  const seedItem: Item = {
    type: ItemType.SEED,
    subType: cropType,
    quantity: quantity,
  };

  if (!addItem(player.inventory, seedItem)) {
    return false;
  }

  player.gold -= totalCost;
  return true;
}

/**
 * Get the total sell value of items in the shipping bin.
 */
export function getShippingValue(items: Item[]): number {
  let total = 0;
  for (const item of items) {
    if (item.type === ItemType.CROP) {
      const data = CROP_DATA[item.subType as CropType];
      if (data) {
        total += data.sellPrice * item.quantity;
      }
    }
    // Seeds and tools have no sell value via shipping bin
  }
  return total;
}

/**
 * Process the shipping bin - add gold to player and clear the bin.
 * Returns the gold earned.
 */
export function processShippingBin(
  player: Player,
  bin: Item[]
): { gold: number; itemsShipped: number } {
  const gold = getShippingValue(bin);
  let itemsShipped = 0;

  for (const item of bin) {
    itemsShipped += item.quantity;
  }

  player.gold += gold;

  // Clear the bin by removing all items
  bin.length = 0;

  return { gold, itemsShipped };
}

/**
 * Add an item to the shipping bin.
 * Stacks with existing items of same type.
 */
export function addToShippingBin(bin: Item[], item: Item): void {
  // Only crops can be shipped
  if (item.type !== ItemType.CROP) {
    return;
  }

  // Find existing item of same type
  const existing = bin.find(
    (i) => i.type === item.type && i.subType === item.subType
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    bin.push({ ...item });
  }
}

/**
 * Move an item from inventory to shipping bin.
 * Returns true if successful.
 */
export function shipItem(
  player: Player,
  bin: Item[],
  slotIndex: number,
  quantity: number = 1
): boolean {
  const removed = removeItem(player.inventory, slotIndex, quantity);
  if (!removed) {
    return false;
  }

  // Only crops can be shipped
  if (removed.type !== ItemType.CROP) {
    // Put it back
    addItem(player.inventory, removed);
    return false;
  }

  addToShippingBin(bin, removed);
  return true;
}

/**
 * Get the seed cost for a crop type.
 */
export function getSeedCost(cropType: CropType): number {
  const data = CROP_DATA[cropType];
  return data ? data.seedCost : 0;
}

/**
 * Get the sell price for a crop type.
 */
export function getSellPrice(cropType: CropType): number {
  const data = CROP_DATA[cropType];
  return data ? data.sellPrice : 0;
}

/**
 * Calculate profit for a crop type (sell price - seed cost).
 */
export function getCropProfit(cropType: CropType): number {
  return getSellPrice(cropType) - getSeedCost(cropType);
}

/**
 * Get player's current gold.
 */
export function getGold(player: Player): number {
  return player.gold;
}

/**
 * Add gold to player.
 */
export function addGold(player: Player, amount: number): void {
  player.gold += amount;
}

/**
 * Spend gold. Returns true if successful.
 */
export function spendGold(player: Player, amount: number): boolean {
  if (!canAfford(player, amount)) {
    return false;
  }
  player.gold -= amount;
  return true;
}

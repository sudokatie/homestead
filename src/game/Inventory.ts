import { InventorySlot, Item, ItemType, ToolType, CropType } from './types';
import { INVENTORY_SIZE, MAX_STACK, STARTING_PARSNIP_SEEDS } from './constants';

/**
 * Create an empty inventory with INVENTORY_SIZE slots.
 */
export function createInventory(): InventorySlot[] {
  const inventory: InventorySlot[] = [];
  for (let i = 0; i < INVENTORY_SIZE; i++) {
    inventory.push({ item: null });
  }
  return inventory;
}

/**
 * Create starting inventory with tools and parsnip seeds.
 * Slots 0-4: Tools (Hoe, Watering Can, Scythe, Axe, Pickaxe)
 * Slot 5: Parsnip seeds
 */
export function initializeStartingInventory(): InventorySlot[] {
  const inventory = createInventory();

  // Add tools (one each, non-stackable)
  const tools: ToolType[] = [
    ToolType.HOE,
    ToolType.WATERING_CAN,
    ToolType.SCYTHE,
    ToolType.AXE,
    ToolType.PICKAXE,
  ];

  for (let i = 0; i < tools.length; i++) {
    inventory[i].item = {
      type: ItemType.TOOL,
      subType: tools[i],
      quantity: 1,
    };
  }

  // Add starting parsnip seeds
  inventory[5].item = {
    type: ItemType.SEED,
    subType: CropType.PARSNIP,
    quantity: STARTING_PARSNIP_SEEDS,
  };

  return inventory;
}

/**
 * Check if an item can stack (tools cannot stack).
 */
export function canStack(item: Item): boolean {
  return item.type !== ItemType.TOOL;
}

/**
 * Add an item to inventory. Returns true if successful.
 * Stackable items will stack with existing items of the same type.
 */
export function addItem(inventory: InventorySlot[], item: Item): boolean {
  // For stackable items, try to stack with existing
  if (canStack(item)) {
    const existingIndex = findItem(inventory, item.type, item.subType);
    if (existingIndex !== -1) {
      const existingItem = inventory[existingIndex].item!;
      const newQuantity = existingItem.quantity + item.quantity;
      if (newQuantity <= MAX_STACK) {
        existingItem.quantity = newQuantity;
        return true;
      } else {
        // Fill existing stack, try to add remainder to new slot
        const overflow = newQuantity - MAX_STACK;
        existingItem.quantity = MAX_STACK;
        // Find empty slot for overflow
        const emptyIndex = findEmptySlot(inventory);
        if (emptyIndex !== -1) {
          inventory[emptyIndex].item = {
            type: item.type,
            subType: item.subType,
            quantity: overflow,
          };
          return true;
        }
        // Can't fit overflow, revert
        existingItem.quantity = existingItem.quantity - item.quantity + overflow;
        return false;
      }
    }
  }

  // Find empty slot
  const emptyIndex = findEmptySlot(inventory);
  if (emptyIndex === -1) {
    return false;
  }

  inventory[emptyIndex].item = { ...item };
  return true;
}

/**
 * Remove quantity of item from slot. Returns the removed item or null if failed.
 */
export function removeItem(
  inventory: InventorySlot[],
  slotIndex: number,
  quantity: number = 1
): Item | null {
  if (slotIndex < 0 || slotIndex >= inventory.length) {
    return null;
  }

  const slot = inventory[slotIndex];
  if (!slot.item) {
    return null;
  }

  if (slot.item.quantity < quantity) {
    return null;
  }

  const removed: Item = {
    type: slot.item.type,
    subType: slot.item.subType,
    quantity: quantity,
  };

  slot.item.quantity -= quantity;
  if (slot.item.quantity <= 0) {
    slot.item = null;
  }

  return removed;
}

/**
 * Get slot at index.
 */
export function getSlot(inventory: InventorySlot[], index: number): InventorySlot | null {
  if (index < 0 || index >= inventory.length) {
    return null;
  }
  return inventory[index];
}

/**
 * Find first slot containing item of given type and subType.
 * Returns slot index or -1 if not found.
 */
export function findItem(
  inventory: InventorySlot[],
  type: ItemType,
  subType: CropType | ToolType
): number {
  for (let i = 0; i < inventory.length; i++) {
    const item = inventory[i].item;
    if (item && item.type === type && item.subType === subType) {
      return i;
    }
  }
  return -1;
}

/**
 * Count total quantity of item type/subType across all slots.
 */
export function countItem(
  inventory: InventorySlot[],
  type: ItemType,
  subType: CropType | ToolType
): number {
  let total = 0;
  for (const slot of inventory) {
    if (slot.item && slot.item.type === type && slot.item.subType === subType) {
      total += slot.item.quantity;
    }
  }
  return total;
}

/**
 * Check if inventory has any empty slots.
 */
export function hasSpace(inventory: InventorySlot[]): boolean {
  return findEmptySlot(inventory) !== -1;
}

/**
 * Find first empty slot index. Returns -1 if none.
 */
export function findEmptySlot(inventory: InventorySlot[]): number {
  for (let i = 0; i < inventory.length; i++) {
    if (!inventory[i].item) {
      return i;
    }
  }
  return -1;
}

/**
 * Check if inventory is completely full.
 */
export function isFull(inventory: InventorySlot[]): boolean {
  return !hasSpace(inventory);
}

/**
 * Get the item in a slot (convenience).
 */
export function getItemInSlot(inventory: InventorySlot[], index: number): Item | null {
  const slot = getSlot(inventory, index);
  return slot ? slot.item : null;
}

/**
 * Swap two inventory slots.
 */
export function swapSlots(inventory: InventorySlot[], indexA: number, indexB: number): boolean {
  if (
    indexA < 0 ||
    indexA >= inventory.length ||
    indexB < 0 ||
    indexB >= inventory.length
  ) {
    return false;
  }

  const temp = inventory[indexA].item;
  inventory[indexA].item = inventory[indexB].item;
  inventory[indexB].item = temp;
  return true;
}

import {
  createInventory,
  initializeStartingInventory,
  addItem,
  removeItem,
  getSlot,
  findItem,
  countItem,
  hasSpace,
  findEmptySlot,
  isFull,
  getItemInSlot,
  swapSlots,
  canStack,
} from '../src/game/Inventory';
import { ItemType, ToolType, CropType, Item } from '../src/game/types';
import { INVENTORY_SIZE, MAX_STACK, STARTING_PARSNIP_SEEDS } from '../src/game/constants';

describe('Inventory', () => {
  describe('createInventory', () => {
    it('creates inventory with correct size', () => {
      const inventory = createInventory();
      expect(inventory.length).toBe(INVENTORY_SIZE);
    });

    it('creates all slots as empty', () => {
      const inventory = createInventory();
      for (const slot of inventory) {
        expect(slot.item).toBeNull();
      }
    });
  });

  describe('initializeStartingInventory', () => {
    it('creates inventory with 5 tools', () => {
      const inventory = initializeStartingInventory();
      const tools = [
        ToolType.HOE,
        ToolType.WATERING_CAN,
        ToolType.SCYTHE,
        ToolType.AXE,
        ToolType.PICKAXE,
      ];
      for (let i = 0; i < tools.length; i++) {
        expect(inventory[i].item).not.toBeNull();
        expect(inventory[i].item!.type).toBe(ItemType.TOOL);
        expect(inventory[i].item!.subType).toBe(tools[i]);
        expect(inventory[i].item!.quantity).toBe(1);
      }
    });

    it('creates inventory with parsnip seeds', () => {
      const inventory = initializeStartingInventory();
      expect(inventory[5].item).not.toBeNull();
      expect(inventory[5].item!.type).toBe(ItemType.SEED);
      expect(inventory[5].item!.subType).toBe(CropType.PARSNIP);
      expect(inventory[5].item!.quantity).toBe(STARTING_PARSNIP_SEEDS);
    });

    it('leaves remaining slots empty', () => {
      const inventory = initializeStartingInventory();
      for (let i = 6; i < INVENTORY_SIZE; i++) {
        expect(inventory[i].item).toBeNull();
      }
    });
  });

  describe('canStack', () => {
    it('returns false for tools', () => {
      const tool: Item = { type: ItemType.TOOL, subType: ToolType.HOE, quantity: 1 };
      expect(canStack(tool)).toBe(false);
    });

    it('returns true for seeds', () => {
      const seed: Item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 5 };
      expect(canStack(seed)).toBe(true);
    });

    it('returns true for crops', () => {
      const crop: Item = { type: ItemType.CROP, subType: CropType.POTATO, quantity: 10 };
      expect(canStack(crop)).toBe(true);
    });
  });

  describe('addItem', () => {
    it('adds item to empty slot', () => {
      const inventory = createInventory();
      const item: Item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 5 };
      expect(addItem(inventory, item)).toBe(true);
      expect(inventory[0].item).not.toBeNull();
      expect(inventory[0].item!.quantity).toBe(5);
    });

    it('stacks same item type', () => {
      const inventory = createInventory();
      inventory[0].item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 10 };
      const item: Item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 5 };
      expect(addItem(inventory, item)).toBe(true);
      expect(inventory[0].item!.quantity).toBe(15);
    });

    it('respects max stack limit', () => {
      const inventory = createInventory();
      inventory[0].item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: MAX_STACK - 5 };
      const item: Item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 10 };
      expect(addItem(inventory, item)).toBe(true);
      expect(inventory[0].item!.quantity).toBe(MAX_STACK);
      expect(inventory[1].item!.quantity).toBe(5);
    });

    it('returns false when inventory full', () => {
      const inventory = createInventory();
      // Fill all slots with tools (non-stackable)
      for (let i = 0; i < INVENTORY_SIZE; i++) {
        inventory[i].item = { type: ItemType.TOOL, subType: ToolType.HOE, quantity: 1 };
      }
      const item: Item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 5 };
      expect(addItem(inventory, item)).toBe(false);
    });

    it('does not stack different item types', () => {
      const inventory = createInventory();
      inventory[0].item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 10 };
      const item: Item = { type: ItemType.SEED, subType: CropType.POTATO, quantity: 5 };
      expect(addItem(inventory, item)).toBe(true);
      expect(inventory[0].item!.quantity).toBe(10); // Unchanged
      expect(inventory[1].item!.quantity).toBe(5); // New slot
    });

    it('does not stack tools', () => {
      const inventory = createInventory();
      inventory[0].item = { type: ItemType.TOOL, subType: ToolType.HOE, quantity: 1 };
      const item: Item = { type: ItemType.TOOL, subType: ToolType.HOE, quantity: 1 };
      expect(addItem(inventory, item)).toBe(true);
      expect(inventory[0].item!.quantity).toBe(1); // Unchanged
      expect(inventory[1].item!.quantity).toBe(1); // New slot
    });
  });

  describe('removeItem', () => {
    it('removes item from slot', () => {
      const inventory = createInventory();
      inventory[0].item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 10 };
      const removed = removeItem(inventory, 0, 5);
      expect(removed).not.toBeNull();
      expect(removed!.quantity).toBe(5);
      expect(inventory[0].item!.quantity).toBe(5);
    });

    it('clears slot when quantity reaches 0', () => {
      const inventory = createInventory();
      inventory[0].item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 5 };
      const removed = removeItem(inventory, 0, 5);
      expect(removed).not.toBeNull();
      expect(inventory[0].item).toBeNull();
    });

    it('returns null for empty slot', () => {
      const inventory = createInventory();
      expect(removeItem(inventory, 0, 1)).toBeNull();
    });

    it('returns null when quantity exceeds available', () => {
      const inventory = createInventory();
      inventory[0].item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 5 };
      expect(removeItem(inventory, 0, 10)).toBeNull();
      expect(inventory[0].item!.quantity).toBe(5); // Unchanged
    });

    it('returns null for invalid slot index', () => {
      const inventory = createInventory();
      expect(removeItem(inventory, -1, 1)).toBeNull();
      expect(removeItem(inventory, INVENTORY_SIZE, 1)).toBeNull();
    });
  });

  describe('getSlot', () => {
    it('returns slot at valid index', () => {
      const inventory = createInventory();
      inventory[3].item = { type: ItemType.CROP, subType: CropType.POTATO, quantity: 5 };
      const slot = getSlot(inventory, 3);
      expect(slot).not.toBeNull();
      expect(slot!.item!.quantity).toBe(5);
    });

    it('returns null for invalid index', () => {
      const inventory = createInventory();
      expect(getSlot(inventory, -1)).toBeNull();
      expect(getSlot(inventory, INVENTORY_SIZE)).toBeNull();
    });
  });

  describe('findItem', () => {
    it('finds item in inventory', () => {
      const inventory = createInventory();
      inventory[5].item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 10 };
      expect(findItem(inventory, ItemType.SEED, CropType.PARSNIP)).toBe(5);
    });

    it('returns -1 when item not found', () => {
      const inventory = createInventory();
      expect(findItem(inventory, ItemType.SEED, CropType.PARSNIP)).toBe(-1);
    });

    it('returns first matching slot', () => {
      const inventory = createInventory();
      inventory[2].item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 5 };
      inventory[7].item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 10 };
      expect(findItem(inventory, ItemType.SEED, CropType.PARSNIP)).toBe(2);
    });
  });

  describe('countItem', () => {
    it('counts item quantity across slots', () => {
      const inventory = createInventory();
      inventory[2].item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 5 };
      inventory[7].item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 10 };
      expect(countItem(inventory, ItemType.SEED, CropType.PARSNIP)).toBe(15);
    });

    it('returns 0 when item not found', () => {
      const inventory = createInventory();
      expect(countItem(inventory, ItemType.CROP, CropType.POTATO)).toBe(0);
    });
  });

  describe('hasSpace', () => {
    it('returns true when empty slots exist', () => {
      const inventory = createInventory();
      expect(hasSpace(inventory)).toBe(true);
    });

    it('returns false when all slots full', () => {
      const inventory = createInventory();
      for (let i = 0; i < INVENTORY_SIZE; i++) {
        inventory[i].item = { type: ItemType.TOOL, subType: ToolType.HOE, quantity: 1 };
      }
      expect(hasSpace(inventory)).toBe(false);
    });
  });

  describe('findEmptySlot', () => {
    it('finds first empty slot', () => {
      const inventory = createInventory();
      inventory[0].item = { type: ItemType.TOOL, subType: ToolType.HOE, quantity: 1 };
      inventory[1].item = { type: ItemType.TOOL, subType: ToolType.AXE, quantity: 1 };
      expect(findEmptySlot(inventory)).toBe(2);
    });

    it('returns -1 when all full', () => {
      const inventory = createInventory();
      for (let i = 0; i < INVENTORY_SIZE; i++) {
        inventory[i].item = { type: ItemType.TOOL, subType: ToolType.HOE, quantity: 1 };
      }
      expect(findEmptySlot(inventory)).toBe(-1);
    });
  });

  describe('isFull', () => {
    it('returns false for empty inventory', () => {
      const inventory = createInventory();
      expect(isFull(inventory)).toBe(false);
    });

    it('returns true when completely full', () => {
      const inventory = createInventory();
      for (let i = 0; i < INVENTORY_SIZE; i++) {
        inventory[i].item = { type: ItemType.TOOL, subType: ToolType.HOE, quantity: 1 };
      }
      expect(isFull(inventory)).toBe(true);
    });
  });

  describe('getItemInSlot', () => {
    it('returns item in slot', () => {
      const inventory = createInventory();
      inventory[3].item = { type: ItemType.CROP, subType: CropType.CAULIFLOWER, quantity: 7 };
      const item = getItemInSlot(inventory, 3);
      expect(item).not.toBeNull();
      expect(item!.subType).toBe(CropType.CAULIFLOWER);
    });

    it('returns null for empty slot', () => {
      const inventory = createInventory();
      expect(getItemInSlot(inventory, 0)).toBeNull();
    });

    it('returns null for invalid index', () => {
      const inventory = createInventory();
      expect(getItemInSlot(inventory, -1)).toBeNull();
    });
  });

  describe('swapSlots', () => {
    it('swaps two items', () => {
      const inventory = createInventory();
      inventory[0].item = { type: ItemType.TOOL, subType: ToolType.HOE, quantity: 1 };
      inventory[5].item = { type: ItemType.SEED, subType: CropType.PARSNIP, quantity: 10 };
      expect(swapSlots(inventory, 0, 5)).toBe(true);
      expect(inventory[0].item!.subType).toBe(CropType.PARSNIP);
      expect(inventory[5].item!.subType).toBe(ToolType.HOE);
    });

    it('swaps item with empty slot', () => {
      const inventory = createInventory();
      inventory[0].item = { type: ItemType.TOOL, subType: ToolType.HOE, quantity: 1 };
      expect(swapSlots(inventory, 0, 5)).toBe(true);
      expect(inventory[0].item).toBeNull();
      expect(inventory[5].item!.subType).toBe(ToolType.HOE);
    });

    it('returns false for invalid indices', () => {
      const inventory = createInventory();
      expect(swapSlots(inventory, -1, 5)).toBe(false);
      expect(swapSlots(inventory, 0, INVENTORY_SIZE)).toBe(false);
    });
  });
});

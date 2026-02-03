'use client';

import { InventorySlot, ItemType, ToolType, CropType } from '../game/types';

interface InventoryPanelProps {
  slots: InventorySlot[];
  selectedIndex: number;
  onClose: () => void;
  onSelectSlot: (index: number) => void;
}

const TOOL_NAMES: Record<ToolType, string> = {
  [ToolType.HOE]: 'Hoe',
  [ToolType.WATERING_CAN]: 'Watering Can',
  [ToolType.SCYTHE]: 'Scythe',
  [ToolType.AXE]: 'Axe',
  [ToolType.PICKAXE]: 'Pickaxe',
};

const CROP_NAMES: Record<CropType, string> = {
  [CropType.PARSNIP]: 'Parsnip',
  [CropType.POTATO]: 'Potato',
  [CropType.CAULIFLOWER]: 'Cauliflower',
};

function getItemName(slot: InventorySlot): string {
  if (!slot.item) return '';
  if (slot.item.type === ItemType.TOOL) {
    return TOOL_NAMES[slot.item.subType as ToolType];
  }
  if (slot.item.type === ItemType.SEED) {
    return `${CROP_NAMES[slot.item.subType as CropType]} Seeds`;
  }
  return CROP_NAMES[slot.item.subType as CropType];
}

export default function InventoryPanel({
  slots,
  selectedIndex,
  onClose,
  onSelectSlot,
}: InventoryPanelProps) {
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-amber-900 p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Inventory</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {slots.map((slot, index) => (
            <button
              key={index}
              onClick={() => onSelectSlot(index)}
              className={`w-16 h-16 border-2 rounded flex flex-col items-center justify-center
                ${index === selectedIndex ? 'border-yellow-400 bg-amber-700' : 'border-amber-600 bg-amber-800'}
                hover:bg-amber-700 transition-colors`}
            >
              {slot.item && (
                <>
                  <span className="text-xs text-white text-center">
                    {getItemName(slot).slice(0, 8)}
                  </span>
                  {slot.item.quantity > 1 && (
                    <span className="text-xs text-yellow-300">
                      x{slot.item.quantity}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-amber-200">
          Press I or ESC to close
        </p>
      </div>
    </div>
  );
}

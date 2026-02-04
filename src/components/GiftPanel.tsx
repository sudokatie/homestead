'use client';

import { InventorySlot, ItemType, CropType } from '../game/types';

interface GiftPanelProps {
  slots: InventorySlot[];
  onSelectGift: (slotIndex: number) => void;
  onCancel: () => void;
}

const CROP_NAMES: Record<CropType, string> = {
  [CropType.PARSNIP]: 'Parsnip',
  [CropType.POTATO]: 'Potato',
  [CropType.CAULIFLOWER]: 'Cauliflower',
};

export default function GiftPanel({ slots, onSelectGift, onCancel }: GiftPanelProps) {
  // Filter to only show crops (giftable items)
  const giftableSlots = slots
    .map((slot, index) => ({ slot, index }))
    .filter(({ slot }) => slot.item && slot.item.type === ItemType.CROP);

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-amber-900 p-6 rounded-lg shadow-xl border-2 border-amber-600 max-w-md">
        <h2 className="text-amber-400 font-bold text-xl mb-4">Select a Gift</h2>
        
        {giftableSlots.length === 0 ? (
          <p className="text-white mb-4">You don&apos;t have any crops to give.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {giftableSlots.map(({ slot, index }) => (
              <button
                key={index}
                onClick={() => onSelectGift(index)}
                className="bg-amber-800 hover:bg-amber-700 p-3 rounded border border-amber-600 transition-colors"
              >
                <div className="text-white text-sm">
                  {CROP_NAMES[slot.item!.subType as CropType]}
                </div>
                <div className="text-amber-300 text-xs">
                  x{slot.item!.quantity}
                </div>
              </button>
            ))}
          </div>
        )}
        
        <button
          onClick={onCancel}
          className="w-full bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

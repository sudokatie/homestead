'use client';

import { CropType } from '../game/types';
import { CROP_DATA } from '../game/constants';

interface ShopPanelProps {
  gold: number;
  onBuy: (cropType: CropType, quantity: number) => void;
  onClose: () => void;
}

const CROP_NAMES: Record<CropType, string> = {
  [CropType.PARSNIP]: 'Parsnip Seeds',
  [CropType.POTATO]: 'Potato Seeds',
  [CropType.CAULIFLOWER]: 'Cauliflower Seeds',
};

export default function ShopPanel({ gold, onBuy, onClose }: ShopPanelProps) {
  const cropTypes = Object.values(CropType).filter(
    (v) => typeof v === 'number'
  ) as CropType[];

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-green-900 p-6 rounded-lg shadow-xl min-w-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Pierre&apos;s Seeds</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-yellow-400 mb-4">Your Gold: {gold}g</p>

        <div className="flex flex-col gap-3">
          {cropTypes.map((cropType) => {
            const data = CROP_DATA[cropType];
            const canAfford = gold >= data.seedCost;

            return (
              <div
                key={cropType}
                className="flex justify-between items-center bg-green-800 p-3 rounded"
              >
                <div>
                  <span className="text-white font-semibold">
                    {CROP_NAMES[cropType]}
                  </span>
                  <span className="text-green-300 text-sm ml-2">
                    ({data.growthDays} days)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-yellow-300">{data.seedCost}g</span>
                  <button
                    onClick={() => onBuy(cropType, 1)}
                    disabled={!canAfford}
                    className={`px-3 py-1 rounded ${
                      canAfford
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Buy 1
                  </button>
                  <button
                    onClick={() => onBuy(cropType, 5)}
                    disabled={gold < data.seedCost * 5}
                    className={`px-3 py-1 rounded ${
                      gold >= data.seedCost * 5
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Buy 5
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-sm text-green-300">Press ESC to close</p>
      </div>
    </div>
  );
}

'use client';

import { ToolType } from '../game/types';

interface HUDProps {
  day: number;
  season: string;
  hour: number;
  minute: number;
  energy: number;
  maxEnergy: number;
  gold: number;
  selectedTool: ToolType;
}

const TOOL_NAMES: Record<ToolType, string> = {
  [ToolType.HOE]: 'Hoe',
  [ToolType.WATERING_CAN]: 'Watering Can',
  [ToolType.SCYTHE]: 'Scythe',
  [ToolType.AXE]: 'Axe',
  [ToolType.PICKAXE]: 'Pickaxe',
};

function formatTime(hour: number, minute: number): string {
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${ampm}`;
}

export default function HUD({
  day,
  season,
  hour,
  minute,
  energy,
  maxEnergy,
  gold,
  selectedTool,
}: HUDProps) {
  const energyPercent = Math.floor((energy / maxEnergy) * 100);
  const energyColor = energyPercent > 50 ? 'bg-green-500' : energyPercent > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="absolute top-0 left-0 right-0 bg-black/70 text-white p-3 flex justify-between items-center">
      {/* Date and Time */}
      <div className="flex gap-4">
        <span className="font-bold">{season} {day}</span>
        <span>{formatTime(hour, minute)}</span>
      </div>

      {/* Energy Bar */}
      <div className="flex items-center gap-2">
        <span className="text-sm">Energy</span>
        <div className="w-32 h-4 bg-gray-700 rounded overflow-hidden">
          <div
            className={`h-full ${energyColor} transition-all`}
            style={{ width: `${energyPercent}%` }}
          />
        </div>
        <span className="text-sm w-12">{energy}/{maxEnergy}</span>
      </div>

      {/* Gold */}
      <div className="flex items-center gap-2">
        <span className="text-yellow-400 font-bold">{gold}g</span>
      </div>

      {/* Selected Tool */}
      <div className="bg-amber-700 px-3 py-1 rounded">
        {TOOL_NAMES[selectedTool]}
      </div>
    </div>
  );
}

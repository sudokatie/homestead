'use client';

import { memo, useEffect, useState, useCallback } from 'react';

interface VirtualControlsProps {
  paused: boolean;
  selectedTool: number;
  onMove: (dx: number, dy: number) => void;
  onPause: () => void;
  onInteract: () => void;
  onInventory: () => void;
  onToolSelect: (index: number) => void;
}

const TOOLS = ['Hoe', 'Water', 'Seed', 'Axe', 'Pick'];

function VirtualControls({
  paused,
  selectedTool,
  onMove,
  onPause,
  onInteract,
  onInventory,
  onToolSelect,
}: VirtualControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // D-pad handler for continuous movement
  const handleDpadStart = useCallback((dx: number, dy: number) => {
    onMove(dx, dy);
  }, [onMove]);

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 flex justify-between items-end z-50 pointer-events-none">
      {/* Left: D-pad */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1">
        <div /> {/* Empty top-left */}
        <button
          onTouchStart={() => handleDpadStart(0, -1)}
          className="w-12 h-12 rounded-lg bg-gray-800/80 text-white text-xl
                     active:bg-gray-600 touch-manipulation flex items-center justify-center"
          aria-label="Move up"
        >
          ▲
        </button>
        <div /> {/* Empty top-right */}
        
        <button
          onTouchStart={() => handleDpadStart(-1, 0)}
          className="w-12 h-12 rounded-lg bg-gray-800/80 text-white text-xl
                     active:bg-gray-600 touch-manipulation flex items-center justify-center"
          aria-label="Move left"
        >
          ◄
        </button>
        <div className="w-12 h-12" /> {/* Center */}
        <button
          onTouchStart={() => handleDpadStart(1, 0)}
          className="w-12 h-12 rounded-lg bg-gray-800/80 text-white text-xl
                     active:bg-gray-600 touch-manipulation flex items-center justify-center"
          aria-label="Move right"
        >
          ►
        </button>
        
        <div /> {/* Empty bottom-left */}
        <button
          onTouchStart={() => handleDpadStart(0, 1)}
          className="w-12 h-12 rounded-lg bg-gray-800/80 text-white text-xl
                     active:bg-gray-600 touch-manipulation flex items-center justify-center"
          aria-label="Move down"
        >
          ▼
        </button>
        <div /> {/* Empty bottom-right */}
      </div>

      {/* Center: Tool selector */}
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        {showTools && (
          <div className="flex gap-1 bg-gray-900/80 p-2 rounded-lg">
            {TOOLS.map((tool, i) => (
              <button
                key={i}
                onClick={() => {
                  onToolSelect(i);
                  setShowTools(false);
                }}
                className={`px-2 py-1 rounded text-xs font-medium touch-manipulation
                  ${selectedTool === i 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-700 text-gray-200 active:bg-gray-500'}`}
              >
                {i + 1}:{tool}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowTools(!showTools)}
          className={`px-4 py-2 rounded-full text-white text-xs font-medium touch-manipulation
            ${showTools ? 'bg-yellow-700/80' : 'bg-gray-800/80 active:bg-gray-600'}`}
        >
          {TOOLS[selectedTool] || 'Tools'}
        </button>
      </div>

      {/* Right: Action buttons */}
      <div className="pointer-events-auto flex flex-col gap-2">
        <button
          onClick={onPause}
          className="w-12 h-12 rounded-full bg-blue-700/80 text-white text-sm
                     active:bg-blue-500 touch-manipulation"
          aria-label={paused ? 'Resume' : 'Pause'}
        >
          {paused ? '▶' : '⏸'}
        </button>
        
        <button
          onClick={onInteract}
          className="w-12 h-12 rounded-full bg-green-700/80 text-white text-xs font-bold
                     active:bg-green-500 touch-manipulation"
          aria-label="Use tool / Interact"
        >
          USE
        </button>
        
        <button
          onClick={onInventory}
          className="w-12 h-12 rounded-full bg-purple-700/80 text-white text-xs font-bold
                     active:bg-purple-500 touch-manipulation"
          aria-label="Inventory"
        >
          INV
        </button>
      </div>
    </div>
  );
}

export default memo(VirtualControls);

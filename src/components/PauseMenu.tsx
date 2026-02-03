'use client';

interface PauseMenuProps {
  onResume: () => void;
  onSave: () => void;
  onQuit: () => void;
}

export default function PauseMenu({ onResume, onSave, onQuit }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Paused</h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-semibold transition-colors"
          >
            Resume
          </button>
          <button
            onClick={onSave}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors"
          >
            Save Game
          </button>
          <button
            onClick={onQuit}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold transition-colors"
          >
            Quit to Title
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-400 text-center">
          Press ESC to resume
        </p>
      </div>
    </div>
  );
}

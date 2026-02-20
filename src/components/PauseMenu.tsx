'use client';

import { useState } from 'react';
import { Music } from '@/game/Music';
import { Sound } from '@/game/Sound';

interface PauseMenuProps {
  onResume: () => void;
  onSave: () => void;
  onQuit: () => void;
}

export default function PauseMenu({ onResume, onSave, onQuit }: PauseMenuProps) {
  const [musicVolume, setMusicVolume] = useState(Music.getVolume());
  const [soundVolume, setSoundVolume] = useState(Sound.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(Music.isEnabled());
  const [soundEnabled, setSoundEnabled] = useState(Sound.isEnabled());

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    Music.setVolume(vol);
  };

  const handleSoundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSoundVolume(vol);
    Sound.setVolume(vol);
  };

  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    Music.setEnabled(newState);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    Sound.setEnabled(newState);
  };

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

        {/* Audio Settings */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Audio</h3>
          
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-400">Music</label>
              <button
                onClick={toggleMusic}
                className={`px-2 py-0.5 rounded text-xs ${
                  musicEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}
              >
                {musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={handleMusicVolumeChange}
              disabled={!musicEnabled}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-400">Sound</label>
              <button
                onClick={toggleSound}
                className={`px-2 py-0.5 rounded text-xs ${
                  soundEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={soundVolume}
              onChange={handleSoundVolumeChange}
              disabled={!soundEnabled}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50"
            />
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-400 text-center">
          Press ESC to resume
        </p>
      </div>
    </div>
  );
}

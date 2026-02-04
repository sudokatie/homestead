'use client';

interface TitleScreenProps {
  onStart: () => void;
  onLoad?: () => void;
  hasExistingSave: boolean;
}

export default function TitleScreen({ onStart, onLoad, hasExistingSave }: TitleScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-sky-400 to-green-600 text-white">
      <h1 className="text-6xl font-bold mb-4 text-shadow">Homestead</h1>
      <p className="text-xl mb-8 opacity-80">A farming life awaits...</p>
      
      <div className="flex flex-col gap-4">
        <button
          onClick={onStart}
          className="px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg text-xl font-semibold transition-colors"
        >
          New Game
        </button>
        
        {hasExistingSave && onLoad && (
          <button
            onClick={onLoad}
            className="px-8 py-3 bg-green-700 hover:bg-green-600 rounded-lg text-xl font-semibold transition-colors"
          >
            Continue
          </button>
        )}
      </div>
      
      <div className="mt-12 text-sm opacity-60">
        <p>WASD or Arrow keys to move</p>
        <p>1-5 to select tools</p>
        <p>Space to interact (talk, harvest, sleep)</p>
        <p>Click to use tool on adjacent tile</p>
      </div>
    </div>
  );
}

'use client';

interface EndScreenProps {
  gold: number;
  cropsGrown: number;
  friendship: number;
  totalScore: number;
  onRestart: () => void;
}

export default function EndScreen({
  gold,
  cropsGrown,
  friendship,
  totalScore,
  onRestart,
}: EndScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-amber-800 to-green-900 text-white">
      <h1 className="text-5xl font-bold mb-2">Spring Has Ended!</h1>
      <p className="text-xl mb-2 opacity-80">Thanks for playing!</p>
      <p className="text-lg mb-8 opacity-60">Here&apos;s how your farm did...</p>

      <div className="bg-black/30 p-8 rounded-lg mb-8 min-w-[300px]">
        <div className="flex flex-col gap-4 text-lg">
          <div className="flex justify-between">
            <span>Gold Earned:</span>
            <span className="text-yellow-400 font-bold">{gold}g</span>
          </div>
          <div className="flex justify-between">
            <span>Crops Planted:</span>
            <span className="text-green-400 font-bold">{cropsGrown}</span>
          </div>
          <div className="flex justify-between">
            <span>Friendship Points:</span>
            <span className="text-pink-400 font-bold">{friendship}</span>
          </div>
          <hr className="border-white/30" />
          <div className="flex justify-between text-xl">
            <span>Total Score:</span>
            <span className="text-amber-300 font-bold">{totalScore}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg text-xl font-semibold transition-colors"
      >
        Play Again
      </button>
    </div>
  );
}

'use client';

interface DialogBoxProps {
  npcName: string;
  text: string;
  onClose: () => void;
  onGift?: () => void;
  showGiftButton?: boolean;
}

export default function DialogBox({ 
  npcName, 
  text, 
  onClose, 
  onGift,
  showGiftButton = false 
}: DialogBoxProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <div className="bg-amber-900/95 p-4 rounded-lg shadow-xl border-2 border-amber-600">
        <div className="text-amber-400 font-bold mb-2">{npcName}</div>
        <p className="text-white text-lg">{text}</p>
        
        <div className="flex gap-4 mt-4">
          {showGiftButton && onGift && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGift();
              }}
              className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded transition-colors"
            >
              Give Gift
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
        
        <p className="text-amber-300 text-sm mt-2 opacity-70">
          Press Space to close
        </p>
      </div>
    </div>
  );
}

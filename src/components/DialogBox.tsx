'use client';

interface DialogBoxProps {
  npcName: string;
  text: string;
  onClose: () => void;
}

export default function DialogBox({ npcName, text, onClose }: DialogBoxProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4" onClick={onClose}>
      <div className="bg-amber-900/95 p-4 rounded-lg shadow-xl border-2 border-amber-600 cursor-pointer">
        <div className="text-amber-400 font-bold mb-2">{npcName}</div>
        <p className="text-white text-lg">{text}</p>
        <p className="text-amber-300 text-sm mt-2 opacity-70">
          Click or press E to continue...
        </p>
      </div>
    </div>
  );
}

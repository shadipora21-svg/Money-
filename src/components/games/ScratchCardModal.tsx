import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface ScratchCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scratchesLeft: number;
  onRewardClaimed: (coins: number, cash: number, sourceName: string) => void;
  onUseScratch: () => void;
}

interface PrizeTier {
  name: string;
  symbols: [string, string, string];
  coins: number;
  cash: number;
}

const PRIZE_TIERS: PrizeTier[] = [
  { name: 'Diamond Jackpot', symbols: ['💎', '💎', '💎'], coins: 500, cash: 0.50 },
  { name: 'Gold Coin Trio', symbols: ['🪙', '🪙', '🪙'], coins: 350, cash: 0.35 },
  { name: 'Cash Bag Match', symbols: ['💰', '💰', '💰'], coins: 250, cash: 0.25 },
  { name: 'Lucky Stars', symbols: ['⭐', '⭐', '⭐'], coins: 150, cash: 0.15 },
  { name: 'Mystery Gift', symbols: ['🎁', '🎁', '🎁'], coins: 100, cash: 0.10 },
];

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({
  isOpen,
  onClose,
  scratchesLeft,
  onRewardClaimed,
  onUseScratch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState<boolean>(false);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [currentPrize, setCurrentPrize] = useState<PrizeTier>(PRIZE_TIERS[2]);
  const [scratchPercent, setScratchPercent] = useState<number>(0);
  const [cardActive, setCardActive] = useState<boolean>(false);

  // Pick prize and prepare canvas when opened
  useEffect(() => {
    if (isOpen) {
      prepareNewCard();
    }
  }, [isOpen]);

  const prepareNewCard = () => {
    // Weighted selection
    const rand = Math.random();
    let selected: PrizeTier;
    if (rand < 0.1) selected = PRIZE_TIERS[0]; // 10% jackpot
    else if (rand < 0.25) selected = PRIZE_TIERS[1];
    else if (rand < 0.5) selected = PRIZE_TIERS[2];
    else if (rand < 0.8) selected = PRIZE_TIERS[3];
    else selected = PRIZE_TIERS[4];

    setCurrentPrize(selected);
    setRevealed(false);
    setScratchPercent(0);
    setCardActive(true);

    setTimeout(() => {
      drawScratchCover();
    }, 50);
  };

  const drawScratchCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    // Premium gold/silver textured gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#D97706');
    grad.addColorStop(0.3, '#FBBF24');
    grad.addColorStop(0.5, '#F59E0B');
    grad.addColorStop(0.7, '#FEF08A');
    grad.addColorStop(1, '#B45309');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Decorative pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < w; i += 20) {
      for (let j = 0; j < h; j += 20) {
        ctx.beginPath();
        ctx.arc(i + 10, j + 10, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Text instructions
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH WITH FINGER / MOUSE ✨', w / 2, h / 2 - 8);

    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Match 3 symbols to win instant coins!', w / 2, h / 2 + 16);
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentCount = 0;
      const totalPixels = pixels.length / 4;

      // Sample every 16th pixel for high performance
      for (let i = 3; i < pixels.length; i += 64) {
        if (pixels[i] === 0) {
          transparentCount++;
        }
      }

      const percent = Math.round((transparentCount / (totalPixels / 16)) * 100);
      setScratchPercent(percent);

      if (percent > 45 && !revealed) {
        finishReveal();
      }
    } catch {
      // ignore
    }
  };

  const finishReveal = () => {
    if (revealed) return;
    setRevealed(true);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    sounds.playWin();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#3B82F6'],
    });

    onUseScratch();
    onRewardClaimed(
      currentPrize.coins,
      currentPrize.cash,
      `Scratch Win: ${currentPrize.name}`
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (revealed || scratchesLeft <= 0) return;
    setIsScratching(true);
    scratch(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratching || revealed) return;
    scratch(e);
  };

  const handlePointerUp = () => {
    setIsScratching(false);
    checkScratchPercentage();
  };

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    sounds.playTap();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/70 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            SCRATCH & WIN
          </div>
          <h2 className="text-2xl font-black text-white">Diamond Scratcher</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Cards available today:{' '}
            <span className="font-bold text-amber-400 text-base">{scratchesLeft}</span>
          </p>
        </div>

        {/* Scratch Card Outer Wrapper */}
        <div className="w-full relative bg-slate-800/90 border-2 border-amber-400/50 rounded-2xl p-4 shadow-xl overflow-hidden select-none">
          {/* Top card brand header */}
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-700">
            <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">
              GOLDEN LOTTO TICKET
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              PRIZE: UP TO +500 🪙
            </span>
          </div>

          {/* Hidden Content Area & Overlay Canvas */}
          <div className="relative w-full h-48 bg-gradient-to-b from-slate-950 to-slate-900 rounded-xl border border-slate-700 flex flex-col items-center justify-center overflow-hidden">
            {/* Prize Behind */}
            <div className="w-full flex flex-col items-center justify-center p-4">
              <div className="flex items-center justify-center gap-4 text-4xl mb-2">
                {currentPrize.symbols.map((sym, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 rounded-xl bg-slate-800 border border-amber-500/40 flex items-center justify-center shadow-inner animate-bounce"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    {sym}
                  </div>
                ))}
              </div>

              <div className="text-center mt-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {currentPrize.name}
                </span>
                <p className="text-2xl font-black text-emerald-400">
                  +{currentPrize.coins} COINS (+${currentPrize.cash.toFixed(2)})
                </p>
              </div>
            </div>

            {/* Canvas Covering Layer */}
            {!revealed && (
              <canvas
                ref={canvasRef}
                width={360}
                height={192}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none rounded-xl"
              />
            )}
          </div>

          {/* Scratch Progress Bar */}
          {!revealed && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Scratched</span>
                <span className="font-semibold text-amber-400">{scratchPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-150"
                  style={{ width: `${Math.min(scratchPercent * 2, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Quick Reveal Button if having trouble */}
          {!revealed && scratchesLeft > 0 && (
            <button
              onClick={finishReveal}
              className="mt-3 w-full py-1.5 text-xs text-slate-400 hover:text-amber-300 transition underline text-center"
            >
              Click here to auto-reveal scratcher
            </button>
          )}
        </div>

        {/* Footer info or Play Again */}
        <div className="w-full mt-4 flex flex-col gap-2">
          {revealed ? (
            <button
              onClick={prepareNewCard}
              disabled={scratchesLeft <= 0}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                scratchesLeft > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Scratch Another Card ({scratchesLeft} left)
            </button>
          ) : (
            <p className="text-xs text-center text-slate-400">
              Drag across the card to scratch off the gold foil and collect your reward.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

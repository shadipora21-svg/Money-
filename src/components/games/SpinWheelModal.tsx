import React, { useState, useRef, useEffect } from 'react';
import { X, Disc, Sparkles, Trophy, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  spinsLeft: number;
  onRewardClaimed: (coins: number, cash: number, sourceName: string) => void;
  onUseSpin: () => void;
}

interface WheelSegment {
  label: string;
  coins: number;
  cash: number;
  color: string;
  textColor: string;
}

const SEGMENTS: WheelSegment[] = [
  { label: '50 🪙', coins: 50, cash: 0.05, color: '#4F46E5', textColor: '#FFFFFF' },
  { label: '200 🪙', coins: 200, cash: 0.20, color: '#059669', textColor: '#FFFFFF' },
  { label: '75 🪙', coins: 75, cash: 0.075, color: '#D97706', textColor: '#FFFFFF' },
  { label: '💎 500', coins: 500, cash: 0.50, color: '#DC2626', textColor: '#FFFFFF' },
  { label: '100 🪙', coins: 100, cash: 0.10, color: '#2563EB', textColor: '#FFFFFF' },
  { label: '25 🪙', coins: 25, cash: 0.025, color: '#7C3AED', textColor: '#FFFFFF' },
  { label: '300 🪙', coins: 300, cash: 0.30, color: '#10B981', textColor: '#FFFFFF' },
  { label: '150 🪙', coins: 150, cash: 0.15, color: '#EA580C', textColor: '#FFFFFF' },
];

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({
  isOpen,
  onClose,
  spinsLeft,
  onRewardClaimed,
  onUseSpin,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wonPrize, setWonPrize] = useState<WheelSegment | null>(null);
  const lastTickAngle = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setWonPrize(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning || spinsLeft <= 0) return;

    sounds.playTap();
    onUseSpin();
    setIsSpinning(true);
    setWonPrize(null);

    // Pick winning segment
    const winningIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length;
    // Calculate final rotation so the winning segment aligns at top (pointer at 270 deg or top)
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full rotations
    // The pointer is at the very top (90 deg in standard polar, 270 deg or top 0)
    // In CSS rotation, segment 0 starts at angle 0.
    const targetAngle = 360 - (winningIndex * segmentAngle + segmentAngle / 2);
    const newTotalRotation = rotation + (extraSpins * 360) + (targetAngle - (rotation % 360));

    // Audio ticks during spin
    const spinDuration = 4000;
    const startTime = Date.now();
    lastTickAngle.current = rotation;

    const tickInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= spinDuration) {
        clearInterval(tickInterval);
      } else {
        sounds.playTick();
      }
    }, 120);

    setRotation(newTotalRotation);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const prize = SEGMENTS[winningIndex];
      setWonPrize(prize);
      sounds.playWin();

      // Trigger Confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
      });

      // Claim reward
      onRewardClaimed(prize.coins, prize.cash, `Daily Spin: ${prize.label}`);
    }, spinDuration + 200);
  };

  const segmentAngle = 360 / SEGMENTS.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/70 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            LUCKY REWARDS WHEEL
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Spin & Win Coins
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Spins remaining today:{' '}
            <span className="font-bold text-amber-400 text-base">{spinsLeft}</span>
          </p>
        </div>

        {/* The Wheel Container */}
        <div className="relative w-72 h-72 my-2 flex items-center justify-center select-none">
          {/* Top Indicator Arrow */}
          <div className="absolute -top-3 z-30 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[20px] border-t-amber-400 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"></div>
          </div>

          {/* Outer Glowing Border */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.3)] pointer-events-none"></div>

          {/* Rotating SVG Wheel */}
          <div
            className="w-full h-full rounded-full overflow-hidden transition-transform ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? '4s' : '0s',
              transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform rotate-[-90deg]">
              {SEGMENTS.map((seg, i) => {
                const startAngle = i * segmentAngle;
                const endAngle = startAngle + segmentAngle;
                const radStart = (startAngle * Math.PI) / 180;
                const radEnd = (endAngle * Math.PI) / 180;
                const x1 = 50 + 50 * Math.cos(radStart);
                const y1 = 50 + 50 * Math.sin(radStart);
                const x2 = 50 + 50 * Math.cos(radEnd);
                const y2 = 50 + 50 * Math.sin(radEnd);

                const midAngle = startAngle + segmentAngle / 2;
                const radMid = (midAngle * Math.PI) / 180;
                const textX = 50 + 32 * Math.cos(radMid);
                const textY = 50 + 32 * Math.sin(radMid);

                return (
                  <g key={i}>
                    <path
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                      fill={seg.color}
                      stroke="#1e293b"
                      strokeWidth="0.8"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill={seg.textColor}
                      fontSize="5"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Hub */}
          <div className="absolute z-20 w-16 h-16 rounded-full bg-slate-900 border-4 border-amber-400 shadow-xl flex items-center justify-center">
            <Disc className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Won Prize Banner */}
        {wonPrize && !isSpinning && (
          <div className="w-full mt-3 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center animate-in zoom-in-95 duration-200">
            <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
              You Won!
            </p>
            <p className="text-xl font-black text-emerald-400">
              +{wonPrize.coins} Coins (+${wonPrize.cash.toFixed(2)})
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="w-full mt-4 flex flex-col gap-2">
          <button
            onClick={handleSpin}
            disabled={isSpinning || spinsLeft <= 0}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] ${
              spinsLeft > 0
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isSpinning ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                Spinning Wheel...
              </>
            ) : spinsLeft > 0 ? (
              <>
                <Sparkles className="w-5 h-5" />
                SPIN FOR FREE ({spinsLeft} left)
              </>
            ) : (
              <>No Spins Left Today</>
            )}
          </button>

          {spinsLeft <= 0 && (
            <p className="text-xs text-center text-slate-400 mt-1">
              Complete other mini-games or micro-tasks to unlock extra spins!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

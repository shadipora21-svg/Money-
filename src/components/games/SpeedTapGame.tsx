import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Clock, Trophy, Flame, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface SpeedTapGameProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (coins: number, cash: number, sourceName: string) => void;
}

type CellType = 'empty' | 'coin' | 'gem' | 'star' | 'bomb';

interface BoardCell {
  id: number;
  type: CellType;
  expiresAt: number;
}

export const SpeedTapGame: React.FC<SpeedTapGameProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [board, setBoard] = useState<BoardCell[]>(
    Array.from({ length: 9 }, (_, i) => ({ id: i, type: 'empty', expiresAt: 0 }))
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanupTimers();
      setGameState('ready');
    }
  }, [isOpen]);

  const cleanupTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
  };

  const startGame = () => {
    sounds.playTap();
    cleanupTimers();
    setScore(0);
    setCombo(0);
    setTimeLeft(15);
    setGameState('playing');

    // Countdown interval
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Spawning interval for 3x3 board
    spawnRef.current = setInterval(() => {
      setBoard((prev) => {
        const now = Date.now();
        // Clear expired
        const newBoard = prev.map((c) =>
          c.expiresAt < now ? { ...c, type: 'empty' as CellType } : c
        );

        // Pick empty cells to spawn
        const emptyIndices = newBoard
          .map((c, i) => (c.type === 'empty' ? i : -1))
          .filter((i) => i !== -1);

        if (emptyIndices.length > 0) {
          // Spawn 1 to 2 items
          const spawnCount = Math.min(emptyIndices.length, Math.random() > 0.4 ? 2 : 1);
          for (let s = 0; s < spawnCount; s++) {
            const randomIndex =
              emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            const rand = Math.random();
            let newType: CellType = 'coin';

            if (rand < 0.15) newType = 'bomb'; // 15% bomb
            else if (rand < 0.3) newType = 'gem'; // 15% gem
            else if (rand < 0.4) newType = 'star'; // 10% star
            else newType = 'coin'; // 60% coin

            newBoard[randomIndex] = {
              id: randomIndex,
              type: newType,
              expiresAt: now + 1200 + Math.random() * 600,
            };
          }
        }
        return newBoard;
      });
    }, 380);
  };

  const endGame = () => {
    cleanupTimers();
    setGameState('ended');
    sounds.playWin();

    // Reward: Score converted to coins! Minimum 100 guaranteed participation
    const earnedCoins = Math.max(100, score);
    const earnedCash = Number((earnedCoins / 1000).toFixed(2));

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    onRewardClaimed(earnedCoins, earnedCash, `Coin Rush (Score: ${score})`);
  };

  const handleCellClick = (index: number) => {
    if (gameState !== 'playing') return;

    const cell = board[index];
    if (cell.type === 'empty') return;

    if (cell.type === 'bomb') {
      sounds.playBuzz();
      setScore((s) => Math.max(0, s - 30));
      setCombo(0);
    } else {
      sounds.playCoin();
      let pts = 15;
      if (cell.type === 'gem') pts = 30;
      if (cell.type === 'star') pts = 50;

      const multiplier = combo >= 10 ? 2 : combo >= 5 ? 1.5 : 1;
      setScore((s) => s + Math.round(pts * multiplier));
      setCombo((c) => c + 1);
    }

    // Clear clicked cell
    setBoard((prev) =>
      prev.map((c, i) => (i === index ? { ...c, type: 'empty' } : c))
    );
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
            <Zap className="w-3.5 h-3.5" />
            ARCADE REACTION GAME
          </div>
          <h2 className="text-2xl font-black text-white">Coin Rush Tap Attack</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tap coins & gems fast! Avoid bombs (-30 pts). 100 pts = $0.10.
          </p>
        </div>

        {/* Game HUD Bar */}
        <div className="w-full flex items-center justify-between bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 mb-4 text-sm font-semibold">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Clock className="w-4 h-4" />
            <span>Time: <strong className="text-white text-base">{timeLeft}s</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400">
            <Trophy className="w-4 h-4" />
            <span>Score: <strong className="text-white text-base">{score}</strong></span>
          </div>

          <div className="flex items-center gap-1 text-rose-400">
            <Flame className="w-4 h-4" />
            <span>Streak: <strong className="text-white">{combo}x</strong></span>
          </div>
        </div>

        {/* Board Arena */}
        {gameState === 'playing' ? (
          <div className="w-full grid grid-cols-3 gap-3 aspect-square max-w-[320px] my-1">
            {board.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                className={`relative rounded-2xl border flex items-center justify-center transition active:scale-90 select-none shadow-md ${
                  cell.type === 'empty'
                    ? 'bg-slate-800/50 border-slate-700/50'
                    : cell.type === 'coin'
                    ? 'bg-amber-500/20 border-amber-500/80 hover:bg-amber-500/30'
                    : cell.type === 'gem'
                    ? 'bg-cyan-500/20 border-cyan-500/80 hover:bg-cyan-500/30'
                    : cell.type === 'star'
                    ? 'bg-purple-500/20 border-purple-500/80 hover:bg-purple-500/30 animate-pulse'
                    : 'bg-rose-500/20 border-rose-500/80 hover:bg-rose-500/30'
                }`}
              >
                {cell.type === 'coin' && (
                  <span className="text-4xl filter drop-shadow animate-in zoom-in-50 duration-100">
                    🪙
                  </span>
                )}
                {cell.type === 'gem' && (
                  <span className="text-4xl filter drop-shadow animate-in zoom-in-50 duration-100">
                    💎
                  </span>
                )}
                {cell.type === 'star' && (
                  <span className="text-4xl filter drop-shadow animate-in zoom-in-50 duration-100">
                    ⭐
                  </span>
                )}
                {cell.type === 'bomb' && (
                  <span className="text-4xl filter drop-shadow animate-in zoom-in-50 duration-100">
                    💣
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : gameState === 'ready' ? (
          <div className="w-full flex flex-col items-center justify-center py-10 px-4 bg-slate-800/40 rounded-2xl border border-slate-800 text-center">
            <div className="text-5xl mb-3">⚡🪙</div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to Tap & Earn?</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              You will have 15 seconds to tap as many coins (🪙 +15) and gems (💎 +30) as you can.
              Don't tap the red bombs (💣)!
            </p>
            <button
              onClick={startGame}
              className="w-full max-w-xs py-3.5 px-6 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition active:scale-95"
            >
              START 15s SPRINT
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-6 px-4 bg-slate-800/60 rounded-2xl border border-emerald-500/40 text-center animate-in zoom-in-95 duration-200">
            <div className="text-5xl mb-2">🏆</div>
            <h3 className="text-2xl font-black text-white mb-1">Time's Up!</h3>
            <p className="text-sm text-slate-300">
              Final Score: <strong className="text-amber-400">{score} pts</strong>
            </p>

            <div className="my-4 py-3 px-6 bg-emerald-500/20 border border-emerald-500/40 rounded-xl">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                Total Reward Earned
              </span>
              <span className="text-2xl font-black text-emerald-400">
                +{Math.max(100, score)} Coins (+${(Math.max(100, score) / 1000).toFixed(2)})
              </span>
            </div>

            <div className="flex gap-3 w-full max-w-xs mt-2">
              <button
                onClick={startGame}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg transition"
              >
                Collect & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

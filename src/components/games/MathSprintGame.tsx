import React, { useState, useEffect, useRef } from 'react';
import { X, Calculator, Clock, Trophy, Flame, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface MathSprintGameProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (coins: number, cash: number, sourceName: string) => void;
}

interface Question {
  text: string;
  answer: number;
  options: number[];
}

export const MathSprintGame: React.FC<MathSprintGameProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState('ready');
    }
  }, [isOpen]);

  const generateQuestion = (): Question => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = 0;
    let b = 0;
    let ans = 0;

    if (op === '+') {
      a = Math.floor(Math.random() * 40) + 10;
      b = Math.floor(Math.random() * 40) + 5;
      ans = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 60) + 20;
      b = Math.floor(Math.random() * a);
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 10) + 3;
      b = Math.floor(Math.random() * 9) + 2;
      ans = a * b;
    }

    // Generate 3 wrong options
    const optionsSet = new Set<number>([ans]);
    while (optionsSet.size < 4) {
      const offset = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const wrong = ans + offset;
      if (wrong >= 0) optionsSet.add(wrong);
    }

    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
    return {
      text: `${a} ${op === '*' ? '×' : op} ${b}`,
      answer: ans,
      options,
    };
  };

  const startGame = () => {
    sounds.playTap();
    setScore(0);
    setCombo(0);
    setTimeLeft(30);
    setGameState('playing');
    setCurrentQ(generateQuestion());

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('ended');
    sounds.playWin();

    const earnedCoins = Math.max(120, score);
    const earnedCash = Number((earnedCoins / 1000).toFixed(2));

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
    });

    onRewardClaimed(earnedCoins, earnedCash, `Math Sprint (Score: ${score})`);
  };

  const handleSelectOption = (chosen: number) => {
    if (!currentQ || gameState !== 'playing') return;

    if (chosen === currentQ.answer) {
      sounds.playCoin();
      const mult = combo >= 5 ? 2 : combo >= 2 ? 1.5 : 1;
      setScore((s) => s + Math.round(25 * mult));
      setCombo((c) => c + 1);
    } else {
      sounds.playBuzz();
      setCombo(0);
    }

    setCurrentQ(generateQuestion());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/70 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col items-center">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Calculator className="w-3.5 h-3.5" />
            RAPID CALC TASK
          </div>
          <h2 className="text-2xl font-black text-white">Math Sprint Blitz</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Solve fast equations in 30s. Build streaks for 2X multiplier!
          </p>
        </div>

        {/* HUD */}
        <div className="w-full flex items-center justify-between bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 mb-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Clock className="w-4 h-4" />
            <span>Time: <strong className="text-white text-sm">{timeLeft}s</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Trophy className="w-4 h-4" />
            <span>Score: <strong className="text-white text-sm">{score}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <Flame className="w-4 h-4" />
            <span>Streak: <strong className="text-white text-sm">{combo}x</strong></span>
          </div>
        </div>

        {gameState === 'playing' && currentQ ? (
          <div className="w-full flex flex-col items-center">
            {/* Equation Display */}
            <div className="w-full py-8 px-4 bg-slate-800/60 border border-slate-700 rounded-2xl text-center mb-4">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-wider">
                {currentQ.text} = ?
              </span>
            </div>

            {/* Multiple Choice Options */}
            <div className="w-full grid grid-cols-2 gap-3">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectOption(opt)}
                  className="py-4 px-4 bg-slate-800 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500 text-white rounded-xl text-xl font-bold transition active:scale-95 shadow"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : gameState === 'ready' ? (
          <div className="w-full flex flex-col items-center py-8 px-4 bg-slate-800/40 rounded-2xl border border-slate-800 text-center">
            <div className="text-5xl mb-3">🧮⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">30s Mental Math Challenge</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              Answer quick arithmetic questions. Each correct answer awards +25 to +50 coins!
            </p>
            <button
              onClick={startGame}
              className="w-full max-w-xs py-3.5 px-6 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 shadow-lg shadow-emerald-500/25 transition active:scale-95"
            >
              START MATH SPRINT
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center py-6 px-4 bg-slate-800/60 rounded-2xl border border-emerald-500/40 text-center animate-in zoom-in-95 duration-200">
            <div className="text-5xl mb-2">🏅</div>
            <h3 className="text-2xl font-black text-white mb-1">Challenge Complete!</h3>
            <p className="text-sm text-slate-300">
              Final Math Score: <strong className="text-emerald-400">{score} pts</strong>
            </p>

            <div className="my-4 py-3 px-6 bg-emerald-500/20 border border-emerald-500/40 rounded-xl">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                Coins Added to Wallet
              </span>
              <span className="text-2xl font-black text-emerald-400">
                +{Math.max(120, score)} Coins (+${(Math.max(120, score) / 1000).toFixed(2)})
              </span>
            </div>

            <div className="flex gap-3 w-full max-w-xs mt-2">
              <button
                onClick={startGame}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
              >
                Collect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

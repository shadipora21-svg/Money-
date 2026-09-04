import React, { useState, useEffect } from 'react';
import { X, Layers, Clock, Award, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface MemoryGameProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (coins: number, cash: number, sourceName: string) => void;
}

interface CardItem {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = ['💎', '🪙', '💰', '👑', '🚀', '🎁'];

export const MemoryGame: React.FC<MemoryGameProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matchesFound, setMatchesFound] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      initGame();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !gameWon) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, gameWon]);

  const initGame = () => {
    // Generate 12 cards (6 pairs) and shuffle
    const paired = [...SYMBOLS, ...SYMBOLS];
    // Fisher-Yates shuffle
    for (let i = paired.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [paired[i], paired[j]] = [paired[j], paired[i]];
    }

    const newCards: CardItem[] = paired.map((symbol, idx) => ({
      id: idx,
      symbol,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(newCards);
    setSelectedCards([]);
    setMoves(0);
    setMatchesFound(0);
    setGameWon(false);
    setTimer(0);
    setIsTimerRunning(true);
  };

  const handleCardClick = (id: number) => {
    if (selectedCards.length === 2) return; // Ignore clicks during check
    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    sounds.playTap();

    // Flip card
    const updatedCards = cards.map((c) =>
      c.id === id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newSelected = [...selectedCards, id];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = newSelected;
      const firstCard = updatedCards.find((c) => c.id === firstId);
      const secondCard = updatedCards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Matched!
        setTimeout(() => {
          sounds.playCoin();
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setSelectedCards([]);
          const nextMatches = matchesFound + 1;
          setMatchesFound(nextMatches);

          if (nextMatches === SYMBOLS.length) {
            handleVictory();
          }
        }, 350);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          sounds.playBuzz();
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  const handleVictory = () => {
    setGameWon(true);
    setIsTimerRunning(false);
    sounds.playWin();

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Reward: 250 base coins + move bonus
    const earnedCoins = 250 + (moves < 12 ? 50 : 0);
    const earnedCash = Number((earnedCoins / 1000).toFixed(2));

    onRewardClaimed(earnedCoins, earnedCash, 'Gem Memory Match Win');
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
            <Layers className="w-3.5 h-3.5" />
            BRAIN EXERCISE
          </div>
          <h2 className="text-2xl font-black text-white">Gem Memory Match</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Match all 6 pairs of icons. Complete in fewer moves for higher reward!
          </p>
        </div>

        {/* Stats bar */}
        <div className="w-full flex items-center justify-between bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 mb-3 text-xs font-semibold">
          <div className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Time: <strong className="text-white">{timer}s</strong></span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span>Moves: <strong className="text-white">{moves}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <Award className="w-3.5 h-3.5" />
            <span>Pairs: <strong className="text-white">{matchesFound}/6</strong></span>
          </div>
        </div>

        {/* 3x4 Grid */}
        <div className="w-full grid grid-cols-4 gap-2.5 my-2">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isFlipped || card.isMatched || gameWon}
              className={`aspect-square rounded-xl text-3xl font-bold flex items-center justify-center border transition-all duration-200 shadow select-none ${
                card.isMatched
                  ? 'bg-emerald-500/20 border-emerald-500/60 opacity-90 scale-95'
                  : card.isFlipped
                  ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-indigo-500/20'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-500 hover:border-slate-600 active:scale-95'
              }`}
            >
              {card.isFlipped || card.isMatched ? card.symbol : '?'}
            </button>
          ))}
        </div>

        {/* Victory Screen Modal Inner */}
        {gameWon && (
          <div className="w-full mt-3 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-center animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-emerald-300">🎉 Memory Solved!</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Completed in {timer}s with {moves} moves.
            </p>
            <p className="text-xl font-black text-emerald-400 my-1">
              +250 Coins (+${(250 / 1000).toFixed(2)})
            </p>
          </div>
        )}

        {/* Footer controls */}
        <div className="w-full mt-3 flex gap-2">
          <button
            onClick={initGame}
            className="flex-1 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart Game
          </button>
          {gameWon && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
            >
              Done & Collect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

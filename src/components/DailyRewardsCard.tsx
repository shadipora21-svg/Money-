import React from 'react';
import { Flame, Check, Gift, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DAILY_STREAK_REWARDS } from '../data/tasksData';
import { sounds } from '../utils/audio';

interface DailyRewardsCardProps {
  streak: number;
  checkedInToday: boolean;
  onClaimDaily: (day: number, coins: number, cash: number) => void;
}

export const DailyRewardsCard: React.FC<DailyRewardsCardProps> = ({
  streak,
  checkedInToday,
  onClaimDaily,
}) => {
  const currentDayIndex = ((streak - 1) % 7) + 1;

  const handleClaim = () => {
    if (checkedInToday) return;

    sounds.playWin();
    const currentReward = DAILY_STREAK_REWARDS[currentDayIndex - 1] || DAILY_STREAK_REWARDS[0];

    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.6 },
    });

    onClaimDaily(currentReward.day, currentReward.coins, currentReward.cash);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              7-Day Streak Rewards
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/30">
                {streak} Day Streak
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Check in consecutively each day for higher multipliers & Day 7 Mystery Vault.
            </p>
          </div>
        </div>

        {/* Claim button */}
        <button
          onClick={handleClaim}
          disabled={checkedInToday}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md ${
            !checkedInToday
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 active:scale-95 shadow-orange-500/20'
              : 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
          }`}
        >
          {checkedInToday ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Claimed Today
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Claim Day {currentDayIndex}
            </>
          )}
        </button>
      </div>

      {/* 7-Day Horizontal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {DAILY_STREAK_REWARDS.map((reward) => {
          const isPast = reward.day < currentDayIndex || (reward.day === currentDayIndex && checkedInToday);
          const isCurrent = reward.day === currentDayIndex && !checkedInToday;

          return (
            <div
              key={reward.day}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center relative transition ${
                isPast
                  ? 'bg-slate-800/40 border-slate-700/50 text-slate-400 opacity-80'
                  : isCurrent
                  ? 'bg-orange-500/15 border-orange-500/80 ring-1 ring-orange-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-750 text-slate-300'
              }`}
            >
              <div className="flex justify-between w-full items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400">Day {reward.day}</span>
                {isPast && (
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold">
                    ✓
                  </span>
                )}
              </div>

              <div className="my-1.5">
                {reward.mystery ? (
                  <Gift className="w-6 h-6 text-amber-400 animate-bounce" />
                ) : (
                  <span className="text-xl">🪙</span>
                )}
              </div>

              <div>
                <span className="text-xs font-black text-amber-300 block">
                  +{reward.coins}
                </span>
                <span className="text-[10px] text-slate-400">
                  +${reward.cash.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

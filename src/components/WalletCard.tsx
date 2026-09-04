import React from 'react';
import { Wallet, Sparkles, Disc, Zap, Award, ArrowUpRight } from 'lucide-react';
import { UserProfile } from '../types';
import { sounds } from '../utils/audio';

interface WalletCardProps {
  user: UserProfile;
  onOpenCashout: () => void;
  onOpenSpin: () => void;
  onOpenScratch: () => void;
  onOpenSpeedTap: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  user,
  onOpenCashout,
  onOpenSpin,
  onOpenScratch,
  onOpenSpeedTap,
}) => {
  const minCashout = 1.0;
  const progressPercent = Math.min(100, Math.round((user.cashBalance / minCashout) * 100));
  const xpPercent = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative subtle ambient lights */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-stretch justify-between">
        {/* Left: Main Balance & Progress */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Available Wallet Balance
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                1,000 Coins = $1.00 USD
              </span>
            </div>

            {/* Balances */}
            <div className="flex flex-wrap items-baseline gap-4 mb-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  ${user.cashBalance.toFixed(2)}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-400">USD</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-xl">
                <span className="text-base">🪙</span>
                <span className="text-base font-black text-amber-300">
                  {user.coins.toLocaleString()}
                </span>
                <span className="text-xs text-amber-400/80">Coins</span>
              </div>
            </div>
          </div>

          {/* Cashout Progress */}
          <div className="w-full bg-slate-800/80 border border-slate-750 rounded-2xl p-3.5">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium">
                Goal: <strong className="text-white">${minCashout}.00 Minimum Cashout (Instant UPI)</strong>
              </span>
              <span className="text-emerald-400 font-bold">{progressPercent}% Ready</span>
            </div>

            <div className="w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {user.cashBalance >= minCashout
                  ? '🎉 Threshold reached! You can withdraw $1.00 via UPI right now.'
                  : `$${(minCashout - user.cashBalance).toFixed(2)} more needed to cash out.`}
              </span>
              <button
                onClick={() => {
                  sounds.playTap();
                  onOpenCashout();
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-0.5 hover:underline"
              >
                Cash Out <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Level Perk & Quick Game Launchers */}
        <div className="w-full lg:w-96 flex flex-col justify-between gap-4 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-6 pt-4 lg:pt-0">
          {/* Level Bar */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3">
            <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">
                  Level {user.level}{' '}
                  <span className="text-slate-400 font-normal">
                    ({user.level <= 1 ? 'Apprentice' : user.level <= 3 ? 'Gamer' : 'Master'})
                  </span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {user.xp} / {user.xpToNextLevel} XP
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{ width: `${xpPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Mini-Game Buttons */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Play & Instant Win
            </span>
            <div className="grid grid-cols-3 gap-2">
              {/* Lucky Spin */}
              <button
                onClick={() => {
                  sounds.playTap();
                  onOpenSpin();
                }}
                className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-2xl flex flex-col items-center text-center transition group active:scale-95"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
                  <Disc className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">Wheel Spin</span>
                <span className="text-[10px] text-amber-400 font-medium">
                  {user.spinsLeft} free
                </span>
              </button>

              {/* Scratch Card */}
              <button
                onClick={() => {
                  sounds.playTap();
                  onOpenScratch();
                }}
                className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-2xl flex flex-col items-center text-center transition group active:scale-95"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">Scratcher</span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  {user.scratchesLeft} free
                </span>
              </button>

              {/* Tap Sprint */}
              <button
                onClick={() => {
                  sounds.playTap();
                  onOpenSpeedTap();
                }}
                className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 rounded-2xl flex flex-col items-center text-center transition group active:scale-95"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">Coin Rush</span>
                <span className="text-[10px] text-rose-400 font-medium">Arcade</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Gamepad2, Volume2, VolumeX, Wallet, Trophy, Users, History, Share2 } from 'lucide-react';
import { UserProfile } from '../types';
import { sounds } from '../utils/audio';

interface NavbarProps {
  user: UserProfile;
  onToggleSound: () => void;
  onOpenCashout: () => void;
  onOpenHistory: () => void;
  onOpenLeaderboard: () => void;
  onOpenReferral: () => void;
  onOpenPublish: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onToggleSound,
  onOpenCashout,
  onOpenHistory,
  onOpenLeaderboard,
  onOpenReferral,
  onOpenPublish,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white">
                Task<span className="text-amber-400">Play</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase border border-amber-500/30">
                EARN CASH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Play mini-tasks • Win real money
            </p>
          </div>
        </div>

        {/* Center/Right Balances & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle */}
          <button
            onClick={onToggleSound}
            title={user.soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {user.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Leaderboard button */}
          <button
            onClick={() => {
              sounds.playTap();
              onOpenLeaderboard();
            }}
            title="Leaderboard"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition hidden sm:flex items-center gap-1 text-xs font-semibold"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Ranks</span>
          </button>

          {/* Referral button */}
          <button
            onClick={() => {
              sounds.playTap();
              onOpenReferral();
            }}
            title="Invite & Earn"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition hidden md:flex items-center gap-1 text-xs font-semibold"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Invite ($1.00)</span>
          </button>

          {/* History button */}
          <button
            onClick={() => {
              sounds.playTap();
              onOpenHistory();
            }}
            title="Transactions"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition hidden sm:flex items-center gap-1 text-xs font-semibold"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span>History</span>
          </button>

          {/* Balance Badge */}
          <div className="flex items-center bg-slate-800 border border-slate-700/80 rounded-xl p-1 sm:p-1.5 shadow-inner">
            {/* Coins */}
            <div className="flex items-center gap-1 px-2 py-0.5 border-r border-slate-700">
              <span className="text-sm">🪙</span>
              <span className="text-xs sm:text-sm font-black text-amber-400">
                {user.coins.toLocaleString()}
              </span>
            </div>

            {/* Real Cash */}
            <div className="flex items-center gap-1 px-2 py-0.5">
              <span className="text-xs sm:text-sm font-black text-emerald-400">
                ${user.cashBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Share / Publish App Button */}
          <button
            onClick={() => {
              sounds.playTap();
              onOpenPublish();
            }}
            title="Publish & Share App"
            className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Share</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-white/20 uppercase font-black tracking-wide hidden sm:inline">
              LIVE
            </span>
          </button>

          {/* Cash Out Button */}
          <button
            onClick={() => {
              sounds.playTap();
              onOpenCashout();
            }}
            className="py-2 px-3 sm:px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>
    </header>
  );
};

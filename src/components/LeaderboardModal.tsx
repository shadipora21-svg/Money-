import React, { useState } from 'react';
import { X, Trophy, Medal, Flame } from 'lucide-react';
import { UserProfile } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  level: number;
  earningsCash: number;
  tasksDone: number;
  isUser?: boolean;
}

const DAILY_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex_Vortex', avatar: '🦁', level: 9, earningsCash: 18.50, tasksDone: 34 },
  { rank: 2, name: 'CryptoHunter_99', avatar: '🦊', level: 8, earningsCash: 15.20, tasksDone: 28 },
  { rank: 3, name: 'LuckyStreak', avatar: '⚡', level: 7, earningsCash: 12.80, tasksDone: 24 },
  { rank: 4, name: 'ArcadeQueen', avatar: '👑', level: 6, earningsCash: 9.40, tasksDone: 19 },
  { rank: 5, name: 'TaskNinja', avatar: '🥷', level: 5, earningsCash: 7.60, tasksDone: 15 },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [tab, setTab] = useState<'daily' | 'alltime'>('daily');

  if (!isOpen) return null;

  // Insert current user rank representation
  const userRankEntry: LeaderboardEntry = {
    rank: 12,
    name: currentUser.userName || 'You',
    avatar: '😎',
    level: currentUser.level,
    earningsCash: currentUser.totalEarnedCash || currentUser.cashBalance,
    tasksDone: currentUser.completedTasksCount || 4,
    isUser: true,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/70 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
            <Trophy className="w-3.5 h-3.5" />
            TOP TASK EARNERS
          </div>
          <h2 className="text-xl font-black text-white">Global Leaderboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Top 3 daily players earn an extra +$2.50 cash bonus at midnight!
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl mb-4 border border-slate-750">
          <button
            onClick={() => setTab('daily')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              tab === 'daily'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Today's Sprint
          </button>
          <button
            onClick={() => setTab('alltime')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              tab === 'alltime'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All-Time Legends
          </button>
        </div>

        {/* Podium / Top List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {DAILY_LEADERBOARD.map((item) => (
            <div
              key={item.rank}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                item.rank === 1
                  ? 'bg-amber-500/15 border-amber-500/60 shadow-sm'
                  : item.rank === 2
                  ? 'bg-slate-800/80 border-slate-700'
                  : item.rank === 3
                  ? 'bg-amber-900/20 border-amber-800/50'
                  : 'bg-slate-800/40 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 text-center font-black text-xs">
                  {item.rank === 1 ? (
                    <span className="text-amber-400 text-base">🥇</span>
                  ) : item.rank === 2 ? (
                    <span className="text-slate-300 text-base">🥈</span>
                  ) : item.rank === 3 ? (
                    <span className="text-amber-600 text-base">🥉</span>
                  ) : (
                    <span className="text-slate-500">#{item.rank}</span>
                  )}
                </div>

                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
                  {item.avatar}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {item.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                      Lv {item.level}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {item.tasksDone} tasks finished
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs sm:text-sm font-black text-emerald-400">
                  ${item.earningsCash.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {(item.earningsCash * 1000).toLocaleString()} 🪙
                </div>
              </div>
            </div>
          ))}

          {/* User's position card */}
          <div className="mt-3 pt-3 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Your Current Standing
            </span>
            <div className="p-3 rounded-xl border border-emerald-500/60 bg-emerald-500/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-black text-xs text-emerald-400">
                  #{userRankEntry.rank}
                </span>
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-emerald-500/40 flex items-center justify-center text-lg">
                  {userRankEntry.avatar}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">You</span>
                  <span className="text-[10px] text-slate-400">
                    {userRankEntry.tasksDone} tasks completed
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black text-emerald-400">
                  ${userRankEntry.earningsCash.toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-300/70">
                  {(userRankEntry.earningsCash * 1000).toLocaleString()} 🪙
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

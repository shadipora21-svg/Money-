import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WalletCard } from './components/WalletCard';
import { DailyRewardsCard } from './components/DailyRewardsCard';
import { TaskList } from './components/TaskList';
import { SpinWheelModal } from './components/games/SpinWheelModal';
import { ScratchCardModal } from './components/games/ScratchCardModal';
import { SpeedTapGame } from './components/games/SpeedTapGame';
import { MemoryGame } from './components/games/MemoryGame';
import { MathSprintGame } from './components/games/MathSprintGame';
import { SurveyModal } from './components/tasks/SurveyModal';
import { TesterTaskModal } from './components/tasks/TesterTaskModal';
import { CashoutModal } from './components/CashoutModal';
import { TransactionHistoryModal } from './components/TransactionHistoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ReferralModal } from './components/ReferralModal';
import { PublishModal } from './components/PublishModal';

import { UserProfile, TaskItem, Transaction } from './types';
import { INITIAL_TASKS, INITIAL_TRANSACTIONS } from './data/tasksData';
import { sounds } from './utils/audio';
import { ShieldCheck, Zap, Sparkles, CheckCircle2, Globe, ExternalLink, Share2 } from 'lucide-react';

const STORAGE_KEY_USER = 'taskplay_user_profile_v1';
const STORAGE_KEY_TASKS = 'taskplay_tasks_v1';
const STORAGE_KEY_TX = 'taskplay_transactions_v1';

const DEFAULT_USER: UserProfile = {
  coins: 1450,
  cashBalance: 1.45,
  totalEarnedCash: 1.45,
  totalWithdrawnCash: 0,
  level: 2,
  xp: 320,
  xpToNextLevel: 600,
  streak: 2,
  lastCheckInDate: null,
  spinsLeft: 3,
  scratchesLeft: 3,
  completedTasksCount: 4,
  userName: 'Player_Adil',
  userEmail: 'adilw9925@gmail.com',
  referralCode: 'TASK-WIN-77',
  referralsBonusClaimed: 0,
  soundEnabled: true,
};

export default function App() {
  // User Profile State
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading user profile', e);
    }
    return DEFAULT_USER;
  });

  // Tasks State
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading tasks', e);
    }
    return INITIAL_TASKS;
  });

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TX);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading transactions', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  // Check-in status
  const [checkedInToday, setCheckedInToday] = useState<boolean>(false);

  // Modals visibility
  const [isSpinOpen, setIsSpinOpen] = useState<boolean>(false);
  const [isScratchOpen, setIsScratchOpen] = useState<boolean>(false);
  const [isSpeedTapOpen, setIsSpeedTapOpen] = useState<boolean>(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState<boolean>(false);
  const [isMathOpen, setIsMathOpen] = useState<boolean>(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState<boolean>(false);
  const [isTesterOpen, setIsTesterOpen] = useState<boolean>(false);

  const [isCashoutOpen, setIsCashoutOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isReferralOpen, setIsReferralOpen] = useState<boolean>(false);
  const [isPublishOpen, setIsPublishOpen] = useState<boolean>(false);

  // Temporary toast notification for rewards
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist User
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist user profile', e);
    }
  }, [user]);

  // Persist Tasks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to persist tasks', e);
    }
  }, [tasks]);

  // Persist Transactions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to persist transactions', e);
    }
  }, [transactions]);

  // Sync sound settings with audio utility
  useEffect(() => {
    sounds.setEnabled(user.soundEnabled);
  }, [user.soundEnabled]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Generic Reward Handler for mini-games & micro-tasks
  const handleRewardClaimed = (coins: number, cash: number, sourceName: string) => {
    setUser((prev) => {
      const newCoins = prev.coins + coins;
      const newCash = Number((prev.cashBalance + cash).toFixed(2));
      const newEarned = Number((prev.totalEarnedCash + cash).toFixed(2));

      // XP Progression
      const gainedXP = Math.round(coins / 2);
      let newXP = prev.xp + gainedXP;
      let newLevel = prev.level;
      let newXPToNext = prev.xpToNextLevel;

      if (newXP >= prev.xpToNextLevel) {
        newLevel += 1;
        newXP = newXP - prev.xpToNextLevel;
        newXPToNext = Math.round(prev.xpToNextLevel * 1.5);
        sounds.playLevelUp();
        showToast(`⭐ LEVEL UP! You reached Level ${newLevel}! +50 Bonus Coins!`);
      }

      return {
        ...prev,
        coins: newCoins,
        cashBalance: newCash,
        totalEarnedCash: newEarned,
        completedTasksCount: prev.completedTasksCount + 1,
        xp: newXP,
        level: newLevel,
        xpToNextLevel: newXPToNext,
      };
    });

    // Record Transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'earned',
      title: sourceName,
      amountCoins: coins,
      amountCash: cash,
      status: 'Completed',
      timestamp: 'Just now',
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`💰 Earned +${coins} Coins (+$${cash.toFixed(2)}) from ${sourceName}!`);
  };

  // Daily Streak Claim
  const handleClaimDaily = (day: number, coins: number, cash: number) => {
    setCheckedInToday(true);
    handleRewardClaimed(coins, cash, `Day ${day} Check-in Streak`);
  };

  // Use Spin
  const handleUseSpin = () => {
    setUser((prev) => ({
      ...prev,
      spinsLeft: Math.max(0, prev.spinsLeft - 1),
    }));
  };

  // Use Scratch
  const handleUseScratch = () => {
    setUser((prev) => ({
      ...prev,
      scratchesLeft: Math.max(0, prev.scratchesLeft - 1),
    }));
  };

  // Cashout / Withdrawal
  const handleWithdraw = (tx: Transaction, cashAmount: number, coinsAmount: number) => {
    setUser((prev) => ({
      ...prev,
      cashBalance: Math.max(0, Number((prev.cashBalance - cashAmount).toFixed(2))),
      coins: Math.max(0, prev.coins - coinsAmount),
      totalWithdrawnCash: Number((prev.totalWithdrawnCash + cashAmount).toFixed(2)),
    }));

    setTransactions((prev) => [tx, ...prev]);
    showToast(`💸 Cashout for $${cashAmount.toFixed(2)} is being processed!`);
  };

  // Referral Simulation
  const handleSimulateReferral = () => {
    handleRewardClaimed(1000, 1.0, 'Referral Bonus: Friend Joined');
    setUser((prev) => ({
      ...prev,
      referralsBonusClaimed: prev.referralsBonusClaimed + 1,
    }));
  };

  // Toggle Sound
  const handleToggleSound = () => {
    setUser((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  // Start specific task by its type
  const handleStartTask = (task: TaskItem) => {
    // Update plays count
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, playsToday: t.playsToday + 1 } : t
      )
    );

    switch (task.type) {
      case 'spin':
        setIsSpinOpen(true);
        break;
      case 'scratch':
        setIsScratchOpen(true);
        break;
      case 'speed-tap':
        setIsSpeedTapOpen(true);
        break;
      case 'memory-flip':
        setIsMemoryOpen(true);
        break;
      case 'math-blitz':
        setIsMathOpen(true);
        break;
      case 'survey':
        setIsSurveyOpen(true);
        break;
      case 'tester':
        setIsTesterOpen(true);
        break;
      default:
        setIsSpeedTapOpen(true);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 border border-emerald-500/80 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-white">
            {toastMessage}
          </span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={user}
        onToggleSound={handleToggleSound}
        onOpenCashout={() => setIsCashoutOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenReferral={() => setIsReferralOpen(true)}
        onOpenPublish={() => setIsPublishOpen(true)}
      />

      {/* Main Content Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Live Published Status Bar */}
        <div className="w-full bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-purple-950/70 border border-blue-500/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white">App Live & Ready to Share</span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Aap is app ko kisi bhi phone ya browser me direct chala sakte hain!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsPublishOpen(true)}
              className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              Publish / Share Link
            </button>
            <button
              onClick={() => window.open('https://ais-pre-foassfo33nty2tedg3c523-589196239773.asia-southeast1.run.app', '_blank')}
              className="py-2 px-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              Open Full Screen
            </button>
          </div>
        </div>

        {/* Ticker & Activity Strip */}
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-slate-400 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-emerald-300">Live Payouts:</span>
            <span className="truncate max-w-[220px] sm:max-w-none text-slate-300">
              rahul_k*** received ₹850 via UPI Instant (1 min ago)
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-purple-400 font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Instant ₹ UPI & PayPal payouts active 24/7</span>
          </div>
        </div>

        {/* Financial & Game Hub Card */}
        <WalletCard
          user={user}
          onOpenCashout={() => setIsCashoutOpen(true)}
          onOpenSpin={() => setIsSpinOpen(true)}
          onOpenScratch={() => setIsScratchOpen(true)}
          onOpenSpeedTap={() => setIsSpeedTapOpen(true)}
        />

        {/* 7-Day Streak Rewards */}
        <DailyRewardsCard
          streak={user.streak}
          checkedInToday={checkedInToday}
          onClaimDaily={handleClaimDaily}
        />

        {/* Task Section Header */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Available Earning Tasks & Games
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Pick any game or micro-mission below. Every completion instantly adds coins & cash to your wallet!
              </p>
            </div>
          </div>

          {/* Task Grid with Categories */}
          <TaskList tasks={tasks} onStartTask={handleStartTask} />
        </div>

        {/* Trust & Guarantee Banner */}
        <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Verified & Safe Micro-Task Platform</h4>
              <p>
                Instant withdrawals processed via UPI (GPay / PhonePe / Paytm / BHIM), PayPal, Amazon Gift Cards, Google Play, Apple, & Crypto.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Free to Play
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero Hidden Fees
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Instant UPI Rail
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 TaskPlay Arcade. Real cash rewards for gaming & tasks.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Transaction Audit
            </button>
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Hall of Fame
            </button>
            <button
              onClick={() => setIsReferralOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Partner Program
            </button>
          </div>
        </div>
      </footer>

      {/* Mini-Games Modals */}
      <SpinWheelModal
        isOpen={isSpinOpen}
        onClose={() => setIsSpinOpen(false)}
        spinsLeft={user.spinsLeft}
        onRewardClaimed={handleRewardClaimed}
        onUseSpin={handleUseSpin}
      />

      <ScratchCardModal
        isOpen={isScratchOpen}
        onClose={() => setIsScratchOpen(false)}
        scratchesLeft={user.scratchesLeft}
        onRewardClaimed={handleRewardClaimed}
        onUseScratch={handleUseScratch}
      />

      <SpeedTapGame
        isOpen={isSpeedTapOpen}
        onClose={() => setIsSpeedTapOpen(false)}
        onRewardClaimed={handleRewardClaimed}
      />

      <MemoryGame
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        onRewardClaimed={handleRewardClaimed}
      />

      <MathSprintGame
        isOpen={isMathOpen}
        onClose={() => setIsMathOpen(false)}
        onRewardClaimed={handleRewardClaimed}
      />

      {/* Micro-Tasks Modals */}
      <SurveyModal
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        onRewardClaimed={handleRewardClaimed}
      />

      <TesterTaskModal
        isOpen={isTesterOpen}
        onClose={() => setIsTesterOpen(false)}
        onRewardClaimed={handleRewardClaimed}
      />

      {/* Wallet & Social Modals */}
      <CashoutModal
        isOpen={isCashoutOpen}
        onClose={() => setIsCashoutOpen(false)}
        cashBalance={user.cashBalance}
        coins={user.coins}
        userEmail={user.userEmail}
        onWithdraw={handleWithdraw}
      />

      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        transactions={transactions}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUser={user}
      />

      <ReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        referralCode={user.referralCode}
        onSimulateReferral={handleSimulateReferral}
      />

      {/* Publish & Share Modal */}
      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { X, Users, Copy, Check, Gift, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
  onSimulateReferral: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  referralCode,
  onSimulateReferral,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    sounds.playTap();
    navigator.clipboard.writeText(
      `Join TaskPlay and earn real cash playing small tasks! Use my invite code: ${referralCode} for a $0.50 starter bonus!`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestInvite = () => {
    sounds.playWin();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    onSimulateReferral();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/70 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2 border border-cyan-500/30">
            <Users className="w-3.5 h-3.5" />
            REFER & EARN PROGRAM
          </div>
          <h2 className="text-2xl font-black text-white">Invite Friends</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Give a friend $0.50 starter cash, and get{' '}
            <strong className="text-emerald-400">+$1.00 (1,000 Coins)</strong> when they join!
          </p>
        </div>

        {/* Perk Highlights */}
        <div className="space-y-2.5 mb-5">
          <div className="p-3 bg-slate-800/80 border border-slate-750 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
              💵
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">$1.00 Instant Cash Bonus</h4>
              <p className="text-[11px] text-slate-400">
                Credited directly to your wallet on signup.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-800/80 border border-slate-750 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
              ⚡
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">10% Lifetime Task Commission</h4>
              <p className="text-[11px] text-slate-400">
                Earn passive coins whenever your referrals complete tasks.
              </p>
            </div>
          </div>
        </div>

        {/* Copy Referral Code */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
            Your Unique Invite Code
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 py-2.5 px-4 bg-slate-800 border border-slate-700 rounded-xl font-mono text-base font-bold text-amber-300 select-all text-center">
              {referralCode}
            </div>
            <button
              onClick={handleCopy}
              className="py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white flex items-center gap-1.5 transition active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Simulator Button */}
        <button
          onClick={handleTestInvite}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          Test Invite Referral (+1,000 Coins / $1.00)
        </button>
      </div>
    </div>
  );
};

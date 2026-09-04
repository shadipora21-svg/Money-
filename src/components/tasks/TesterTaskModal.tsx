import React, { useState } from 'react';
import { X, Smartphone, Star, CheckCircle2, ShieldCheck, Play, Pause, Heart, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface TesterTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (coins: number, cash: number, sourceName: string) => void;
}

export const TesterTaskModal: React.FC<TesterTaskModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [rating, setRating] = useState<number>(4);
  const [selectedIssue, setSelectedIssue] = useState<string>('button_size');
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    sounds.playTap();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsCompleted(true);
      sounds.playWin();

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });

      onRewardClaimed(500, 0.50, 'App UI Beta Test Report');
    }, 1200);
  };

  const resetAndClose = () => {
    setIsCompleted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/70 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Smartphone className="w-3.5 h-3.5" />
            QA / BETA TESTER MISSION
          </div>
          <h2 className="text-xl font-black text-white">App UI Prototype Audit</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test this prototype music player, submit your feedback, and earn 500 Coins ($0.50).
          </p>
        </div>

        {!isCompleted ? (
          <div className="flex flex-col gap-4">
            {/* Simulated App Prototype Screen */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Prototype Preview Sandbox (Try clicking controls)
              </span>

              {/* Music Player Mockup Card */}
              <div className="w-full max-w-[280px] bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-col items-center">
                {/* Artwork */}
                <div className="w-full aspect-square rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-amber-500 flex items-center justify-center text-4xl shadow-inner mb-3">
                  🎵
                </div>

                <div className="w-full flex justify-between items-center mb-1">
                  <div>
                    <h4 className="text-sm font-bold text-white">Neon Horizon</h4>
                    <p className="text-xs text-slate-400">CyberWave 2026</p>
                  </div>
                  <button
                    onClick={() => sounds.playTap()}
                    className="text-slate-400 hover:text-rose-400 transition"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full my-2">
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-2/5 h-full bg-amber-400"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1:14</span>
                    <span>3:42</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mt-1">
                  <button
                    onClick={() => {
                      sounds.playTap();
                      setIsPlayingDemo(!isPlayingDemo);
                    }}
                    className="p-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full shadow-lg transition active:scale-95"
                  >
                    {isPlayingDemo ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button
                    onClick={() => sounds.playTap()}
                    className="p-2 text-slate-400 hover:text-white transition"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Questions Form */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  1. How would you rate the overall UI usability?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        setRating(star);
                      }}
                      className="p-1.5 transition hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  2. Select the most prominent design feedback or bug:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'button_size', text: 'Play/Pause touch target is responsive & clear' },
                    { id: 'contrast', text: 'Color contrast between text and background is good' },
                    { id: 'seeker', text: 'Seekbar scrubbing should have larger drag handle' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      onClick={() => sounds.playTap()}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center gap-2.5 transition ${
                        selectedIssue === item.id
                          ? 'bg-emerald-500/20 border-emerald-500/80 text-emerald-200'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="issue"
                        checked={selectedIssue === item.id}
                        onChange={() => setSelectedIssue(item.id)}
                        className="accent-emerald-400"
                      />
                      <span>{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition active:scale-98 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>Verifying Audit Report...</>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Submit QA Report & Claim $0.50
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-white mb-1">QA Report Accepted!</h3>
            <p className="text-xs text-slate-300 max-w-xs mb-4">
              Your feedback was accepted by the app developer. Task payout has been added directly to your available balance!
            </p>

            <div className="py-3 px-6 bg-emerald-500/20 border border-emerald-500/40 rounded-xl mb-6">
              <span className="text-xs font-semibold text-emerald-300 uppercase block">
                Reward Added
              </span>
              <span className="text-2xl font-black text-emerald-400">
                +500 Coins (+$0.50 USD)
              </span>
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg transition"
            >
              Back to Task Hub
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

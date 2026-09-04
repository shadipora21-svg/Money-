import React, { useState } from 'react';
import { X, ClipboardCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (coins: number, cash: number, sourceName: string) => void;
}

const SURVEY_QUESTIONS = [
  {
    id: 1,
    question: 'Which device do you primarily play mobile games and use task apps on?',
    options: ['Android Phone', 'Apple iPhone', 'Tablet / iPad', 'PC / Laptop'],
  },
  {
    id: 2,
    question: 'How much time do you spend daily on casual gaming or micro-tasks?',
    options: ['Under 15 minutes', '15 - 45 minutes', '1 - 2 hours', '2+ hours daily'],
  },
  {
    id: 3,
    question: 'Which payout method do you value most for your cash rewards?',
    options: ['PayPal Direct Cash', 'Amazon Gift Card', 'Google Play Voucher', 'Crypto USDT'],
  },
  {
    id: 4,
    question: 'What type of game tasks are your favorite to earn with?',
    options: ['Speed Tap & Arcade', 'Lucky Spin Wheel & Scratch Cards', 'Brain Quizzes & Puzzles', 'All of the above!'],
  },
];

export const SurveyModal: React.FC<SurveyModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentQ = SURVEY_QUESTIONS[currentStep];
  const totalQuestions = SURVEY_QUESTIONS.length;

  const handleSelect = (option: string) => {
    sounds.playTap();
    setAnswers((prev) => ({ ...prev, [currentStep]: option }));
  };

  const handleNext = () => {
    sounds.playTap();
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // Submit survey
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

        onRewardClaimed(350, 0.35, 'Gaming Pulse Survey Completed');
      }, 1000);
    }
  };

  const resetAndClose = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsCompleted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/70 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col">
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-500/30">
            <ClipboardCheck className="w-3.5 h-3.5" />
            SPONSORED CONSUMER POLL
          </div>
          <h2 className="text-xl font-black text-white">Mobile Gaming Pulse Survey</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete all 4 questions to unlock +350 coins ($0.35 reward).
          </p>
        </div>

        {/* Progress bar */}
        {!isCompleted && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1 font-medium">
              <span>Question {currentStep + 1} of {totalQuestions}</span>
              <span>{Math.round(((currentStep + 1) / totalQuestions) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {!isCompleted ? (
          <div className="flex flex-col flex-1">
            <h3 className="text-base font-bold text-white mb-4 leading-snug">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="flex flex-col gap-2.5 mb-6">
              {currentQ.options.map((opt, i) => {
                const isSelected = answers[currentStep] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt)}
                    className={`w-full p-3.5 rounded-xl border text-left text-sm font-medium transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <span>{opt}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-400 bg-blue-500'
                          : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next / Submit Button */}
            <button
              onClick={handleNext}
              disabled={!answers[currentStep] || isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                answers[currentStep] && !isSubmitting
                  ? 'bg-blue-500 hover:bg-blue-400 text-slate-950 shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                'Verifying Responses...'
              ) : currentStep === totalQuestions - 1 ? (
                'Submit Survey & Claim $0.35'
              ) : (
                <>
                  Next Question <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-white mb-1">Survey Verified!</h3>
            <p className="text-xs text-slate-300 max-w-xs mb-4">
              Thank you for sharing your opinions. Your feedback helps improve task matching algorithms!
            </p>

            <div className="py-3 px-6 bg-emerald-500/20 border border-emerald-500/40 rounded-xl mb-6">
              <span className="text-xs font-semibold text-emerald-300 uppercase block">
                Reward Added
              </span>
              <span className="text-2xl font-black text-emerald-400">
                +350 Coins (+$0.35 USD)
              </span>
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg transition"
            >
              Done & Return to Tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

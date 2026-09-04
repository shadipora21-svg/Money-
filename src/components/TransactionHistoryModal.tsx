import React from 'react';
import { X, History, ArrowDownLeft, ArrowUpRight, Sparkles } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/70 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
            <History className="w-3.5 h-3.5" />
            WALLET AUDIT LOG
          </div>
          <h2 className="text-xl font-black text-white">Transaction History</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time record of all task earnings, bonuses, and cash withdrawals.
          </p>
        </div>

        {/* Transaction Items */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No transactions recorded yet. Complete a task to start earning!
            </div>
          ) : (
            transactions.map((tx) => {
              const isCashout = tx.type === 'cashout';
              return (
                <div
                  key={tx.id}
                  className="p-3.5 bg-slate-800/60 border border-slate-750 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCashout
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : tx.type === 'bonus'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isCashout ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : tx.type === 'bonus' ? (
                        <Sparkles className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                        {tx.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{tx.timestamp}</span>
                        {tx.referenceId && (
                          <span className="font-mono text-[10px] text-slate-500">
                            #{tx.referenceId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className={`text-xs sm:text-sm font-black ${
                        isCashout ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isCashout ? '-' : '+'}${tx.amountCash.toFixed(2)}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400">
                      {isCashout ? '-' : '+'}{tx.amountCoins.toLocaleString()} 🪙
                    </div>
                    <span
                      className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                        tx.status === 'Completed'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-amber-500/15 text-amber-300'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

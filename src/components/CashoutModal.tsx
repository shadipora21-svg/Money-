import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Wallet,
  Smartphone,
  ShoppingBag,
  PlayCircle,
  Coins,
  Apple,
  Building2,
  Sparkles,
  Zap,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PayoutMethod, Transaction } from '../types';
import { PAYOUT_METHODS } from '../data/tasksData';
import { sounds } from '../utils/audio';

interface CashoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashBalance: number;
  coins: number;
  userEmail: string;
  onWithdraw: (tx: Transaction, cashAmount: number, coinsAmount: number) => void;
}

const UPI_HANDLES = [
  { label: '@okhdfcbank', app: 'Google Pay' },
  { label: '@okaxis', app: 'Google Pay' },
  { label: '@ybl', app: 'PhonePe' },
  { label: '@paytm', app: 'Paytm' },
  { label: '@ibl', app: 'PhonePe' },
  { label: '@upi', app: 'BHIM' },
];

export const CashoutModal: React.FC<CashoutModalProps> = ({
  isOpen,
  onClose,
  cashBalance,
  coins,
  userEmail,
  onWithdraw,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod>(PAYOUT_METHODS[0]);
  const [selectedAmount, setSelectedAmount] = useState<number>(PAYOUT_METHODS[0].options[0]);
  const [recipientInput, setRecipientInput] = useState<string>(
    PAYOUT_METHODS[0].id === 'upi' ? 'adilw9925@okhdfcbank' : userEmail
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSelectMethod = (method: PayoutMethod) => {
    sounds.playTap();
    setSelectedMethod(method);
    setSelectedAmount(method.options[0]);
    setErrorMsg('');

    if (method.id === 'upi') {
      if (!recipientInput || recipientInput.includes('@gmail.com') || recipientInput.startsWith('0x')) {
        setRecipientInput('adilw9925@okhdfcbank');
      }
    } else if (method.inputType === 'email' && (!recipientInput || recipientInput.includes('@okhdfcbank') || recipientInput.includes('@ybl'))) {
      setRecipientInput(userEmail || 'user@example.com');
    }
  };

  // Helper for applying UPI handle suffix
  const handleApplyUpiHandle = (handle: string) => {
    sounds.playTap();
    const current = recipientInput.trim();
    if (!current) {
      setRecipientInput(`adil${handle}`);
      return;
    }
    const atIndex = current.indexOf('@');
    if (atIndex !== -1) {
      const prefix = current.substring(0, atIndex);
      setRecipientInput(`${prefix}${handle}`);
    } else {
      setRecipientInput(`${current}${handle}`);
    }
    setErrorMsg('');
  };

  const isUpi = selectedMethod.id === 'upi';
  const isUpiValid = isUpi && /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(recipientInput.trim());

  const handleWithdraw = () => {
    const trimmedInput = recipientInput.trim();
    if (!trimmedInput) {
      sounds.playBuzz();
      setErrorMsg(
        isUpi
          ? 'Please enter your UPI ID (e.g. mobile@upi or username@okhdfcbank).'
          : 'Please enter your destination payout details.'
      );
      return;
    }

    if (isUpi && !trimmedInput.includes('@')) {
      sounds.playBuzz();
      setErrorMsg('Invalid UPI ID. A valid UPI ID must include "@" (e.g. 9876543210@ybl or name@okhdfcbank).');
      return;
    }

    if (cashBalance < selectedAmount) {
      sounds.playBuzz();
      setErrorMsg(
        `Insufficient balance. You need $${(selectedAmount - cashBalance).toFixed(
          2
        )} more to withdraw $${selectedAmount.toFixed(2)}.`
      );
      return;
    }

    sounds.playTap();
    setIsProcessing(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsProcessing(false);
      sounds.playWin();

      const coinsNeeded = selectedAmount * 1000;
      const refId = isUpi
        ? `UPI-${Math.floor(100000000000 + Math.random() * 900000000000)}`
        : `WD-${Math.floor(100000 + Math.random() * 900000)}-${selectedMethod.id.toUpperCase()}`;

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'cashout',
        title: isUpi ? 'UPI Instant Bank Transfer' : `${selectedMethod.name} Payout`,
        amountCash: selectedAmount,
        amountCoins: coinsNeeded,
        status: isUpi ? 'Completed' : 'Processing',
        method: isUpi ? 'UPI Transfer (NPCI)' : selectedMethod.name,
        recipient: trimmedInput,
        timestamp: 'Just now',
        referenceId: refId,
      };

      setCompletedTx(newTx);
      onWithdraw(newTx, selectedAmount, coinsNeeded);

      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.5 },
      });
    }, 1200);
  };

  const resetAndClose = () => {
    setCompletedTx(null);
    setErrorMsg('');
    onClose();
  };

  const getMethodIcon = (id: string) => {
    switch (id) {
      case 'upi':
        return <Smartphone className="w-4 h-4 text-purple-400" />;
      case 'paypal':
        return <Wallet className="w-4 h-4 text-blue-400" />;
      case 'amazon':
        return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case 'googleplay':
        return <PlayCircle className="w-4 h-4 text-emerald-400" />;
      case 'crypto':
        return <Coins className="w-4 h-4 text-teal-400" />;
      case 'apple':
        return <Apple className="w-4 h-4 text-slate-300" />;
      case 'bank':
        return <Building2 className="w-4 h-4 text-indigo-400" />;
      default:
        return <Wallet className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/70 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Wallet className="w-3.5 h-3.5" />
            INSTANT CASHOUT DESK
          </div>
          <h2 className="text-2xl font-black text-white">Withdraw Your Earnings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Current balance:{' '}
            <strong className="text-emerald-400 text-sm">
              ${cashBalance.toFixed(2)} USD
            </strong>{' '}
            ({coins.toLocaleString()} Coins)
          </p>
        </div>

        {!completedTx ? (
          <div className="flex flex-col gap-4">
            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Choose Payout Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAYOUT_METHODS.map((m) => {
                  const isSelected = selectedMethod.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMethod(m)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left flex flex-col transition relative ${
                        isSelected
                          ? 'bg-purple-500/15 border-purple-500 ring-1 ring-purple-500'
                          : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          {getMethodIcon(m.id)}
                          <span className="text-xs font-bold text-white line-clamp-1">{m.name}</span>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Min ${m.minCash}.00</span>
                        {m.badge && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold text-[9px]">
                            {m.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* UPI Special Highlight Banner */}
            {isUpi && (
              <div className="p-3 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-800 border border-purple-500/40 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 font-bold text-[10px] border border-purple-400/30">
                      BHIM UPI
                    </span>
                    <span className="font-bold text-white text-xs">Instant Bank Settlement</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> 2-5 Seconds
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Direct money credit to your Indian bank account via Google Pay, PhonePe, Paytm, or BHIM. Live conversion: <strong className="text-amber-300">1 USD = ₹85.00 INR</strong>.
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-400 border-t border-purple-500/20">
                  <span className="text-slate-500">Supported:</span>
                  <span className="px-1.5 py-0.5 bg-slate-800/80 rounded text-slate-300 border border-slate-700">Google Pay</span>
                  <span className="px-1.5 py-0.5 bg-slate-800/80 rounded text-slate-300 border border-slate-700">PhonePe</span>
                  <span className="px-1.5 py-0.5 bg-slate-800/80 rounded text-slate-300 border border-slate-700">Paytm</span>
                  <span className="px-1.5 py-0.5 bg-slate-800/80 rounded text-slate-300 border border-slate-700">BHIM UPI</span>
                  <span className="px-1.5 py-0.5 bg-slate-800/80 rounded text-slate-300 border border-slate-700">All Banks</span>
                </div>
              </div>
            )}

            {/* Select Denomination */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Amount ({selectedMethod.name})
                </label>
                {selectedMethod.inrRate && (
                  <span className="text-[11px] font-semibold text-amber-400">
                    ₹{selectedAmount * selectedMethod.inrRate} INR
                  </span>
                )}
              </div>

              <div className={`grid gap-2 ${selectedMethod.options.length <= 4 ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-5'}`}>
                {selectedMethod.options.map((amt) => {
                  const isSelected = selectedAmount === amt;
                  const canAfford = cashBalance >= amt;
                  const inrVal = selectedMethod.inrRate ? amt * selectedMethod.inrRate : null;
                  return (
                    <button
                      key={amt}
                      onClick={() => {
                        sounds.playTap();
                        setSelectedAmount(amt);
                        setErrorMsg('');
                      }}
                      className={`py-2 px-2.5 rounded-xl border text-center transition ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md'
                          : canAfford
                          ? 'bg-slate-800 hover:bg-slate-750 text-white border-slate-700 font-bold'
                          : 'bg-slate-800/40 text-slate-500 border-slate-800 font-medium'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-black">${amt}</span>
                      {inrVal ? (
                        <span className="block text-[10px] font-bold text-amber-300">
                          ₹{inrVal}
                        </span>
                      ) : (
                        <span className="block text-[10px] opacity-75">
                          {amt * 1000} coins
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Destination Input & UPI Handle Helpers */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {isUpi ? 'Your UPI ID (VPA)' : 'Recipient Details'}
                </label>
                {isUpiValid && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Valid VPA
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type={selectedMethod.inputType === 'email' ? 'email' : 'text'}
                  value={recipientInput}
                  onChange={(e) => {
                    setRecipientInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder={selectedMethod.placeholder}
                  className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 ${
                    isUpiValid
                      ? 'border-emerald-500/70 focus:border-emerald-500 focus:ring-emerald-500'
                      : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                />
              </div>

              {/* Quick Handle Chips for UPI */}
              {isUpi && (
                <div className="mt-2 space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-medium block">
                    Quick App Handles (click to append/switch handle):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {UPI_HANDLES.map((h) => {
                      const isActive = recipientInput.endsWith(h.label);
                      return (
                        <button
                          key={h.label}
                          type="button"
                          onClick={() => handleApplyUpiHandle(h.label)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition flex items-center gap-1 ${
                            isActive
                              ? 'bg-purple-500/30 border-purple-400 text-purple-200 font-bold'
                              : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-300'
                          }`}
                        >
                          <span>{h.label}</span>
                          <span className="text-[9px] text-slate-400 font-sans">({h.app})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <span className="text-[11px] text-slate-400 mt-2 block">
                Estimated delivery: <strong className="text-white">{selectedMethod.deliveryTime}</strong> • {selectedMethod.feeText}
              </span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-start gap-2 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Progress to withdrawal if not enough */}
            {cashBalance < selectedAmount && (
              <div className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl">
                <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
                  <span>Progress to ${selectedAmount}.00 Cashout</span>
                  <span className="text-amber-400 font-bold">
                    ${cashBalance.toFixed(2)} / ${selectedAmount}.00 (
                    {Math.min(100, Math.round((cashBalance / selectedAmount) * 100))}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((cashBalance / selectedAmount) * 100)
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleWithdraw}
              disabled={isProcessing}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 ${
                cashBalance >= selectedAmount && !isProcessing
                  ? isUpi
                    ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 hover:from-purple-400 hover:to-emerald-400 text-white shadow-purple-500/20'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {isProcessing ? (
                'Connecting to NPCI UPI Rail...'
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Withdraw ${selectedAmount}.00
                  {selectedMethod.inrRate && ` (₹${selectedAmount * selectedMethod.inrRate} INR)`} via{' '}
                  {selectedMethod.name}
                </>
              )}
            </button>
          </div>
        ) : (
          /* Payout Receipt / Success */
          <div className="flex flex-col items-center justify-center py-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-white mb-1">
              Withdrawal Order Confirmed!
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mb-4">
              Your payout request has been processed successfully. Funds are being credited immediately.
            </p>

            {/* Receipt Box */}
            <div className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-left space-y-2 text-xs mb-4 font-mono">
              <div className="flex justify-between border-b border-slate-700/80 pb-1.5">
                <span className="text-slate-400">Reference / UTR ID</span>
                <span className="text-emerald-400 font-bold">{completedTx.referenceId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700/80 pb-1.5">
                <span className="text-slate-400">Payout Amount</span>
                <span className="text-white font-bold">
                  ${completedTx.amountCash.toFixed(2)} USD
                  {selectedMethod.inrRate && (
                    <span className="text-amber-300 ml-1">
                      (₹{(completedTx.amountCash * selectedMethod.inrRate).toFixed(2)} INR)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-700/80 pb-1.5">
                <span className="text-slate-400">Payment Gateway</span>
                <span className="text-white">{completedTx.method}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700/80 pb-1.5">
                <span className="text-slate-400">Recipient Account / UPI</span>
                <span className="text-white truncate max-w-[200px]">{completedTx.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Settlement Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Transferred Successfully
                </span>
              </div>
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

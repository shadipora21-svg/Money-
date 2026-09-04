import React, { useState } from 'react';
import {
  X,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Globe,
  QrCode,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);

  if (!isOpen) return null;

  const appUrl = 'https://ais-pre-foassfo33nty2tedg3c523-589196239773.asia-southeast1.run.app';

  const handleCopyLink = () => {
    sounds.playTap();
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareNative = async () => {
    sounds.playTap();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TaskPlay - Earn Real Cash & UPI Rewards',
          text: 'Play arcade games and earn real cash rewards! Instant withdrawal via UPI and PayPal.',
          url: appUrl,
        });
      } catch (e) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleOpenNewTab = () => {
    sounds.playTap();
    window.open(appUrl, '_blank');
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    appUrl
  )}&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Globe className="w-3.5 h-3.5" />
            LIVE PUBLIC LINK READY
          </div>
          <h2 className="text-2xl font-black text-white">Share & Launch Your App</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
            Aapki app live ho chuki hai! Is link ko kisi ke sath bhi share karein ya direct browser me open karein.
          </p>
        </div>

        {/* Direct Link Box */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
            Public Live Web App URL:
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 py-2.5 px-3.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-emerald-400 truncate select-all">
              {appUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition active:scale-95 flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
          <button
            onClick={handleOpenNewTab}
            className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            Naye Tab Me Kholein (Open Full)
          </button>

          <button
            onClick={handleShareNative}
            className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            WhatsApp / Share Karein
          </button>
        </div>

        {/* QR Code toggle */}
        <div className="border-t border-slate-800 pt-4 mb-4">
          <button
            onClick={() => setShowQr(!showQr)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-purple-400" />
              Mobile Phone Par Kholne Ke Liye QR Code
            </span>
            <span className="text-[11px] text-amber-400 font-bold">
              {showQr ? 'Hide QR' : 'Show QR'}
            </span>
          </button>

          {showQr && (
            <div className="mt-3 p-4 bg-slate-800/90 border border-slate-700 rounded-xl flex flex-col items-center text-center animate-in zoom-in-95 duration-150">
              <div className="p-2 bg-white rounded-xl shadow-md mb-2">
                <img
                  src={qrUrl}
                  alt="App QR Code"
                  className="w-44 h-44 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Phone ke Camera ya Google Lens se Scan karein aur instant chalaayein!
              </p>
            </div>
          )}
        </div>

        {/* Hindi / English instructions on how to install on phone */}
        <div className="bg-slate-800/60 border border-slate-750 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <Smartphone className="w-4 h-4" />
            <span>Mobile Home Screen Par Kaise Daalein (Install App):</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 pl-1">
            <li>Link ko apne phone ke <strong>Chrome browser</strong> me kholein.</li>
            <li>Browser ke top-right <strong>3 dots (⋮)</strong> par click karein.</li>
            <li><strong>"Add to Home screen" (होम स्क्रीन में जोड़ें)</strong> ya <strong>"Install App"</strong> par tap karein.</li>
            <li>Ab ye aapke phone par ek real mobile app ki tarah save ho jayegi!</li>
          </ol>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Band Karein (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

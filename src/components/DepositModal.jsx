import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getUserWalletAddress } from '../data/mockData.js';

export default function DepositModal({ open, onClose, onCopy, userEmail }) {
  const [copied, setCopied] = useState(false);
  const walletAddress = getUserWalletAddress(userEmail);

  if (!open) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      onCopy('Address copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopy('Copy failed. Please copy manually.', 'error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md" onClick={onClose} />
      <div className="modal-card relative bg-[#1E293B] rounded-3xl p-6 w-full max-w-sm shadow-2xl z-10 border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-100">Top Up / Deposit</h3>
            <p className="text-xs text-slate-400 mt-0.5">Send crypto to this wallet</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors border border-white/5"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center mb-5">
          <div className="p-3 rounded-2xl border border-white/10 bg-slate-100 shadow-inner">
          <QRCodeSVG value={walletAddress} size={160} fgColor="#0F172A" bgColor="#F1F5F9" level="H" />
          </div>
        </div>

        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold text-center mb-2">
          BTC Wallet Address
        </p>
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-3 border border-white/10 mb-4">
          <p className="text-xs font-mono text-slate-300 flex-1 truncate">{walletAddress}</p>
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 w-7 h-7 rounded-lg text-white flex items-center justify-center transition-colors ${
              copied ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-brand-accent hover:bg-brand-accentHover shadow-lg shadow-brand-accent/20'
            }`}
            title="Copy address"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
          <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-amber-500/80">Only send BTC to this address. Sending other assets may result in permanent loss.</p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-700 text-white font-semibold text-sm py-3 rounded-2xl hover:bg-slate-600 transition-all shadow-lg shadow-slate-900/20"
        >
          Close
        </button>
      </div>
    </div>
  );
}

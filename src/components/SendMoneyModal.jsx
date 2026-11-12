// Send Money flow — collects recipient account + amount, then either shows
// the admin-written review modal popup (when enabled) or the standard confirm step.

import { useState } from 'react';
import { DEFAULT_SEND_REVIEW_MESSAGE } from '../data/mockData.js';

export default function SendMoneyModal({
  open,
  onClose,
  userBalance = 0,
  reviewPopupEnabled = false,
  reviewPopupMessage = '',
  globalReviewPopupMessage = '',
}) {
  const [step, setStep]   = useState('details');
  const [form, setForm]   = useState({ accountNumber: '', accountName: '', bankName: '', amount: '', note: '' });
  const [error, setError] = useState('');

  if (!open) return null;

  const resolvedAdminMessage =
    (reviewPopupMessage && reviewPopupMessage.trim()) ||
    (globalReviewPopupMessage && globalReviewPopupMessage.trim()) ||
    DEFAULT_SEND_REVIEW_MESSAGE;

  function handleNext(e) {
    e.preventDefault();
    setError('');
    const amt = parseFloat(form.amount);
    if (!form.accountNumber.trim()) { setError('Please enter an account number.'); return; }
    if (!form.accountName.trim())   { setError('Please enter the account holder name.'); return; }
    if (!form.amount || isNaN(amt) || amt <= 0) { setError('Please enter a valid amount.'); return; }
    if (amt > userBalance) { setError(`Insufficient balance. Your available balance is $${userBalance.toLocaleString()}.`); return; }
    if (reviewPopupEnabled) {
      setStep('adminPopup');
      return;
    }
    setStep('confirm');
  }

  function handleConfirm() {
    setStep('submitted');
  }

  function handleClose() {
    setStep('details');
    setForm({ accountNumber: '', accountName: '', bankName: '', amount: '', note: '' });
    setError('');
    onClose();
  }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-all';
  const inputStyle = {
    background: 'var(--surface-high)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
  };

  // Dedicated centered modal when admin Review Popup is triggered
  if (step === 'adminPopup') {
    const formattedAmt = Number.isFinite(parseFloat(form.amount))
      ? `$${parseFloat(form.amount).toLocaleString()}`
      : '$0';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="modal-overlay absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md" onClick={handleClose} />
        <div
          className="modal-card relative z-10 w-full max-w-sm rounded-3xl p-5 sm:p-6 max-h-[90dvh] overflow-y-auto shadow-2xl animate-scaleIn"
          style={{
            background: '#1E293B',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-1)' }}>
              Transfer Review
            </h3>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors border border-white/5 flex-shrink-0"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col items-center text-center">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)' }}
            >
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div
              className="w-full rounded-xl px-3.5 py-2.5 mb-4 flex items-center justify-between gap-2 text-xs"
              style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.22)' }}
            >
              <span className="truncate min-w-0 text-left" style={{ color: 'var(--text-2)' }}>
                To: <strong style={{ color: 'var(--text-1)' }}>{form.accountName}</strong>
              </span>
              <span className="font-bold text-cyan-400 flex-shrink-0 tabular-nums">{formattedAmt}</span>
            </div>

            <p
              className="text-sm leading-relaxed whitespace-pre-line break-words mb-6 px-1"
              style={{ color: 'var(--text-2)' }}
            >
              {resolvedAdminMessage}
            </p>
          </div>

          {/* Actions */}
          <button
            type="button"
            onClick={handleClose}
            className="w-full bg-slate-700 text-white font-semibold text-sm py-3 rounded-2xl hover:bg-slate-600 transition-all shadow-lg shadow-slate-900/20"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => setStep('details')}
            className="w-full mt-2.5 py-2 text-xs font-semibold transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Edit transfer details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="modal-overlay absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md" onClick={handleClose} />

      <div
        className="modal-card relative z-10 w-full max-w-md rounded-3xl animate-slideInUp max-h-[90dvh] overflow-y-auto shadow-2xl"
        style={{ background: '#0D1F35', border: '1px solid rgba(6,182,212,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="#06B6D4" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7M12 3v18" />
              </svg>
            </div>
            <p className="font-display font-bold text-base truncate" style={{ color: 'var(--text-1)' }}>
              Send Money
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors border border-white/5 flex-shrink-0"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5">
          {/* ── STEP 1: Details ── */}
          {step === 'details' && (
            <form onSubmit={handleNext} className="space-y-4">
              <div
                className="flex items-center justify-between gap-2 rounded-2xl p-3 mb-2"
                style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}
              >
                <span className="text-xs" style={{ color: 'var(--text-2)' }}>Available balance</span>
                <span className="text-sm font-bold text-cyan-400 tabular-nums">${userBalance.toLocaleString()}</span>
              </div>

              {error && (
                <div
                  className="px-3 py-2.5 rounded-xl text-xs animate-shake"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }}
                >
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Account number</label>
                <input
                  value={form.accountNumber}
                  onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="0123456789"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Account holder name</label>
                <input
                  value={form.accountName}
                  onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Bank / Institution (optional)</label>
                <input
                  value={form.bankName}
                  onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="e.g. Chase, Wells Fargo"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className={`${inputCls} pl-7`}
                    style={inputStyle}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Note (optional)</label>
                <input
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="e.g. Rent payment"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all hover-scale mt-2"
                style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)', boxShadow: '0 4px 16px rgba(6,182,212,0.25)' }}
              >
                Review transfer →
              </button>
            </form>
          )}

          {/* ── STEP 2: Confirm ── */}
          {step === 'confirm' && (
            <div className="animate-fadeIn">
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Please review the details before confirming.</p>
              <div className="space-y-2.5 mb-5">
                {[
                  { label: 'To',      value: form.accountName },
                  { label: 'Account', value: form.accountNumber },
                  { label: 'Bank',    value: form.bankName || '—' },
                  { label: 'Amount',  value: `$${parseFloat(form.amount).toLocaleString()}` },
                  { label: 'Note',    value: form.note || '—' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center gap-3 px-3.5 py-2.5 rounded-xl"
                    style={{ background: 'var(--surface-high)', border: '1px solid var(--border)' }}
                  >
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="text-xs font-semibold text-right break-words min-w-0" style={{ color: 'var(--text-1)' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div
                className="flex items-start gap-2 rounded-xl p-3 mb-5"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs text-amber-400">Transfers are processed by our team within 1–2 business hours.</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all border"
                  style={{ background: 'var(--surface-high)', borderColor: 'var(--border)', color: 'var(--text-2)' }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover-scale"
                  style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)' }}
                >
                  Confirm & Send
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Submitted ── */}
          {step === 'submitted' && (
            <div className="flex flex-col items-center py-6 text-center animate-scaleIn">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold mb-1" style={{ color: 'var(--text-1)' }}>Transfer Submitted</h3>
              <p className="text-sm mb-1" style={{ color: 'var(--text-2)' }}>
                Your request to send <span className="text-cyan-400 font-semibold">${parseFloat(form.amount).toLocaleString()}</span> to{' '}
                <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{form.accountName}</span> has been received.
              </p>
              <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Our team will process it within 1–2 business hours.</p>
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)' }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

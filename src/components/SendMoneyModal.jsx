// Send Money flow — collects recipient account + amount, then routes to support ticket
// (actual transfer execution is handled by the backend/admin)

import { useState } from 'react';

const STEPS = ['details', 'confirm', 'submitted'];

export default function SendMoneyModal({ open, onClose, userBalance = 0 }) {
  const [step, setStep]           = useState('details');
  const [form, setForm]           = useState({ accountNumber: '', accountName: '', bankName: '', amount: '', note: '' });
  const [error, setError]         = useState('');

  if (!open) return null;

  function handleNext(e) {
    e.preventDefault();
    setError('');
    const amt = parseFloat(form.amount);
    if (!form.accountNumber.trim()) { setError('Please enter an account number.'); return; }
    if (!form.accountName.trim())   { setError('Please enter the account holder name.'); return; }
    if (!form.amount || isNaN(amt) || amt <= 0) { setError('Please enter a valid amount.'); return; }
    if (amt > userBalance) { setError(`Insufficient balance. Your available balance is $${userBalance.toLocaleString()}.`); return; }
    setStep('confirm');
  }

  function handleConfirm() {
    // In a real app this would call the backend. Here we show the submitted state.
    setStep('submitted');
  }

  function handleClose() {
    setStep('details');
    setForm({ accountNumber: '', accountName: '', bankName: '', amount: '', note: '' });
    setError('');
    onClose();
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none transition-all';
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.2)' };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div
        className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl animate-slideInUp"
        style={{ background: '#0D1F35', border: '1px solid rgba(6,182,212,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <svg className="w-4 h-4" fill="none" stroke="#06B6D4" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7M12 3v18" />
              </svg>
            </div>
            <p className="font-display font-bold text-slate-100 text-base">Send Money</p>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">

          {/* ── STEP 1: Details ── */}
          {step === 'details' && (
            <form onSubmit={handleNext} className="space-y-4">
              <div
                className="flex items-center justify-between rounded-2xl p-3 mb-2"
                style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}
              >
                <span className="text-xs text-slate-400">Available balance</span>
                <span className="text-sm font-bold text-cyan-400">${userBalance.toLocaleString()}</span>
              </div>

              {error && (
                <div className="px-3 py-2.5 rounded-xl text-xs animate-shake"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Account number</label>
                <input value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))}
                  className={inputCls} style={inputStyle} placeholder="0123456789"
                  onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(6,182,212,0.2)'} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Account holder name</label>
                <input value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))}
                  className={inputCls} style={inputStyle} placeholder="John Doe"
                  onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(6,182,212,0.2)'} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Bank / Institution (optional)</label>
                <input value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}
                  className={inputCls} style={inputStyle} placeholder="e.g. Chase, Wells Fargo"
                  onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(6,182,212,0.2)'} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
                  <input type="number" min="1" step="0.01" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className={`${inputCls} pl-7`} style={inputStyle} placeholder="0.00"
                    onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(6,182,212,0.2)'} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Note (optional)</label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  className={inputCls} style={inputStyle} placeholder="e.g. Rent payment"
                  onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(6,182,212,0.2)'} />
              </div>

              <button type="submit"
                className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all hover-scale mt-2"
                style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)', boxShadow: '0 4px 16px rgba(6,182,212,0.25)' }}>
                Review transfer →
              </button>
            </form>
          )}

          {/* ── STEP 2: Confirm ── */}
          {step === 'confirm' && (
            <div className="animate-fadeIn">
              <p className="text-xs text-slate-400 mb-4">Please review the details before confirming.</p>
              <div className="space-y-2.5 mb-5">
                {[
                  { label: 'To',      value: form.accountName },
                  { label: 'Account', value: form.accountNumber },
                  { label: 'Bank',    value: form.bankName || '—' },
                  { label: 'Amount',  value: `$${parseFloat(form.amount).toLocaleString()}` },
                  { label: 'Note',    value: form.note || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="text-xs font-semibold text-slate-200">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 rounded-xl p-3 mb-5"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs text-amber-400/80">Transfers are processed by our team within 1–2 business hours.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('details')}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold text-slate-300 transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Edit
                </button>
                <button onClick={handleConfirm}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover-scale"
                  style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)' }}>
                  Confirm & Send
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Submitted ── */}
          {step === 'submitted' && (
            <div className="flex flex-col items-center py-6 text-center animate-scaleIn">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-100 mb-1">Transfer Submitted</h3>
              <p className="text-sm text-slate-400 mb-1">
                Your request to send <span className="text-cyan-400 font-semibold">${parseFloat(form.amount).toLocaleString()}</span> to <span className="text-white font-semibold">{form.accountName}</span> has been received.
              </p>
              <p className="text-xs text-slate-500 mb-6">Our team will process it within 1–2 business hours.</p>
              <button onClick={handleClose}
                className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)' }}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

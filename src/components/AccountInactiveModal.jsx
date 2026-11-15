import React, { useState } from 'react';
import { formatTelegramUrl, formatWhatsappUrl } from '../utils/contactConfig.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AccountInactiveModal({ user, onSignOut }) {
  const { refreshUser } = useAuth() || {};
  const [checking, setChecking] = useState(false);

  const telegramTarget = user?.globalTelegramHandle || '';
  const whatsappTarget = user?.globalWhatsappNumber || '';
  const prefilledText = `Hello Support, my account (${user?.email || user?.accountNumber || 'holder'}) is marked as inactive. Please assist me with account verification.`;

  const handleOpenWhatsApp = () => {
    const url = formatWhatsappUrl(whatsappTarget, prefilledText);
    window.open(url || 'https://wa.me/', '_blank', 'noopener,noreferrer');
  };

  const handleOpenTelegram = () => {
    const url = formatTelegramUrl(telegramTarget, prefilledText);
    window.open(url || 'https://t.me/', '_blank', 'noopener,noreferrer');
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      if (refreshUser) {
        await refreshUser();
      } else {
        window.location.reload();
      }
    } finally {
      setTimeout(() => setChecking(false), 800);
    }
  };

  const writtenMessage = (user?.inactiveMessage && user.inactiveMessage.trim())
    ? user.inactiveMessage
    : 'Your account has been temporarily placed on inactive status by the administration. All trading, withdrawals, and account activities are paused until verification is resolved. Please contact customer support immediately to reactivate your account.';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{
        background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.92) 0%, rgba(3, 7, 18, 0.97) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden transition-all my-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(26, 16, 26, 0.85) 0%, rgba(10, 16, 32, 0.95) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          boxShadow: '0 30px 80px -15px rgba(239, 68, 68, 0.25), 0 0 40px rgba(239, 68, 68, 0.1)',
        }}
      >
        {/* Top ambient glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none blur-3xl"
          style={{ background: 'rgba(239, 68, 68, 0.2)' }}
        />

        {/* Warning Badge Icon */}
        <div className="relative inline-flex items-center justify-center mb-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.05))',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              boxShadow: '0 0 25px rgba(239, 68, 68, 0.25)',
            }}
          >
            <svg className="w-8 h-8 text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[#0a1020]"></span>
          </span>
        </div>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-3 bg-red-500/10 text-red-400 border border-red-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Account Inactive
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 tracking-tight font-display">
          Notice from Administration
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          {user?.fullName ? `${user.fullName} • ` : ''}
          Account #{user?.accountNumber || '••••••••'}
        </p>

        {/* Admin Written Message Card */}
        <div
          className="rounded-2xl p-4 sm:p-5 mb-6 text-left relative overflow-hidden"
          style={{
            background: 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <div className="flex items-center gap-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-red-400">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Official Administrator Notice</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-medium break-words">
            {writtenMessage}
          </p>
        </div>

        {/* Direct Support Contact Buttons */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Contact Official Support
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="px-3 py-2.5 rounded-xl font-semibold text-xs text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-sm group"
              style={{
                background: 'linear-gradient(135deg, rgba(37,211,102,0.2), rgba(37,211,102,0.1))',
                border: '1px solid rgba(37,211,102,0.35)',
              }}
            >
              <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
              </div>
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleOpenTelegram}
              className="px-3 py-2.5 rounded-xl font-semibold text-xs text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-sm group"
              style={{
                background: 'linear-gradient(135deg, rgba(34,158,217,0.2), rgba(34,158,217,0.1))',
                border: '1px solid rgba(34,158,217,0.35)',
              }}
            >
              <div className="w-5 h-5 rounded-full bg-[#229ED9] flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.56 8.16l-2.02 9.54c-.15.68-.56.84-1.12.52l-3.08-2.27-1.49 1.43c-.16.17-.3.3-.62.3l.22-3.13 5.7-5.15c.25-.22-.05-.34-.38-.12l-7.05 4.44-3.04-.95c-.66-.21-.67-.66.14-.98l11.89-4.58c.55-.2 1.03.13.85.95z"/>
                </svg>
              </div>
              <span>Telegram</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: Refresh Status & Sign Out */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full py-3 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
            }}
          >
            <svg
              className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{checking ? 'Checking Status...' : 'Check Status / Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

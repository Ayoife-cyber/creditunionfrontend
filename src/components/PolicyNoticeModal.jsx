// PolicyNoticeModal.jsx
// Displays an admin-written Operational Policy / Maintenance Notice overlay when the user logs in or visits the dashboard.
// The user can manually close / acknowledge it and continue operating their account normally.

import { useState } from 'react';

const TYPE_CONFIG = {
  maintenance: {
    badge: 'System Maintenance Active',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeBorder: 'rgba(245, 158, 11, 0.35)',
    badgeColor: '#F59E0B',
    iconBg: 'rgba(245, 158, 11, 0.12)',
    iconColor: '#F59E0B',
    accentBorder: 'rgba(245, 158, 11, 0.25)',
    glowColor: 'rgba(245, 158, 11, 0.15)',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    ),
    defaultText: 'Our core banking network is currently undergoing scheduled system maintenance to enhance transaction throughput and platform security. Daily operations, monitoring, and balance functions remain accessible. Certain transfers or settlement confirmations may experience brief processing windows. Your account balances and funds remain 100% secure.',
    statusSummary: 'Scheduled Maintenance in Progress • Account Operations Active',
  },
  policy: {
    badge: 'Operational Policy Notice',
    badgeBg: 'rgba(20, 184, 166, 0.15)',
    badgeBorder: 'rgba(20, 184, 166, 0.35)',
    badgeColor: '#14B8A6',
    iconBg: 'rgba(20, 184, 166, 0.12)',
    iconColor: '#14B8A6',
    accentBorder: 'rgba(20, 184, 166, 0.25)',
    glowColor: 'rgba(20, 184, 166, 0.15)',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    defaultText: 'Please review the updated operational policy regarding your account: In accordance with standard international banking clearance and compliance protocols, fund deposits and withdrawals follow structured clearing cycles. Account holders must ensure valid verification records are maintained. You may dismiss this notice and continue operating your account.',
    statusSummary: 'Official Operational Terms & Clearance Guidelines',
  },
  advisory: {
    badge: 'Account Advisory Notice',
    badgeBg: 'rgba(6, 182, 212, 0.15)',
    badgeBorder: 'rgba(6, 182, 212, 0.35)',
    badgeColor: '#06B6D4',
    iconBg: 'rgba(6, 182, 212, 0.12)',
    iconColor: '#06B6D4',
    accentBorder: 'rgba(6, 182, 212, 0.25)',
    glowColor: 'rgba(6, 182, 212, 0.15)',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    defaultText: 'Administrative advisory regarding platform operations: All account balances and active positions are actively synchronized. Please ensure your contact details remain up to date. For expedited transaction settlement or special inquiries, please reach out to dedicated account support.',
    statusSummary: 'Important Information Regarding Account Operations',
  },
  urgent: {
    badge: 'Priority Administrative Notice',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    badgeBorder: 'rgba(239, 68, 68, 0.35)',
    badgeColor: '#EF4444',
    iconBg: 'rgba(239, 68, 68, 0.12)',
    iconColor: '#EF4444',
    accentBorder: 'rgba(239, 68, 68, 0.25)',
    glowColor: 'rgba(239, 68, 68, 0.15)',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    ),
    defaultText: 'Important administrative notice: Critical operational maintenance is currently taking place. Transactions may require secondary clearance confirmation before settling into your account balance. Please acknowledge this advisory to proceed.',
    statusSummary: 'Urgent System Operational Advisory',
  },
};

export default function PolicyNoticeModal({ user, onClose }) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!user || !user.policyNoticeEnabled) return null;

  const type = user.policyNoticeType || 'maintenance';
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.maintenance;
  const title = user.policyNoticeTitle?.trim() || 'Operational Policy & Account Maintenance Notice';
  const message = user.policyNoticeMessage?.trim() || cfg.defaultText;

  function handleDismiss() {
    // Record in sessionStorage so it doesn't interrupt the user during their active browsing session
    try {
      const key = `policy_notice_closed_${user.email || user.id || 'current'}`;
      sessionStorage.setItem(key, 'true');
    } catch {}
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Blurred Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={handleDismiss}
      />

      {/* Modal Card */}
      <div
        className="relative z-10 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl animate-scaleUp overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #0e1e36 0%, #091322 100%)',
          border: `1px solid ${cfg.accentBorder}`,
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.7), 0 0 40px ${cfg.glowColor}`,
        }}
      >
        {/* Subtle decorative glow orb */}
        <div
          className="absolute -top-16 -right-16 w-44 h-44 rounded-full pointer-events-none blur-3xl opacity-30"
          style={{ background: cfg.badgeColor }}
        />

        {/* Header row: Badge, Title & Close Button */}
        <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner"
              style={{ background: cfg.iconBg, border: `1px solid ${cfg.badgeBorder}` }}
            >
              <svg className="w-5 h-5" fill="none" stroke={cfg.iconColor} viewBox="0 0 24 24">
                {cfg.icon}
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                  style={{ background: cfg.badgeBg, border: `1px solid ${cfg.badgeBorder}`, color: cfg.badgeColor }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: cfg.badgeColor }} />
                  {cfg.badge}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Official Notice</span>
              </div>
              <h2 className="text-base sm:text-lg font-display font-bold text-slate-100 leading-snug">
                {title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all flex-shrink-0 bg-white/5 hover:bg-white/10 border border-white/10"
            title="Close notice and continue"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body: Operational Notice Details */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-left custom-scrollbar">
          {/* Status summary pill */}
          <div
            className="p-3 rounded-2xl flex items-center gap-3"
            style={{ background: cfg.iconBg, border: `1px solid ${cfg.badgeBorder}` }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.badgeColor }} />
            <p className="text-xs font-semibold text-slate-200">
              {cfg.statusSummary}
            </p>
          </div>

          {/* Admin Written Message Content */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/35 border border-white/10">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <span>📋</span> Administrative Advisory & Policy Terms:
            </p>
            <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans font-normal">
              {message}
            </div>
          </div>

          {/* Security & Operation Assurance Guarantee */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2 text-slate-300">
              <span className="text-emerald-400 text-sm">🔒</span>
              <span>Funds 100% Protected</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2 text-slate-300">
              <span className="text-cyan-400 text-sm">⚡</span>
              <span>Full Account Access</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 italic text-center">
            You can dismiss this modal at any time to continue operating your account normally.
          </p>
        </div>

        {/* Footer Actions: Dismiss & Continue Operating */}
        <div className="pt-4 mt-4 border-t border-white/10 flex-shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              boxShadow: '0 4px 18px rgba(6, 182, 212, 0.3)',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            I Understand & Continue to Account
          </button>
        </div>
      </div>
    </div>
  );
}

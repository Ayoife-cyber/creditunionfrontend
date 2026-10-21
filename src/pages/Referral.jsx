import { useState, useMemo } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Deterministic referral code from user email
function generateCode(email = '') {
  const base = email.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'SHUA';
  const num  = String(email.length * 7 + 13).padStart(4, '0');
  return `${base}${num}`;
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Share your code',
    desc: 'Send your unique referral code or link to friends and family.',
    icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
    color: '#06B6D4',
  },
  {
    step: '02',
    title: 'They sign up',
    desc: 'Your friend creates an account and completes their first deposit.',
    icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
    color: '#8B5CF6',
  },
  {
    step: '03',
    title: 'Both get rewarded',
    desc: 'You earn $25 credit and your friend gets $10 on their first deposit.',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: '#10B981',
  },
];

export default function ReferralPage() {
  const { user } = useAuth();
  const code        = useMemo(() => generateCode(user?.email), [user?.email]);
  const referralUrl = `https://shughar.io/signup?ref=${code}`;
  const [codeCopied, setCodeCopied] = useState(false);
  const [urlCopied,  setUrlCopied]  = useState(false);

  async function copy(text, setter) {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch { /* ignore */ }
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({ title: 'Join Shughar Credit Union', text: `Use my referral code ${code} to sign up and earn $10 free!`, url: referralUrl });
    } else {
      copy(referralUrl, setUrlCopied);
    }
  }

  return (
    <AppLayout title="Refer & Earn">
      <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto space-y-6 animate-fadeIn">

        {/* Hero card */}
        <div
          className="relative rounded-[28px] p-8 overflow-hidden text-center"
          style={{ background: 'linear-gradient(135deg, #0C2D4A, #0F3B55)', border: '1px solid rgba(6,182,212,0.25)' }}
        >
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'rgba(6,182,212,0.1)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'rgba(139,92,246,0.08)' }} />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.25)' }}>
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-display text-3xl font-black text-white mb-2">Refer & Earn</h2>
            <p className="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
              Invite friends to Shughar. You earn <span className="text-cyan-400 font-bold">$25</span> for each friend who signs up and deposits. They get <span className="text-emerald-400 font-bold">$10</span> free.
            </p>
          </div>
        </div>

        {/* Referral code card */}
        <div className="glass-card rounded-[28px] p-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">Your referral code</p>

          {/* Code display */}
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-4 mb-3"
            style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}
          >
            <span className="font-display font-black text-2xl tracking-[0.25em] text-cyan-400">{code}</span>
            <button
              onClick={() => copy(code, setCodeCopied)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: codeCopied ? 'rgba(16,185,129,0.15)' : 'rgba(6,182,212,0.12)',
                color: codeCopied ? '#10B981' : '#06B6D4',
                border: `1px solid ${codeCopied ? 'rgba(16,185,129,0.25)' : 'rgba(6,182,212,0.25)'}`,
              }}
            >
              {codeCopied ? (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Copied!</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy code</>
              )}
            </button>
          </div>

          {/* Referral link */}
          <div
            className="flex items-center gap-2 rounded-2xl px-3 py-3 mb-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="text-xs font-mono text-slate-400 flex-1 truncate">{referralUrl}</p>
            <button
              onClick={() => copy(referralUrl, setUrlCopied)}
              className="flex-shrink-0 text-xs font-semibold transition-all"
              style={{ color: urlCopied ? '#10B981' : '#06B6D4' }}
            >
              {urlCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Share button */}
          <button
            onClick={shareNative}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all hover-scale flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)', boxShadow: '0 4px 16px rgba(6,182,212,0.25)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share your referral link
          </button>
        </div>

        {/* How it works */}
        <div className="glass-card rounded-[28px] p-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-5">How it works</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl p-4 flex flex-col gap-3"
                style={{ background: `${item.color}08`, border: `1px solid ${item.color}18` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${item.color}15` }}>
                    <svg className="w-4 h-4" fill="none" stroke={item.color} strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-xs font-black" style={{ color: `${item.color}60` }}>{item.step}</span>
                </div>
                <p className="text-sm font-bold text-slate-200">{item.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings summary placeholder */}
        <div
          className="rounded-2xl p-5 flex items-center justify-between"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.12)' }}>
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">0 referrals so far</p>
              <p className="text-xs text-slate-500">Share your code to start earning</p>
            </div>
          </div>
          <p className="font-display text-xl font-black text-emerald-400">$0</p>
        </div>
      </div>
    </AppLayout>
  );
}

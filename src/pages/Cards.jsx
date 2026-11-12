import { useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import SupportTicketDrawer from '../components/SupportTicketDrawer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function DetailCard({ label, value, sub, icon, color }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2.5 transition-all"
      style={{ background: `${color}08`, border: `1px solid ${color}20` }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15` }}
        >
          <svg className="w-4 h-4" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <p
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: 'var(--text-2)' }}
        >
          {label}
        </p>
      </div>
      <p className="font-display text-xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function PhysicalCardOrderModal({ open, onClose, onMessageSupport, user }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || user?.cardHolderName || '',
    email: user?.email || '',
    mailingAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://formspree.io/f/mdegnnpa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: 'Physical card order request - $50.99',
          orderType: 'Physical card',
          price: '$50.99',
          ...form,
        }),
      });

      if (!response.ok) throw new Error('Unable to submit the order request.');
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError.message || 'Unable to submit the order request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close order form" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl" style={{ background: '#0D1F35', border: '1px solid rgba(6,182,212,0.2)' }}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-400">Physical card</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-white">Order your card</h2>
            <p className="mt-2 text-sm text-slate-400">Card order price: <span className="font-semibold text-white">$50.99</span></p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {submitted ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="font-semibold text-emerald-300">Order request submitted</p>
              <p className="mt-1 text-sm text-emerald-200/80">Please message support for payment and delivery follow-up details.</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15">Close</button>
              <button type="button" onClick={onMessageSupport} className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400">Message support</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="card-order-full-name" className="mb-2 block text-xs font-semibold text-slate-300">Full name</label>
              <input id="card-order-full-name" name="fullName" value={form.fullName} onChange={handleChange} required autoComplete="name" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/60" placeholder="Your full name" />
            </div>
            <div>
              <label htmlFor="card-order-email" className="mb-2 block text-xs font-semibold text-slate-300">Email address</label>
              <input id="card-order-email" type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/60" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="card-order-mailing-address" className="mb-2 block text-xs font-semibold text-slate-300">Mailing address</label>
              <textarea id="card-order-mailing-address" name="mailingAddress" value={form.mailingAddress} onChange={handleChange} required autoComplete="street-address" rows="4" className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/60" placeholder="Street, city, state, ZIP/postal code, country" />
            </div>
            {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
            <p className="text-xs text-slate-500">After submitting, message support for payment and delivery follow-up details.</p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-white/10 px-4 py-3 font-semibold text-slate-200 hover:bg-white/15">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Submitting...' : 'Submit order request'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
export default function CardsPage() {
  const { user } = useAuth();
  const cardLocked = user?.isCardLocked || false;

  const cardHolderName = user?.cardHolderName || user?.fullName || 'Member';
  const cardNumber     = user?.cardNumber  || '**** 4821';
  const expiryDate     = user?.expiryDate  || '09/28';
  const cardType       = user?.cardType    || 'Platinum';
  const spendLimit     = user?.spendLimit  || '$8,500';
  const rewards        = user?.rewards     || '4,820 pts';
  const [orderOpen, setOrderOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <AppLayout title="Cards">
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-6 animate-fadeIn">

        {/* Header */}
        <div className="glass-card rounded-[28px] p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Card centre</p>
              <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-1)' }}>Banking cards</h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-2)' }}>
                View your payment card details and rewards. Card controls are managed by our admin team.
              </p>
            </div>
            {/* Lock status badge — read-only, admin-managed */}
            <div
              className={`self-start lg:self-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                cardLocked
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {cardLocked ? (
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                )}
              </svg>
              {cardLocked ? 'Card locked by admin' : 'Card active'}
            </div>
          </div>

          {/* Locked overlay notice */}
          {cardLocked && (
            <div
              className="mt-4 flex items-start gap-3 rounded-2xl p-4 animate-fadeInDown"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-400">Your card has been locked</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  This action was taken by an administrator. Please contact support to have your card reinstated.
                </p>
              </div>
            </div>
          )}

          {/* Physical card */}
          <div className="mt-6 flex justify-center">
            <div
              className={`virtual-debit-card relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 ${cardLocked ? 'grayscale opacity-70' : ''}`}
              style={{
                aspectRatio: '1.586 / 1',
                background: cardLocked
                  ? 'linear-gradient(135deg, #374151 0%, #4B5563 40%, #1F2937 100%)'
                  : 'linear-gradient(135deg, #0A1628 0%, #0D1F35 30%, #0F2A47 60%, #1A3A5C 100%)',
                boxShadow: cardLocked
                  ? '0 20px 40px rgba(0,0,0,0.4)'
                  : '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* Holographic sheen */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 55%, transparent 70%)',
              }} />
              {/* Dot texture */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }} />

              <div className="relative h-full flex flex-col justify-between p-4 sm:p-6 lg:p-8">
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-sm sm:text-base font-bold tracking-wide text-white/90">SHUGHAR</p>
                    <p className="text-[10px] sm:text-xs tracking-[0.2em] text-white/50 uppercase">Credit Union</p>
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                    {cardType}
                  </span>
                </div>

                {/* Chip + Contactless */}
                <div className="flex items-center gap-2 sm:gap-3 -mt-1 sm:-mt-2">
                  <svg viewBox="0 0 50 40" className="w-9 h-7 sm:w-12 sm:h-10 drop-shadow-lg" fill="none">
                    <rect x="1" y="1" width="48" height="38" rx="5" fill="#C9A84C" stroke="#A0832A" strokeWidth="1"/>
                    <rect x="6" y="6" width="14" height="12" rx="2" fill="#D4B65A" stroke="#A0832A" strokeWidth="0.5"/>
                    <rect x="24" y="6" width="20" height="12" rx="2" fill="#D4B65A" stroke="#A0832A" strokeWidth="0.5"/>
                    <rect x="6" y="22" width="20" height="12" rx="2" fill="#D4B65A" stroke="#A0832A" strokeWidth="0.5"/>
                    <rect x="30" y="22" width="14" height="12" rx="2" fill="#D4B65A" stroke="#A0832A" strokeWidth="0.5"/>
                    <line x1="20" y1="6" x2="20" y2="34" stroke="#A0832A" strokeWidth="0.5"/>
                    <line x1="6" y1="20" x2="44" y2="20" stroke="#A0832A" strokeWidth="0.5"/>
                  </svg>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M8.5 16.5a6 6 0 010-9"/>
                    <path d="M12 18a9 9 0 010-12"/>
                    <path d="M5 15a3 3 0 010-6"/>
                  </svg>
                </div>

                {/* Card number */}
                <p className="font-display text-base sm:text-xl lg:text-2xl tracking-[0.18em] sm:tracking-[0.3em] text-white/90 font-medium"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)', fontVariantNumeric: 'tabular-nums' }}>
                  {cardNumber}
                </p>

                {/* Bottom row */}
                <div className="flex items-end justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/40">Cardholder</p>
                    <p className="mt-0.5 text-xs sm:text-sm font-semibold text-white/80 truncate uppercase tracking-wide">{cardHolderName}</p>
                  </div>
                  <div className="text-center mx-3">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/40">Valid thru</p>
                    <p className="mt-0.5 text-xs sm:text-sm font-semibold text-white/80">{expiryDate}</p>
                  </div>
                  <div className="text-center mx-3">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/40">CVV</p>
                    <p className="mt-0.5 text-xs sm:text-sm font-semibold text-white/80 tracking-[0.25em]">•••</p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg viewBox="0 0 60 20" className="w-12 h-4 sm:w-14 sm:h-5">
                      <text x="0" y="16" fill="rgba(255,255,255,0.85)" fontFamily="Arial, sans-serif"
                        fontWeight="bold" fontStyle="italic" fontSize="18" letterSpacing="-0.5">VISA</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Physical card order */}
          <div className="mt-6 flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <div>
              <p className="text-sm font-semibold text-cyan-300">Need a physical card?</p>
              <p className="mt-1 text-sm text-slate-400">Order a physical card for <span className="font-semibold" style={{ color: 'var(--text-1)' }}>$50.99</span>. We will collect your delivery details and support will follow up.</p>
            </div>
            <button type="button" onClick={() => setOrderOpen(true)} className="flex-shrink-0 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400">Order now</button>
          </div>
          {/* Detail cards */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <DetailCard
              label="Card number"
              value={cardNumber}
              sub="Debit card · Primary"
              color="#06B6D4"
              icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
            <DetailCard
              label="Monthly spend limit"
              value={spendLimit}
              sub="Available to spend"
              color="#8B5CF6"
              icon="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
            />
            <DetailCard
              label="Rewards balance"
              value={rewards}
              sub="Points earned to date"
              color="#F59E0B"
              icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </div>

          {/* Admin-only notice */}
          <div
            className="mt-5 flex items-start gap-3 rounded-2xl p-4"
            style={{ background: 'rgba(100,116,139,0.06)', border: '1px solid rgba(100,116,139,0.15)' }}
          >
            <svg className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-slate-400">Card controls are admin-managed</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Card locking, limit updates, and card replacement are handled by our admin team.
                Open a support ticket if you need any changes.
              </p>
            </div>
          </div>
        </div>
      <PhysicalCardOrderModal
        open={orderOpen}
        user={user}
        onClose={() => setOrderOpen(false)}
        onMessageSupport={() => {
          setOrderOpen(false);
          setSupportOpen(true);
        }}
      />
      <SupportTicketDrawer open={supportOpen} onClose={() => setSupportOpen(false)} />      </div>
    </AppLayout>
  );
}

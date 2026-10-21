import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AppLayout from '../components/AppLayout.jsx';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    address: '',
  });

  // Sync form when user loads / changes
  useEffect(() => {
    if (user) {
      setForm({
        fullName:     user.fullName     || '',
        email:        user.email        || '',
        mobileNumber: user.mobileNumber || '',
        address:      user.address      || '',
      });
    }
  }, [user]);

  const displayName = user?.fullName || 'Member';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  function handleSave(e) {
    e.preventDefault();
    updateProfile({
      fullName:     form.fullName,
      email:        form.email,
      mobileNumber: form.mobileNumber,
      address:      form.address,
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleCancel() {
    // Reset to current user values
    setForm({
      fullName:     user?.fullName     || '',
      email:        user?.email        || '',
      mobileNumber: user?.mobileNumber || '',
      address:      user?.address      || '',
    });
    setEditing(false);
  }

  const inputCls =
    'w-full px-3 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none transition-all';
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(6,182,212,0.2)',
  };

  // Read-only rows (not editable by user — admin-managed or system fields)
  const readOnlyDetails = [
    { label: 'Account number', value: user?.accountNumber || 'Not assigned', note: 'Use for transfers and deposits' },
    { label: 'Account type',   value: user?.accountType   || 'Premium Savings', note: 'Managed by your account tier' },
  ];

  return (
    <AppLayout title="Profile">
      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto space-y-5 animate-fadeIn">

        {/* ── Profile card ── */}
        <div className="glass-card rounded-[28px] p-6">

          {/* Header row */}
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black text-white text-xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)', boxShadow: '0 4px 16px rgba(6,182,212,0.3)' }}
              >
                {initials}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: '#475569' }}>Personal profile</p>
                <h2 className="font-display text-2xl font-bold" style={{ color: '#F1F5F9' }}>{displayName}</h2>
                <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>
                  Your profile details are securely managed and synced across your accounts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
              {/* KYC badge */}
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="#10B981" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold leading-tight" style={{ color: '#10B981' }}>KYC Verified</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>Identity confirmed</p>
                </div>
              </div>

              {/* Edit / Save / Cancel buttons */}
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all hover-lift"
                  style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', color: '#06B6D4' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,182,212,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(6,182,212,0.1)'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit profile
                </button>
              ) : null}
            </div>
          </div>

          {/* Success banner */}
          {saved && (
            <div
              className="mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm animate-fadeInDown"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Profile updated successfully.
            </div>
          )}

          {/* ── VIEW MODE ── */}
          {!editing && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                { label: 'Full name',           value: user?.fullName     || 'Not provided', note: 'Primary account holder',        editable: true },
                { label: 'Email address',       value: user?.email        || 'Not provided', note: user?.email ? 'Verified' : 'Add an email',  editable: true },
                { label: 'Phone number',        value: user?.mobileNumber || 'Not provided', note: user?.mobileNumber ? 'SMS alerts enabled' : 'Add a phone number', editable: true },
                { label: 'Residential address', value: user?.address      || 'Not provided', note: user?.address ? 'Primary residence' : 'Tap Edit profile to add', editable: true },
                ...readOnlyDetails.map(r => ({ ...r, editable: false })),
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl p-4 relative"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: item.editable
                      ? '1px solid rgba(255,255,255,0.05)'
                      : '1px solid rgba(255,255,255,0.03)',
                  }}
                >
                  {!item.editable && (
                    <span
                      className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(100,116,139,0.15)', color: '#64748B' }}
                    >
                      system
                    </span>
                  )}
                  <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: '#475569' }}>{item.label}</p>
                  <p className="mt-2 font-display text-lg font-semibold" style={{ color: '#F1F5F9' }}>
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: '#64748B' }}>{item.note}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── EDIT MODE ── */}
          {editing && (
            <form onSubmit={handleSave} className="mt-6 animate-slideInUp">
              <div
                className="rounded-3xl p-5"
                style={{ background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.15)' }}
              >
                <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-400 mb-4">Editing profile</p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full name</label>
                    <input
                      value={form.fullName}
                      onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                      className={inputCls}
                      style={inputStyle}
                      placeholder="Your full name"
                      onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(6,182,212,0.2)'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className={inputCls}
                      style={inputStyle}
                      placeholder="you@example.com"
                      onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(6,182,212,0.2)'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone number</label>
                    <input
                      type="tel"
                      value={form.mobileNumber}
                      onChange={e => setForm(f => ({ ...f, mobileNumber: e.target.value }))}
                      className={inputCls}
                      style={inputStyle}
                      placeholder="+234 800 000 0000"
                      onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(6,182,212,0.2)'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Residential address
                    </label>
                    <input
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      className={inputCls}
                      style={inputStyle}
                      placeholder="Your address"
                      onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(6,182,212,0.2)'}
                    />
                  </div>
                </div>

                {/* Read-only system fields shown in edit mode too */}
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  {readOnlyDetails.map(item => (
                    <div key={item.label}
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-300">{item.value}</p>
                      <p className="text-xs text-slate-600 mt-0.5">Managed by admin — not editable</p>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mt-5">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)', boxShadow: '0 4px 16px rgba(6,182,212,0.25)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Save changes
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

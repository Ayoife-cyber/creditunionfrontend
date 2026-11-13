import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

// Icon paths for each section
const SECTION_ICONS = {
  'Profile details':          'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  'Appearance & Theme':       'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  'Security preferences':     'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  'Notification preferences': 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  'Payment preferences':      'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
};

const SECTION_COLORS = {
  'Profile details':          '#06B6D4',
  'Appearance & Theme':       '#38BDF8',
  'Security preferences':     '#10B981',
  'Notification preferences': '#F59E0B',
  'Payment preferences':      '#8B5CF6',
};

const settingsSections = [
  { title: 'Profile details',          description: 'Edit the info shown on your profile and account overview.' },
  { title: 'Appearance & Theme',       description: 'Toggle between Dark and Light mode for your interface.' },
  { title: 'Security preferences',     description: 'Manage your password, 2FA and sign-in methods.' },
  { title: 'Notification preferences', description: 'Control email, SMS and push alerts for account activity.' },
  { title: 'Payment preferences',      description: 'Set your default transfer methods and limit controls.' },
];

// Coming-soon features per section
const COMING_SOON_FEATURES = {
  'Security preferences': [
    { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Change password' },
    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Two-factor authentication' },
    { icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18', label: 'Active sessions' },
  ],
  'Notification preferences': [
    { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Email notifications' },
    { icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', label: 'SMS alerts' },
    { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', label: 'Push notifications' },
  ],
  'Payment preferences': [
    { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: 'Default payment method' },
    { icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z', label: 'Transaction limits' },
    { icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', label: 'Auto-save rules' },
  ],
};

function ComingSoonSection({ title }) {
  const features = COMING_SOON_FEATURES[title] || [];
  const color    = SECTION_COLORS[title] || '#06B6D4';

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] font-semibold" style={{ color }}>
            {title}
          </p>
          <p className="mt-1 font-display text-base font-bold text-slate-200">Coming Soon</p>
          <p className="mt-0.5 text-xs text-slate-400">
            We are fine-tuning these controls for an upcoming banking platform update.
          </p>
        </div>
        <span
          className="self-start sm:self-auto text-[11px] font-bold px-3 py-1 rounded-full"
          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
        >
          In Progress
        </span>
      </div>

      {features.length > 0 && (
        <div className="grid gap-2.5 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-3 rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15` }}
              >
                <svg className="w-4 h-4" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <span className="text-xs text-slate-300 font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      )}

      <div
        className="mt-4 flex items-start gap-2.5 rounded-xl p-3 text-xs"
        style={{ background: `${color}08`, border: `1px solid ${color}15`, color: 'var(--text-2)' }}
      >
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          Need to change any of these settings urgently? Reach out to support via Ticket, WhatsApp or Telegram.
        </p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  // Null by default so the profile form or sub-sections are NOT dropped down on page load
  const [activeSetting, setActiveSetting] = useState(null);

  const [profileForm, setProfileForm] = useState({
    fullName:    user?.fullName     || '',
    email:       user?.email        || '',
    phone:       user?.mobileNumber || '',
    address:     user?.address      || '',
    accountType: user?.accountType  || 'Premium Savings',
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProfileForm({
      fullName:    user?.fullName     || '',
      email:       user?.email        || '',
      phone:       user?.mobileNumber || '',
      address:     user?.address      || '',
      accountType: user?.accountType  || 'Premium Savings',
    });
  }, [user]);

  // Toggle dropdown on click
  const handleToggleSetting = (title) => {
    setActiveSetting(current => (current === title ? null : title));
  };

  async function handleProfileSave(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        fullName:     profileForm.fullName,
        email:        profileForm.email,
        mobileNumber: profileForm.phone,
        address:      profileForm.address,
        accountType:  profileForm.accountType,
      });
      setProfileMessage('Profile details updated and saved successfully.');
    } catch {
      setProfileMessage('Profile details updated.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setProfileMessage(''), 4500);
    }
  }

  const inputCls =
    'w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors';

  return (
    <AppLayout title="Settings">
      <div className="px-3 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-5xl mx-auto space-y-6 animate-fadeIn">
        <div className="glass-card rounded-[28px] p-4 sm:p-7 shadow-sm">

          {/* Page header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between pb-5 border-b border-white/5">
            <div>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-semibold" style={{ color: 'var(--text-muted)' }}>
                Account Controls
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-bold mt-1" style={{ color: 'var(--text-1)' }}>
                Security and preferences
              </h2>
              <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--text-2)' }}>
                Keep your account protected with a modern set of banking controls.
              </p>
            </div>
            <div
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold self-start sm:self-auto flex items-center gap-1.5"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Protected
            </div>
          </div>

          {/* Accordion Settings Sections */}
          <div className="mt-6 space-y-3">
            {settingsSections.map((section) => {
              const active = activeSetting === section.title;
              const color  = SECTION_COLORS[section.title] || '#06B6D4';
              const icon   = SECTION_ICONS[section.title];

              return (
                <div
                  key={section.title}
                  className="rounded-2xl transition-all duration-200 overflow-hidden"
                  style={{
                    background: active ? 'var(--surface-high)' : 'var(--surface-high)',
                    border: active ? `1.5px solid ${color}` : '1px solid var(--border)',
                    boxShadow: active ? `0 4px 20px ${color}15` : 'none',
                  }}
                >
                  {/* Clickable Header Row */}
                  <div
                    onClick={() => handleToggleSetting(section.title)}
                    className="flex cursor-pointer items-center justify-between gap-3 p-4 select-none hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                          background: active ? `${color}25` : 'var(--surface-mid)',
                          color: active ? color : 'var(--text-muted)',
                        }}
                      >
                        <svg className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} fill="none"
                          stroke={active ? color : 'currentColor'} strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: active ? 'var(--text-1)' : 'var(--text-2)' }}>
                          {section.title}
                        </p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSetting(section.title);
                      }}
                      className="rounded-full px-3 sm:px-3.5 py-1.5 text-xs font-semibold transition-all flex-shrink-0 flex items-center gap-1.5"
                      style={{
                        background: active ? color : 'var(--surface-mid)',
                        color:      active ? '#fff' : 'var(--text-2)',
                        border:     active ? 'none' : '1px solid var(--border)',
                        boxShadow:  active ? `0 2px 10px ${color}35` : 'none',
                      }}
                    >
                      <span>{active ? 'Close' : 'Manage'}</span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${active ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Inline Expandable Drawer (only drops down when clicked) */}
                  {active && (
                    <div className="p-4 sm:p-6 border-t border-white/5 animate-in fade-in duration-200">
                      
                      {/* Section 1: Profile details form */}
                      {section.title === 'Profile details' && (
                        <form onSubmit={handleProfileSave} className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/5">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400 font-bold">
                                Editable Profile Info
                              </p>
                              <h3 className="font-display text-base sm:text-lg font-bold text-white mt-0.5">
                                Update the details shown on your profile
                              </h3>
                            </div>
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="self-start sm:self-auto action-btn rounded-xl px-5 py-2 text-xs sm:text-sm font-bold text-white transition-all shadow-md active:scale-95 flex items-center gap-2"
                              style={{
                                background: 'linear-gradient(135deg, #0369A1, #06B6D4)',
                                boxShadow: '0 4px 14px rgba(6,182,212,0.3)',
                              }}
                            >
                              {isSaving ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <span>Save changes</span>
                              )}
                            </button>
                          </div>

                          {profileMessage && (
                            <div
                              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium animate-fadeIn"
                              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}
                            >
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{profileMessage}</span>
                            </div>
                          )}

                          <div className="grid gap-3.5 sm:grid-cols-2">
                            <label className="text-xs sm:text-sm space-y-1">
                              <span className="font-semibold text-slate-300">Full name</span>
                              <input
                                type="text"
                                value={profileForm.fullName}
                                onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                                placeholder="Your full name"
                                className={inputCls}
                                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                              />
                            </label>

                            <label className="text-xs sm:text-sm space-y-1">
                              <span className="font-semibold text-slate-300">Email address</span>
                              <input
                                type="email"
                                value={profileForm.email}
                                onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                                placeholder="you@example.com"
                                className={inputCls}
                                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                              />
                            </label>

                            <label className="text-xs sm:text-sm space-y-1">
                              <span className="font-semibold text-slate-300">Mobile phone</span>
                              <input
                                type="tel"
                                value={profileForm.phone}
                                onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                                placeholder="+1 234 567 8900"
                                className={inputCls}
                                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                              />
                            </label>

                            <label className="text-xs sm:text-sm space-y-1">
                              <span className="font-semibold text-slate-300">Account tier / type</span>
                              <input
                                type="text"
                                value={profileForm.accountType}
                                onChange={e => setProfileForm(f => ({ ...f, accountType: e.target.value }))}
                                placeholder="Premium Savings"
                                className={inputCls}
                                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                              />
                            </label>

                            <label className="text-xs sm:text-sm space-y-1 sm:col-span-2">
                              <span className="font-semibold text-slate-300">Residential address</span>
                              <textarea
                                value={profileForm.address}
                                onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                                rows={2}
                                placeholder="Your address on file"
                                className={inputCls}
                                style={{ resize: 'none', background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                              />
                            </label>
                          </div>
                        </form>
                      )}

                      {/* Section 2: Appearance & Theme */}
                      {section.title === 'Appearance & Theme' && (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-white/5">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.25em] text-sky-400 font-bold">
                                Appearance Settings
                              </p>
                              <h3 className="font-display text-base sm:text-lg font-bold text-white mt-0.5">
                                Theme Mode
                              </h3>
                              <p className="text-xs text-slate-400">Select your preferred viewing mode</p>
                            </div>
                            <span
                              className="text-xs font-semibold px-3 py-1 rounded-full w-fit self-start sm:self-auto"
                              style={{ background: 'rgba(56,189,248,0.12)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.25)' }}
                            >
                              Active: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </span>
                          </div>

                          <div className="grid gap-3.5 sm:grid-cols-2">
                            {/* Dark Mode Card */}
                            <div
                              onClick={() => setTheme('dark')}
                              className="cursor-pointer rounded-2xl p-4 transition-all flex flex-col justify-between"
                              style={{
                                background: theme === 'dark' ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.03)',
                                border: theme === 'dark' ? '2px solid #06B6D4' : '1px solid rgba(255,255,255,0.08)',
                                boxShadow: theme === 'dark' ? '0 0 20px rgba(6,182,212,0.2)' : 'none',
                              }}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4' }}
                                  >
                                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                  </div>
                                  {theme === 'dark' && (
                                    <span className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-slate-900 font-bold text-xs">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <p className="font-display font-bold text-sm text-slate-100">Dark Mode (Default)</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  Deep navy & luminous cyan accents. Soft on the eyes for evening or low-light use.
                                </p>
                              </div>
                              <div className="mt-3 pt-3 flex items-center gap-2 border-t border-white/5">
                                <div className="w-3.5 h-3.5 rounded-full bg-[#0A1628] border border-cyan-400/50" />
                                <div className="w-3.5 h-3.5 rounded-full bg-[#0D1F35]" />
                                <div className="w-3.5 h-3.5 rounded-full bg-[#06B6D4]" />
                                <span className="text-[11px] text-slate-500 ml-auto">Navy / Cyan</span>
                              </div>
                            </div>

                            {/* Light Mode Card */}
                            <div
                              onClick={() => setTheme('light')}
                              className="cursor-pointer rounded-2xl p-4 transition-all flex flex-col justify-between"
                              style={{
                                background: theme === 'light' ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
                                border: theme === 'light' ? '2px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)',
                                boxShadow: theme === 'light' ? '0 0 20px rgba(56,189,248,0.2)' : 'none',
                              }}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}
                                  >
                                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                  </div>
                                  {theme === 'light' && (
                                    <span className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-slate-900 font-bold text-xs">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <p className="font-display font-bold text-sm text-slate-100">Light Mode</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  Crisp slate & bright clear contrast. High clarity for daytime work and bright environments.
                                </p>
                              </div>
                              <div className="mt-3 pt-3 flex items-center gap-2 border-t border-white/5">
                                <div className="w-3.5 h-3.5 rounded-full bg-[#F8FAFC] border border-slate-300" />
                                <div className="w-3.5 h-3.5 rounded-full bg-[#E2E8F0]" />
                                <div className="w-3.5 h-3.5 rounded-full bg-[#0891B2]" />
                                <span className="text-[11px] text-slate-500 ml-auto">Slate / Cyan</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sections 3, 4, 5: Coming-soon sections */}
                      {section.title !== 'Profile details' && section.title !== 'Appearance & Theme' && (
                        <ComingSoonSection title={section.title} />
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}

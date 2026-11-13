import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatTelegramUrl, formatWhatsappUrl } from '../utils/contactConfig.js';
import { authApi } from '../api/client.js';

export default function TopBar({
  title = 'Dashboard', user, notifications, hasUnread,
  onOpenNotifications, onClearNotifications, onOpenDrawer = () => {},
}) {
  const { theme, toggleTheme } = useTheme();
  const [panelOpen, setPanelOpen] = useState(false);
  const [contactSettings, setContactSettings] = useState({ telegramHandle: '', whatsappNumber: '', prefilledMessage: '' });
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const btnRef   = useRef(null);

  useEffect(() => {
    if (!user?.globalTelegramHandle || !user?.globalWhatsappNumber) {
      authApi.getPublicSettings()
        .then(res => {
          if (res) {
            setContactSettings({
              telegramHandle: res.telegramHandle || '',
              whatsappNumber: res.whatsappNumber || '',
              prefilledMessage: res.prefilledMessage || '',
            });
          }
        })
        .catch(() => {});
    }
  }, [user?.globalTelegramHandle, user?.globalWhatsappNumber]);

  const telegramTarget = user?.globalTelegramHandle || contactSettings.telegramHandle || '';
  const whatsappTarget = user?.globalWhatsappNumber || contactSettings.whatsappNumber || '';
  const prefilledText  = user?.globalPrefilledMessage || contactSettings.prefilledMessage || 'Hello, I need assistance with my account.';

  const handleOpenWhatsApp = () => {
    const url = formatWhatsappUrl(whatsappTarget, prefilledText);
    window.open(url || 'https://wa.me/', '_blank', 'noopener,noreferrer');
  };

  const handleOpenTelegram = () => {
    const url = formatTelegramUrl(telegramTarget, prefilledText);
    window.open(url || 'https://t.me/', '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
          btnRef.current  && !btnRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const initials = (user?.fullName || 'U')
    .split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header
      className="sticky top-0 z-30 flex justify-between items-center px-4 py-3 lg:px-8"
      style={{
        backgroundColor: 'var(--surface, rgba(6,15,30,0.85))',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border, rgba(6,182,212,0.1))',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Mobile: hamburger + logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          onClick={onOpenDrawer}
          className="p-1.5 -ml-1 mr-1 rounded-lg transition-smooth"
          style={{ color: '#94A3B8' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#06B6D4'; e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Logo size="sm" showText={false} />
      </div>

      {/* Desktop: page title */}
      <div className="hidden lg:block">
        <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Shughar Banking</p>
        <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-1)' }}>{title}</h1>
      </div>

      {/* Right: quick contact + theme toggle + notifications + avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 relative">
        {/* Direct WhatsApp Contact Button */}
        <button
          onClick={handleOpenWhatsApp}
          className="p-1.5 sm:p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer group"
          style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.28)' }}
          title="Direct message on WhatsApp"
        >
          <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </div>
        </button>

        {/* Direct Telegram Contact Button */}
        <button
          onClick={handleOpenTelegram}
          className="p-1.5 sm:p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer group"
          style={{ background: 'rgba(34,158,217,0.12)', border: '1px solid rgba(34,158,217,0.28)' }}
          title="Direct message on Telegram"
        >
          <div className="w-5 h-5 rounded-full bg-[#229ED9] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.56 8.16l-2.02 9.54c-.15.68-.56.84-1.12.52l-3.08-2.27-1.49 1.43c-.16.17-.3.3-.62.3l.22-3.13 5.7-5.15c.25-.22-.05-.34-.38-.12l-7.05 4.44-3.04-.95c-.66-.21-.67-.66.14-.98l11.89-4.58c.55-.2 1.03.13.85.95z"/>
            </svg>
          </div>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl transition-smooth"
          style={{ color: '#64748B' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#06B6D4'; e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        {/* Bell */}
        <button
          ref={btnRef}
          onClick={(e) => {
            e.stopPropagation();
            setPanelOpen(v => !v);
            onOpenNotifications();
          }}
          className="relative p-2 rounded-xl transition-smooth"
          style={{ color: '#64748B' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#06B6D4'; e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; }}
          title="Notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {hasUnread && notifications && notifications.length > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-slate-950 flex items-center justify-center animate-pulse"
              style={{ backgroundColor: '#06B6D4', boxShadow: '0 0 10px rgba(6,182,212,0.6)' }}
            >
              {notifications.length}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {panelOpen && (
          <div
            ref={panelRef}
            className="notif-panel-open absolute right-0 top-14 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-2xl z-50 overflow-hidden"
            style={{
              background: '#0D1F35',
              border: '1px solid rgba(6,182,212,0.2)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(6,182,212,0.1)' }}>
              <span className="font-display font-semibold text-sm" style={{ color: '#E2E8F0' }}>Notifications</span>
              <button
                onClick={onClearNotifications}
                className="text-xs font-medium transition-smooth cursor-pointer"
                style={{ color: '#06B6D4' }}
                onMouseEnter={e => e.target.style.color = '#22D3EE'}
                onMouseLeave={e => e.target.style.color = '#06B6D4'}
              >
                Clear all
              </button>
            </div>
            <div className="divide-y max-h-72 overflow-y-auto custom-scroll"
              style={{ '--tw-divide-opacity': 1, borderColor: 'rgba(6,182,212,0.06)' }}>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No new notifications</p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div
                    key={n.id || i}
                    onClick={() => {
                      if (n.type === 'transaction') {
                        setPanelOpen(false);
                        navigate('/transactions');
                      }
                    }}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-smooth group"
                    style={{ borderBottom: '1px solid rgba(6,182,212,0.06)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,182,212,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* SVG icon derived from notification type */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: n.color ? `${n.color}15` : 'rgba(6,182,212,0.12)' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke={n.color || '#06B6D4'} strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={
                          n.iconPath ||
                          (n.icon === '💰' ? 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' :
                           n.icon === '₿'  ? 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' :
                           n.icon === '⚠️' ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' :
                           n.icon === '🔐' ? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' :
                           'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9')
                        } />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold truncate" style={{ color: '#E2E8F0' }}>{n.title}</p>
                        <span className="text-[10px] flex-shrink-0 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{n.time}</span>
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#94A3B8' }}>{n.body}</p>
                      {n.txId && (
                        <p className="text-[10px] font-mono mt-0.5 flex items-center gap-1" style={{ color: '#06B6D4' }}>
                          <span>ID:</span>
                          <span className="font-bold">{n.txId}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Avatar */}
        <div
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm text-white cursor-pointer select-none transition-smooth hover-scale"
          style={{
            background: 'linear-gradient(135deg, #0369A1, #06B6D4)',
            boxShadow: '0 2px 12px rgba(6,182,212,0.3)',
          }}
          title={user?.fullName || 'Account'}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

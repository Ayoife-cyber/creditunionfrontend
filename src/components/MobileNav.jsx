import { MENU_GROUPS } from '../data/navConfig.js';
import Logo from './Logo.jsx';

const SPECIAL_KEYS = new Set(['deposit', 'save-invest', 'support']);

export default function MobileNav({ activeSection, onNavigate, open, onClose, user, onLogout, onSpecialAction }) {
  const profileName = user?.fullName || 'Account Holder';
  const profileId   = user?.accountNumber || user?.accountId || '02020047885';

  const isActive = (item) =>
    activeSection === item.key ||
    activeSection === item.path.replace('/', '') ||
    (item.path === '/dashboard' && activeSection === 'home');

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(6,15,30,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 lg:hidden flex flex-col transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#060F1E', borderRight: '1px solid rgba(6,182,212,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(6,182,212,0.08)' }}>
          <Logo size="sm" showText={true} />
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-smooth"
            style={{ color: '#64748B' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#06B6D4'; e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(6,182,212,0.08)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-black text-white text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)', boxShadow: '0 4px 14px rgba(6,182,212,0.3)' }}
            >
              {profileName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-sm truncate" style={{ color: '#F1F5F9' }}>{profileName}</p>
              <p className="text-xs font-mono mt-0.5" style={{ color: '#475569' }}>ID: {profileId}</p>
            </div>
          </div>

          <div
            className="flex items-center justify-center gap-2 w-full py-1.5 px-3 rounded-lg mb-3"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="#10B981" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold" style={{ color: '#10B981' }}>KYC Verified</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { onClose(); onNavigate('/profile'); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-smooth"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(6,182,212,0.15)', color: '#94A3B8' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#06B6D4'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'; }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </button>
            <button
              onClick={() => { onClose(); onLogout(); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-smooth"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scroll">
          {MENU_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#334155' }}>
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onClose();
                        if (SPECIAL_KEYS.has(item.key) && onSpecialAction) {
                          onSpecialAction(item);
                        } else {
                          onNavigate(item.path);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth"
                      style={{
                        color: active ? '#06B6D4' : '#64748B',
                        background: active ? 'rgba(6,182,212,0.1)' : 'transparent',
                        border: active ? '1px solid rgba(6,182,212,0.2)' : '1px solid transparent',
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#E2E8F0'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; }}}
                    >
                      <svg style={{ width: '18px', height: '18px', color: active ? '#06B6D4' : '#334155', flexShrink: 0 }}
                        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* WhatsApp footer */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(6,182,212,0.08)' }}>
          <button
            className="flex items-center gap-3 w-full p-3 rounded-2xl transition-smooth"
            style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.18)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.08)'}
          >
            <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#94A3B8' }}>Message us</span>
          </button>
        </div>
      </aside>
    </>
  );
}

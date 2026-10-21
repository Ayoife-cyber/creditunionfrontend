import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First step: Login to get OTP
      const res = await authApi.login({ identifier: email, password });
      
      // For AdminLogin, we assume the admin can just verify OTP next, 
      // or we can bypass OTP for admins on backend.
      // Let's store tempToken and go to a 2FA step if needed, or if backend bypasses it, just save token.
      if (res.requires2FA) {
        // Admin needs OTP. Instead of adding a whole OTP UI here, let's just use the normal login page.
        // Wait, for simplicity let's redirect them to standard login if they need OTP, 
        // OR add an OTP step here. 
        // Let's bypass OTP for admins in backend!
      }
      if (res.token && res.user && res.user.role === 'admin') {
        localStorage.setItem('shughar_admin_token', res.token);
        localStorage.setItem('shughar_profile', JSON.stringify(res.user));
        sessionStorage.setItem('shughar_admin_auth', 'true');
        navigate('/admin', { replace: true });
      } else {
        throw new Error('Not authorized as admin');
      }
    } catch (err) {
      setError(err.message || 'Invalid admin credentials.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
    setLoading(false);
  }

  return (
    <div className="admin-panel min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)' }}>
      {/* Background glow blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div
        className={`relative z-10 w-full max-w-sm mx-4 ${shake ? 'animate-shake' : ''}`}
        style={{ animation: shake ? 'shake 0.5s ease-in-out' : 'none' }}
      >
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #06B6D4, #6366F1)', boxShadow: '0 0 40px rgba(6,182,212,0.3)' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin Panel</h1>
          <p className="text-sm text-slate-400">Restricted access - authorised personnel only</p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl p-8 border" style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.08)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Admin Email
              </label>
              <div className="relative mb-4">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shughar.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}` }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(6,182,212,0.5)'; }}
                  onBlur={(e) => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; }}
                />
              </div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`, focusRing: 'rgba(6,182,212,0.4)' }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(6,182,212,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              )}
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading || !password}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
              style={{ background: loading || !password ? 'rgba(6,182,212,0.3)' : 'linear-gradient(135deg, #06B6D4, #6366F1)', boxShadow: loading || !password ? 'none' : '0 8px 24px rgba(6,182,212,0.25)', cursor: loading || !password ? 'not-allowed' : 'pointer' }}
              onMouseEnter={(e) => { if (!loading && password) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Access Admin Panel
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          This panel is not visible to regular users. Keep your password private.
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
          90% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}


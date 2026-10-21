import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

const EyeOpen = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);
const EyeOff = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
  </svg>
);

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await login(form.email, form.password);
      if (result?.requires2FA) {
        navigate('/verify', { state: { tempToken: result.tempToken, identifier: form.email } });
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ backgroundColor: '#0A1628' }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/login-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(10,22,40,0.78)' }}
      />

      {/* Background orbs */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none animate-float"
        style={{ background: 'rgba(3,105,161,0.15)', top: '-80px', right: '-80px' }} />
      <div className="absolute w-64 h-64 rounded-full blur-3xl pointer-events-none animate-float"
        style={{ background: 'rgba(6,182,212,0.08)', bottom: '-60px', left: '-60px', animationDelay: '1.5s' }} />

      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-smooth"
        style={{ color: '#94A3B8', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(6,182,212,0.15)', backdropFilter: 'blur(8px)' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#06B6D4'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'; }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to home
      </Link>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-fadeInDown">
          <Logo size="lg" showText={true} />
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 animate-slideInUp"
          style={{
            background: 'linear-gradient(135deg, #0F2A47, #0D1F35)',
            border: '1px solid rgba(6,182,212,0.2)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}
        >
          <h1 className="font-display font-bold text-2xl mb-1 animate-fadeInUp stagger-1" style={{ color: '#F1F5F9' }}>
            Welcome back
          </h1>
          <p className="text-sm mb-6 animate-fadeInUp stagger-2" style={{ color: '#94A3B8' }}>
            Sign in to access your account
          </p>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm animate-shake"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="animate-fadeInUp stagger-3">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>
                Email address
              </label>
              <input
                id="email" type="email" required autoComplete="email"
                value={form.email} onChange={update('email')}
                placeholder="you@example.com"
                className="input-dark"
              />
            </div>

            {/* Password */}
            <div className="animate-fadeInUp stagger-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required autoComplete="current-password"
                  value={form.password} onChange={update('password')}
                  placeholder="••••••••"
                  className="input-dark pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-smooth hover-scale"
                  style={{ color: '#475569' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#06B6D4'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                >
                  {showPassword ? <EyeOpen /> : <EyeOff />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover-scale animate-fadeInUp stagger-5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #0369A1, #06B6D4)',
                boxShadow: '0 8px 24px rgba(6,182,212,0.3)',
              }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm mt-6 animate-fadeInUp stagger-6" style={{ color: '#64748B' }}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold transition-smooth" style={{ color: '#06B6D4' }}
              onMouseEnter={e => e.target.style.color = '#22D3EE'}
              onMouseLeave={e => e.target.style.color = '#06B6D4'}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

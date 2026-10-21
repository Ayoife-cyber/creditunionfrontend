import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function VerifyPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { verifyOtp } = useAuth();

  const tempToken  = location.state?.tempToken || location.state?.token;
  const identifier = location.state?.identifier || location.state?.email || '';
  const source     = location.state?.source || 'login';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Only redirect if we have neither a token nor an email -- we need at least one to proceed
    if (!tempToken && !identifier) navigate('/login', { replace: true });
  }, [navigate, tempToken, identifier]);

  useEffect(() => {
    if (!canResend && timer > 0) {
      const id = setInterval(() => {
        setTimer((p) => { if (p <= 1) { setCanResend(true); return 0; } return p - 1; });
      }, 1000);
      return () => clearInterval(id);
    }
  }, [timer, canResend]);

  async function handleVerify(e) {
    e.preventDefault();
    setError(''); setResendSuccess(''); setLoading(true);
    try {
      await verifyOtp(tempToken, otp, identifier);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your OTP and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true); setError('');
    try {
      setResendSuccess('A new OTP has been sent to your email.');
      setTimer(60); setCanResend(false); setOtp('');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ backgroundColor: '#0A1628' }}
    >
      {/* Background orbs */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none animate-float"
        style={{ background: 'rgba(3,105,161,0.12)', top: '-80px', right: '-80px' }} />
      <div className="absolute w-64 h-64 rounded-full blur-3xl pointer-events-none animate-float"
        style={{ background: 'rgba(6,182,212,0.07)', bottom: '-60px', left: '-60px', animationDelay: '1.5s' }} />

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
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse-smooth"
              style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>
              <svg className="w-7 h-7" fill="none" stroke="#06B6D4" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          <h1 className="font-display font-bold text-2xl mb-1 text-center animate-fadeInUp stagger-1" style={{ color: '#F1F5F9' }}>
            {source === 'signup' ? 'Verify your email' : 'Verify your login'}
          </h1>
          <p className="text-sm mb-6 text-center animate-fadeInUp stagger-2" style={{ color: '#94A3B8' }}>
            Enter the 6-digit code sent to your email
          </p>

          {identifier && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm animate-fadeInUp stagger-2"
              style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', color: '#94A3B8' }}>
              Code sent to <span className="font-semibold" style={{ color: '#06B6D4' }}>{identifier}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm animate-shake"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
              {error}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6EE7B7' }}>
              {resendSuccess}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="animate-fadeInUp stagger-3">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>
                Verification code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="1 2 3 4 5 6"
                maxLength="6"
                className="input-dark text-center tracking-[0.6em] text-xl font-bold"
                style={{ letterSpacing: '0.5em' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover-scale animate-fadeInUp stagger-4 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #0369A1, #06B6D4)',
                boxShadow: '0 8px 24px rgba(6,182,212,0.3)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying…
                </span>
              ) : 'Verify code'}
            </button>
          </form>

          <div className="mt-6 pt-5 animate-fadeInUp stagger-5" style={{ borderTop: '1px solid rgba(6,182,212,0.1)' }}>
            <p className="text-center text-xs mb-3" style={{ color: '#475569' }}>
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={!canResend || resendLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover-lift disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canResend ? 'rgba(6,182,212,0.1)' : 'transparent',
                border: '1px solid rgba(6,182,212,0.2)',
                color: canResend ? '#06B6D4' : '#475569',
              }}
            >
              {resendLoading ? 'Sending…' : canResend ? 'Resend OTP' : `Resend in ${timer}s`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #060b18 0%, #0a1020 50%, #070d1a 100%)' }}
    >
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-float"
        style={{ background: 'rgba(6,182,212,0.06)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none animate-float"
        style={{ background: 'rgba(139,92,246,0.05)', animationDelay: '1.5s' }} />

      <div className="relative z-10 text-center max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="md" showText={true} />
        </div>

        {/* 404 display */}
        <div className="mb-6">
          <p
            className="font-display font-black leading-none mb-2"
            style={{
              fontSize: 'clamp(5rem, 20vw, 8rem)',
              background: 'linear-gradient(135deg, #0369A1, #06B6D4, #10B981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </p>
          <div
            className="w-16 h-1 rounded-full mx-auto mb-4"
            style={{ background: 'linear-gradient(90deg, #0369A1, #06B6D4)' }}
          />
          <h1 className="font-display text-xl font-bold text-slate-100 mb-2">
            Page not found
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 transition-all hover-lift"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            ← Go back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover-scale"
            style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)', boxShadow: '0 4px 20px rgba(6,182,212,0.3)' }}
          >
            Return home
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';

// Count-up hook — animates a number from 0 to `target` when element enters viewport
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// Stat counter card — each one manages its own count-up independently
function StatCounter({ raw, display, label, delay, index }) {
  const { count, ref } = useCountUp(raw, 1800 + index * 200);
  return (
    <div
      ref={ref}
      className="text-center py-8 px-4 rounded-2xl animate-fadeInUp"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(6,182,212,0.1)', animationDelay: `${delay}s` }}
    >
      <p
        className="font-display font-black text-4xl mb-2"
        style={{ background: 'linear-gradient(135deg,#0369A1,#06B6D4,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
      >
        {display(count)}
      </p>
      <p className="text-sm" style={{ color: '#64748B' }}>{label}</p>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const headlines = ['Redefined', 'Simplified', 'Elevated'];
  const [tiltStyle, setTiltStyle] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex(prev => (prev + 1) % headlines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setTiltStyle({
      transform: `perspective(1000px) rotateY(${x * 15}deg) rotateX(${y * -15}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out'
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A1628' }}>

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 animate-fadeInDown"
        style={{ backgroundColor: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(6,182,212,0.15)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer hover-scale transition-smooth">
            <Logo size="md" showText={true} />
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Stats', 'Pricing', 'Security'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm font-medium transition-smooth hover-lift"
                style={{ color: '#94A3B8' }}
                onMouseEnter={e => e.target.style.color = '#06B6D4'}
                onMouseLeave={e => e.target.style.color = '#94A3B8'}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:block px-5 py-2 rounded-lg text-sm font-semibold transition-smooth hover-lift"
              style={{ color: '#E2E8F0', border: '1px solid rgba(6,182,212,0.3)', backgroundColor: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#06B6D4'; e.currentTarget.style.color = '#06B6D4'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; e.currentTarget.style.color = '#E2E8F0'; }}
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="hidden sm:block px-5 py-2 rounded-lg text-sm font-bold transition-all hover-scale"
              style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)', color: '#fff', boxShadow: '0 4px 20px rgba(6,182,212,0.35)' }}
            >
              Sign Up Free
            </button>
            
            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: '#E2E8F0' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 p-4 border-b animate-fadeIn" style={{ backgroundColor: 'rgba(10,22,40,0.95)', borderBottomColor: 'rgba(6,182,212,0.15)' }}>
            <div className="flex flex-col space-y-4">
              {['Features', 'Stats', 'Pricing', 'Security'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium py-2"
                  style={{ color: '#94A3B8' }}
                >
                  {link}
                </a>
              ))}
              <hr style={{ borderColor: 'rgba(6,182,212,0.1)' }} />
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{ color: '#E2E8F0', border: '1px solid rgba(6,182,212,0.3)' }}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 rounded-xl text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)', color: '#fff' }}
              >
                Sign Up Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 px-4 sm:px-6 lg:px-10 relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/home-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(10,22,40,0.75) 0%, rgba(10,22,40,0.6) 50%, rgba(10,22,40,0.95) 100%)' }}
        />
        {/* Background glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl z-0 animate-float pointer-events-none" style={{ background: 'rgba(3,105,161,0.15)' }} />
        <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full blur-3xl z-0 animate-float pointer-events-none" style={{ background: 'rgba(6,182,212,0.10)', animationDelay: '1.5s' }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div className="space-y-7 animate-fadeInLeft">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold animate-fadeInDown"
                style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.25)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-smooth" />
                Welcome to Shughar Credit Union
              </span>

              <h1 className="font-display font-black leading-tight animate-fadeInUp stagger-2" style={{ fontSize: 'clamp(2.5rem,5vw,3.75rem)', color: '#F1F5F9' }}>
                Banking{' '}
                <span key={headlineIndex} className="animate-fadeInUp" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#0369A1,#06B6D4,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', minWidth: '220px' }}>
                  {headlines[headlineIndex]}
                </span>{' '}
                <br />for You
              </h1>

              <p className="text-lg leading-relaxed animate-fadeInUp stagger-3" style={{ color: '#94A3B8', maxWidth: '520px' }}>
                Experience modern banking with simplicity at its core. Manage your finances with powerful tools, secure transactions, and 24/7 support — all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp stagger-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover-scale"
                  style={{ background: 'linear-gradient(135deg,#0369A1,#06B6D4)', color: '#fff', boxShadow: '0 8px 32px rgba(6,182,212,0.35)' }}
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover-lift"
                  style={{ color: '#E2E8F0', border: '1.5px solid rgba(6,182,212,0.35)', backgroundColor: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(6,182,212,0.08)'; e.currentTarget.style.borderColor = '#06B6D4'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.35)'; }}
                >
                  Sign In →
                </button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4 animate-fadeInUp stagger-5">
                <div className="flex -space-x-2">
                  {['#0369A1','#06B6D4','#10B981'].map((c, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: c, borderColor: '#0A1628' }}>
                      {['JD','AL','MK'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>50,000+ members</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>trust Shughar daily</p>
                </div>
              </div>
            </div>

            {/* Right — Dashboard card */}
            <div className="hidden lg:flex justify-center animate-fadeInRight stagger-3" style={{ perspective: '1000px' }}>
              <div 
                className="w-96 space-y-4 animate-float" 
                style={{ animationDuration: '4s', ...tiltStyle }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Main balance card */}
                <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg,#0F2A47,#1A3A5C)', border: '1px solid rgba(6,182,212,0.25)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <p className="text-xs mb-1 font-medium" style={{ color: '#64748B' }}>Total Portfolio</p>
                      <p className="font-display font-bold text-3xl" style={{ color: '#F1F5F9' }}>$48,291.50</p>
                      <p className="text-xs mt-1 font-semibold" style={{ color: '#10B981' }}>↑ +$3,240 this month</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>● Live</span>
                  </div>

                  {/* Mini sparkline bars */}
                  <div className="flex items-end gap-1 mb-5 h-10">
                    {[40, 65, 45, 70, 55, 80, 60, 90, 75, 95, 70, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${h}%`,
                          background: i === 11
                            ? 'linear-gradient(180deg,#06B6D4,#0369A1)'
                            : 'rgba(6,182,212,0.2)',
                        }}
                      />
                    ))}
                  </div>

                  <div className="space-y-2.5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    {[
                      { label: 'Cash Balance', value: '$24,500', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: '#06B6D4' },
                      { label: 'BTC Holdings', value: '0.412 BTC', icon: 'M12 3v1m0 16v1M4.22 4.22l.707.707M18.364 18.364l.707.707M1 12h1m20 0h1M4.22 19.78l.707-.707M18.364 5.636l.707-.707', color: '#F59E0B' },
                      { label: 'Savings', value: '$8,300', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: '#10B981' },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${row.color}18` }}>
                            <svg className="w-3 h-3" fill="none" stroke={row.color} strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d={row.icon} />
                            </svg>
                          </div>
                          <span className="text-xs" style={{ color: '#94A3B8' }}>{row.label}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: '#E2E8F0' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick action pills */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Send', icon: 'M5 10l7-7m0 0l7 7M12 3v18', color: '#06B6D4' },
                    { label: 'Receive', icon: 'M19 14l-7 7m0 0l-7-7m7 7V3', color: '#10B981' },
                    { label: 'Swap', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', color: '#8B5CF6' },
                  ].map((a) => (
                    <div key={a.label} className="rounded-xl p-3 text-center cursor-pointer hover-scale transition-smooth" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${a.color}20` }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5" style={{ background: `${a.color}15` }}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke={a.color} strokeWidth="2.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>{a.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-10" id="features" style={{ backgroundColor: '#0D1F35' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#06B6D4' }}>Why Shughar</span>
            <h2 className="font-display text-4xl font-bold mt-2 mb-3" style={{ color: '#F1F5F9' }}>Everything you need to bank smarter</h2>
            <p className="text-base" style={{ color: '#64748B' }}>Powerful features built for the modern user</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                color: '#06B6D4',
                title: 'Bank-Level Security',
                desc: 'Military-grade encryption and multi-factor authentication protect every transaction.',
              },
              {
                icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                color: '#F59E0B',
                title: 'Instant Transfers',
                desc: 'Send money globally in seconds with our blazing-fast transfer network.',
              },
              {
                icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
                color: '#8B5CF6',
                title: 'Smart Cards',
                desc: 'Manage multiple cards, set spending limits, and freeze/unfreeze instantly.',
              },
              {
                icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                color: '#10B981',
                title: 'Financial Insights',
                desc: 'Track spending, set budgets, and get personalized financial recommendations.',
              },
              {
                icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
                color: '#06B6D4',
                title: '24/7 Support',
                desc: 'Our dedicated team is always here — whenever you need help.',
              },
              {
                icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
                color: '#F97316',
                title: 'Investment Ready',
                desc: 'Invest in crypto and stocks directly from your banking dashboard.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 group cursor-pointer animate-fadeInUp hover-scale transition-smooth-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(6,182,212,0.1)', animationDelay: `${i * 0.08}s` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}60`; e.currentTarget.style.background = `${f.color}0a`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-all"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}
                >
                  <svg className="w-5 h-5" fill="none" stroke={f.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-base mb-2" style={{ color: '#E2E8F0' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-10" id="stats" style={{ backgroundColor: '#0A1628' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { raw: 50000,  display: (n) => `${Math.round(n / 1000)}K+`, label: 'Active Users' },
              { raw: 500000, display: (n) => `${Math.round(n / 1000)}K+`, label: 'Daily Transactions' },
              { raw: 150,    display: (n) => `${n}+`,                     label: 'Countries' },
              { raw: 999,    display: (n) => `${(n / 10).toFixed(1)}%`,   label: 'Uptime' },
            ].map((s, i) => (
              <StatCounter key={s.label} raw={s.raw} display={s.display} label={s.label} delay={i * 0.1} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-10" style={{ backgroundColor: '#0D1F35' }}>
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden animate-slideInUp"
            style={{ background: 'linear-gradient(135deg, #0C2D4A, #0F3B55)', border: '1px solid rgba(6,182,212,0.25)', boxShadow: '0 0 80px rgba(3,105,161,0.2)' }}
          >
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(6,182,212,0.08)' }} />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(16,185,129,0.06)' }} />
            <div className="relative z-10 space-y-6">
              <h3 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: '#F1F5F9' }}>Ready to Transform Your Banking?</h3>
              <p className="text-base max-w-xl mx-auto" style={{ color: '#94A3B8' }}>
                Join thousands already managing their finances smarter with Shughar. Get started in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-3.5 rounded-xl font-bold text-sm hover-scale transition-all"
                  style={{ background: 'linear-gradient(135deg,#0369A1,#06B6D4)', color: '#fff', boxShadow: '0 8px 30px rgba(6,182,212,0.35)' }}
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3.5 rounded-xl font-semibold text-sm hover-lift transition-all"
                  style={{ color: '#E2E8F0', border: '1.5px solid rgba(6,182,212,0.4)', backgroundColor: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(6,182,212,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  I Already Have an Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-4 sm:px-6 lg:px-10 pt-16 pb-8" style={{ backgroundColor: '#060F1E', borderTop: '1px solid rgba(6,182,212,0.1)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Logo size="md" showText={true} className="mb-4" />
              <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>Banking solutions for the modern world.</p>

              {/* Social icons */}
              <div className="flex gap-4 mt-5">
                {[
                  <path key="fb" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>,
                  <path key="tw" d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>,
                  <path key="gh" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 016.003 0c2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>,
                ].map((d, i) => (
                  <a
                    key={i}
                    href="#"
                    className="hover-scale transition-smooth"
                    style={{ color: '#475569' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#06B6D4'}
                    onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">{d}</svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Compliance', 'Cookies'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Docs'] },
            ].map((col, i) => (
              <div key={col.title} className={`animate-fadeInUp stagger-${i + 1}`}>
                <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#E2E8F0' }}>{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm transition-smooth hover-lift inline-block"
                        style={{ color: '#475569' }}
                        onMouseEnter={e => e.target.style.color = '#06B6D4'}
                        onMouseLeave={e => e.target.style.color = '#475569'}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="rounded-2xl p-6 mb-10" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(6,182,212,0.12)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="font-semibold mb-1" style={{ color: '#E2E8F0' }}>Stay in the loop</p>
                <p className="text-sm" style={{ color: '#475569' }}>Get product updates and news delivered to your inbox.</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(6,182,212,0.2)', color: '#E2E8F0' }}
                  onFocus={e => e.target.style.borderColor = '#06B6D4'}
                  onBlur={e => e.target.style.borderColor = 'rgba(6,182,212,0.2)'}
                />
                <button
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold hover-scale transition-all"
                  style={{ background: 'linear-gradient(135deg,#0369A1,#06B6D4)', color: '#fff' }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs" style={{ color: '#334155' }}>© 2026 Shughar Credit Union. All rights reserved.</p>
            <p className="text-xs" style={{ color: '#334155' }}>FDIC Insured · Member NCUA · Equal Housing Lender</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

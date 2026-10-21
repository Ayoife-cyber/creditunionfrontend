export default function Logo({ size = 'md', showText = true, className = '' }) {
  const sizePx = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };
  const px = sizePx[size] ?? 40;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Shield icon — explicit bright gradient, always visible on dark bg */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 120 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#0EA5E9" />
            <stop offset="50%"  stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
          {/* subtle inner glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Shield body */}
        <path
          d="M60 8 L95 24 L95 58 C95 85 60 112 60 112 C60 112 25 85 25 58 L25 24 Z"
          fill="url(#sg)"
          filter="url(#glow)"
        />

        {/* Lighter inner shield highlight */}
        <path
          d="M60 18 L85 31 L85 57 C85 78 60 100 60 100 C60 100 35 78 35 57 L35 31 Z"
          fill="rgba(255,255,255,0.12)"
        />

        {/* S letter — bright white, bold */}
        <path
          d="M68 40 C68 40 52 36 50 46 C48 54 60 55 65 59 C70 63 68 72 60 74 C52 76 46 71 46 71"
          fill="none"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <div>
          {/* Always white — works on any dark bg */}
          <p
            className="font-display font-bold leading-tight"
            style={{ color: '#F1F5F9', fontSize: px < 36 ? '13px' : '16px', lineHeight: 1.2 }}
          >
            Shughar
          </p>
          <p
            className="uppercase tracking-widest font-semibold"
            style={{ color: '#06B6D4', fontSize: '9px', letterSpacing: '0.18em' }}
          >
            Credit Union
          </p>
        </div>
      )}
    </div>
  );
}

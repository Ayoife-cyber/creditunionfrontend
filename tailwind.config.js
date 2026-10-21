/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // ── Backgrounds ──
          bg:          '#0A1628',   // page background
          surface:     '#0D1F35',   // section / card background
          surfaceHigh: '#0F2A47',   // elevated card
          surfaceMid:  '#1A3A5C',   // inner card surfaces

          // ── Accent (logo cyan/blue) ──
          accent:      '#06B6D4',   // primary CTA, active states
          accentHover: '#0891B2',   // darker on hover
          accentLight: '#22D3EE',   // lighter tint

          // ── Text ──
          textPrimary:   '#F1F5F9',
          textSecondary: '#94A3B8',
          textMuted:     '#475569',

          // ── Borders ──
          border:      'rgba(6,182,212,0.15)',
          borderHover: 'rgba(6,182,212,0.4)',

          // ── Status ──
          success: '#10B981',
          warning: '#F59E0B',
          error:   '#EF4444',

          // ── Legacy aliases (keep existing references working) ──
          blue:      '#0A1628',
          blueDark:  '#060F1E',
          blueLight: '#0D1F35',
          red:       '#EF4444',
          redLight:  '#F87171',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0369A1 0%, #06B6D4 100%)',
      },
    },
  },
  plugins: [],
};

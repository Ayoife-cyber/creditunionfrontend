import { useMemo, useState } from 'react';
import { CHART_DATA } from '../data/mockData.js';

const PERIODS = ['1W', '1M', '1Y'];

function buildPaths(data) {
  const chartW = 280;
  const chartH = 90;
  const offsetX = 28;
  const offsetY = 10;
  const minVal = Math.min(...data) - 2000;
  const maxVal = Math.max(...data) + 2000;

  const pts = data.map((v, i) => {
    const x = offsetX + (i / (data.length - 1)) * (chartW - offsetX);
    const y = offsetY + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;
    return [x, y];
  });

  const linePath = 'M ' + pts.map((p) => p.join(' ')).join(' L ');
  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1][0]} ${offsetY + chartH} L ${pts[0][0]} ${offsetY + chartH} Z`;

  return { linePath, areaPath, points: pts };
}

export default function PortfolioChart() {
  const [period, setPeriod] = useState('1W');
  const { linePath, areaPath, points } = useMemo(() => buildPaths(CHART_DATA[period]), [period]);
  const last  = CHART_DATA[period][CHART_DATA[period].length - 1];
  const delta = last - CHART_DATA[period][0];
  const positive = delta >= 0;

  return (
    <div className="xl:col-span-2 glass-card rounded-3xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-1)' }}>Portfolio Overview</h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{period} performance snapshot</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`chart-period-btn text-xs px-3 py-1 rounded-lg font-medium transition-all ${period === p ? 'active' : ''}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div
        className="relative rounded-2xl p-3"
        style={{ background: 'var(--surface-high)', border: '1px solid var(--border)' }}
      >
        <svg viewBox="0 0 300 120" className="w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="chartGradDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#06B6D4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#chartGradDark)" />
          <path d={linePath} fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => (
            <circle key={`${point[0]}-${index}`} cx={point[0]} cy={point[1]} r="2.5" fill="#06B6D4" />
          ))}
          <text x="0" y="20"  fill="rgba(148,163,184,0.5)" fontSize="8" fontFamily="Inter">$130k</text>
          <text x="0" y="60"  fill="rgba(148,163,184,0.5)" fontSize="8" fontFamily="Inter">$120k</text>
          <text x="0" y="100" fill="rgba(148,163,184,0.5)" fontSize="8" fontFamily="Inter">$110k</text>
        </svg>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between mt-3 pt-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Current value</p>
          <p className="font-display font-bold text-sm" style={{ color: 'var(--text-1)' }}>${last.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Change</p>
          <p className={`font-display font-bold text-sm ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
            {positive ? '+' : '-'}${Math.abs(delta).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

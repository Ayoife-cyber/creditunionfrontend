import { useEffect, useState, useMemo } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../api/client.js';
import { DEFAULT_BALANCE } from '../config/balanceConfig.js';

// Derive monthly inflow / outflow from real transactions
function computeMetrics(transactions, balanceUsd, btcHolding) {
  const deposits    = transactions.filter(t => t.tag === 'deposit');
  const withdrawals = transactions.filter(t => t.tag === 'withdrawal' || t.type === 'withdrawal');

  const inflow  = deposits.reduce((sum, t) => {
    const n = parseFloat(String(t.amount).replace(/[^0-9.]/g, ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
  const outflow = withdrawals.reduce((sum, t) => {
    const n = parseFloat(String(t.amount).replace(/[^0-9.]/g, ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const net        = inflow - outflow;
  const savings    = balanceUsd * 0.4;
  const btcValue   = (btcHolding ?? 0) * 80000;
  const savingsGoalPct = Math.min(Math.round((savings / 50000) * 100), 100);

  // Build bar data — 6 buckets from transactions
  const barBuckets = [0, 0, 0, 0, 0, 0];
  transactions.forEach((t, i) => {
    const bucket = Math.floor((i / Math.max(transactions.length, 1)) * 6);
    const n = parseFloat(String(t.amount).replace(/[^0-9.]/g, ''));
    if (!isNaN(n)) barBuckets[Math.min(bucket, 5)] += n;
  });
  const barMax  = Math.max(...barBuckets, 1);
  const barPcts = barBuckets.map(v => Math.max(Math.round((v / barMax) * 100), 12));

  return { inflow, outflow, net, savings, btcValue, savingsGoalPct, barPcts };
}

export default function AnalyticsPage() {
  const { user, token } = useAuth();
  const balanceUsd = user?.balanceUsd ?? DEFAULT_BALANCE.balanceUsd;
  const btcHolding = user?.btcHolding ?? DEFAULT_BALANCE.btcHolding;

  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shughar_tx_cache') || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    authApi.getMyTransactions(token)
      .then(data => { setTransactions(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const { inflow, outflow, net, savings, btcValue, savingsGoalPct, barPcts } = useMemo(
    () => computeMetrics(transactions, balanceUsd, btcHolding),
    [transactions, balanceUsd, btcHolding]
  );

  const netPositive = net >= 0;
  const recentTx = [...transactions].slice(0, 4);

  const metrics = [
    {
      label: 'Total inflow',
      value: `$${Math.round(inflow).toLocaleString()}`,
      detail: `${transactions.filter(t => t.tag === 'deposit').length} deposit transactions`,
      color: '#10B981',
      icon: 'M7 11l5-5m0 0l5 5m-5-5v12',
    },
    {
      label: 'Total outflow',
      value: `$${Math.round(outflow).toLocaleString()}`,
      detail: `${transactions.filter(t => t.tag === 'withdrawal' || t.type === 'withdrawal').length} withdrawal transactions`,
      color: '#EF4444',
      icon: 'M17 13l-5 5m0 0l-5-5m5 5V6',
    },
    {
      label: 'Net balance flow',
      value: `${netPositive ? '+' : '-'}$${Math.abs(Math.round(net)).toLocaleString()}`,
      detail: netPositive ? 'More coming in than going out' : 'More going out than coming in',
      color: netPositive ? '#10B981' : '#EF4444',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    },
  ];

  return (
    <AppLayout title="Analytics">
      <div className="px-4 lg:px-8 py-6 max-w-6xl mx-auto space-y-6 animate-fadeIn">

        {/* Header card */}
        <div className="glass-card rounded-[28px] p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Performance overview</p>
              <h2 className="font-display text-2xl text-slate-200">
                {loading ? 'Loading your data…' : netPositive ? 'Your finances are trending positively' : 'Monitoring your cash flow'}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                A real-time view of your cashflow, spending habits, and savings momentum.
              </p>
            </div>
            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold self-start lg:self-auto ${
                netPositive
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {netPositive ? '↑' : '↓'} Net {netPositive ? '+' : '-'}${Math.abs(Math.round(net)).toLocaleString()}
            </div>
          </div>

          {/* Metrics row */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {metrics.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl p-4 transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${item.color}20` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${item.color}15` }}>
                    <svg className="w-4 h-4" fill="none" stroke={item.color} strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                </div>
                <p className="font-display text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Savings outlook */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-400">Savings outlook</p>
              <p className="mt-1 font-display text-lg text-slate-200">
                ${Math.round(savings).toLocaleString()} saved — {savingsGoalPct}% toward your $50,000 goal
              </p>
            </div>
            <span
              className="self-start sm:self-auto text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.25)' }}
            >
              {savingsGoalPct >= 80 ? '🔥 On fire' : savingsGoalPct >= 50 ? 'On track' : 'Building up'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${savingsGoalPct}%`, background: 'linear-gradient(90deg, #0369A1, #06B6D4)' }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <p className="text-xs text-slate-500">${Math.round(savings).toLocaleString()} saved</p>
            <p className="text-xs text-slate-500">Goal: $50,000</p>
          </div>
        </div>

        {/* Chart + Recent statement */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

          {/* Cash flow bars */}
          <div className="glass-card rounded-3xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Cash flow trend</p>
                <p className="mt-1 font-display text-lg text-slate-200">Activity across transactions</p>
              </div>
              <div
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                {transactions.length} total
              </div>
            </div>
            <div className="flex h-44 items-end gap-2">
              {barPcts.map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-xl transition-all duration-500"
                  style={{
                    height: `${height}%`,
                    background: index === barPcts.length - 1
                      ? 'linear-gradient(180deg, #06B6D4, #0369A1)'
                      : `linear-gradient(180deg, rgba(6,182,212,0.5), rgba(3,105,161,0.3))`,
                    animationDelay: `${index * 0.08}s`,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
                <span key={m} className="text-[10px] text-slate-500 flex-1 text-center">{m}</span>
              ))}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="glass-card rounded-3xl p-5">
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">Recent activity</p>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 rounded-2xl skeleton-box" />
                ))}
              </div>
            ) : recentTx.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-xs text-slate-500 text-center">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-2xl px-3 py-3 transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${tx.color}15` }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: tx.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{tx.label}</p>
                        <p className="text-xs text-slate-500">{tx.date}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold ml-3 flex-shrink-0" style={{ color: tx.color }}>{tx.amount}</p>
                  </div>
                ))}
              </div>
            )}

            {/* BTC value card */}
            <div
              className="mt-4 rounded-2xl p-3 flex items-center justify-between"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">₿</span>
                <div>
                  <p className="text-xs text-slate-400">BTC holdings value</p>
                  <p className="text-xs text-slate-500">{(btcHolding ?? 0).toFixed(6)} BTC</p>
                </div>
              </div>
              <p className="font-bold text-sm text-amber-400">${Math.round(btcValue).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

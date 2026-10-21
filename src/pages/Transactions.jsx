import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import TransactionHistory from '../components/TransactionHistory.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../api/client.js';

function SummaryCard({ label, value, sub, color, icon }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3 transition-all"
      style={{ background: `${color}08`, border: `1px solid ${color}20` }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}
      >
        <svg className="w-5 h-5" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: `${color}99` }}>{label}</p>
        <p className="font-display text-lg font-bold truncate" style={{ color }}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const { token } = useAuth();
  const txRef = useRef(null);
  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shughar_tx_cache') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    if (!token) return;
    authApi.getMyTransactions(token)
      .then(data => setTransactions(data || []))
      .catch(() => {});
  }, [token]);

  const stats = useMemo(() => {
    let totalIn = 0, totalOut = 0, pending = 0;
    transactions.forEach(tx => {
      const n = parseFloat(String(tx.amount).replace(/[^0-9.]/g, ''));
      if (isNaN(n)) return;
      if (tx.tag === 'deposit')    totalIn  += n;
      if (tx.tag === 'withdrawal') totalOut += n;
      if (tx.status === 'pending') pending++;
    });
    return { totalIn, totalOut, net: totalIn - totalOut, pending, count: transactions.length };
  }, [transactions]);

  const fmt = (n) => `$${Math.round(n).toLocaleString()}`;

  return (
    <AppLayout title="Transactions">
      <div className="px-4 lg:px-8 py-6 space-y-5 max-w-6xl mx-auto animate-fadeIn">

        {/* Page header */}
        <div className="flex flex-col gap-1 px-1">
          <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Account activity</p>
          <h3 className="font-display text-2xl font-bold" style={{ color: 'var(--text-1)' }}>Transaction history</h3>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            label="Total inflow"
            value={fmt(stats.totalIn)}
            sub={`${transactions.filter(t => t.tag === 'deposit').length} deposits`}
            color="#10B981"
            icon="M7 11l5-5m0 0l5 5m-5-5v12"
          />
          <SummaryCard
            label="Total outflow"
            value={fmt(stats.totalOut)}
            sub={`${transactions.filter(t => t.tag === 'withdrawal').length} withdrawals`}
            color="#EF4444"
            icon="M17 13l-5 5m0 0l-5-5m5 5V6"
          />
          <SummaryCard
            label="Net flow"
            value={`${stats.net >= 0 ? '+' : '-'}${fmt(Math.abs(stats.net))}`}
            sub={stats.net >= 0 ? 'More in than out' : 'More out than in'}
            color={stats.net >= 0 ? '#06B6D4' : '#F59E0B'}
            icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
          <SummaryCard
            label="Total records"
            value={String(stats.count)}
            sub={stats.pending > 0 ? `${stats.pending} pending` : 'All settled'}
            color="#8B5CF6"
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </div>

        {/* Full transaction list */}
        <TransactionHistory ref={txRef} fullHeight={true} />
      </div>
    </AppLayout>
  );
}

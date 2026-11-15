import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import TransactionHistory from '../components/TransactionHistory.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../api/client.js';

function SummaryCard({ label, value, sub, color, icon, onClick, active, clickable = false }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 flex items-center gap-3 transition-all ${
        clickable ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''
      } ${active ? 'ring-2 ring-cyan-400/60 shadow-lg' : ''}`}
      style={{
        background: active ? `${color}18` : `${color}08`,
        border: active ? `1px solid ${color}60` : `1px solid ${color}20`,
      }}
      title={clickable ? `Click to filter by ${label}` : undefined}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}
      >
        <svg className="w-5 h-5" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-2)' }}>{label}</p>
          {clickable && (
            <span
              className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded"
              style={{
                color: active ? '#22D3EE' : 'var(--text-muted)',
                background: active ? 'rgba(6,182,212,0.15)' : 'transparent',
              }}
            >
              {active ? 'Active' : 'Filter'}
            </span>
          )}
        </div>
        <p className="font-display text-lg font-bold truncate" style={{ color }}>{value}</p>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const { token } = useAuth();
  const txRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('all');
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
    let totalIn = 0, totalOut = 0, pending = 0, processing = 0, settling = 0, failed = 0;
    let creditsCount = 0, debitsCount = 0;

    transactions.forEach(tx => {
      const n = parseFloat(String(tx.amount).replace(/[^0-9.]/g, ''));
      // ONLY withdrawal is debit; crypto, deposits, swaps are all CREDIT (inflow)
      const isDebit = tx.type === 'withdrawal' || tx.tag === 'withdrawal';

      if (!isNaN(n)) {
        if (isDebit) {
          totalOut += n;
          debitsCount++;
        } else {
          totalIn += n;
          creditsCount++;
        }
      }

      if (tx.status === 'pending') pending++;
      else if (tx.status === 'processing') processing++;
      else if (tx.status === 'completed_settling') settling++;
      else if (tx.status === 'failed') failed++;
    });

    return {
      totalIn,
      totalOut,
      net: totalIn - totalOut,
      creditsCount,
      debitsCount,
      pending,
      processing,
      settling,
      failed,
      count: transactions.length,
    };
  }, [transactions]);

  const fmt = (n) => `$${Math.round(n).toLocaleString()}`;

  const handleTotalRecordsClick = (statusKey) => {
    let target = statusKey;
    if (!target) {
      if (stats.settling > 0) target = 'completed_settling';
      else if (stats.processing > 0) target = 'processing';
      else if (stats.pending > 0) target = 'pending';
      else if (stats.failed > 0) target = 'failed';
      else target = 'all';
    }

    if (activeFilter === target) {
      setActiveFilter('all');
    } else {
      setActiveFilter(target);
    }

    if (txRef.current) {
      txRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInflowClick = () => {
    setActiveFilter(prev => prev === 'credit' ? 'all' : 'credit');
    if (txRef.current) txRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOutflowClick = () => {
    setActiveFilter(prev => prev === 'withdrawal' ? 'all' : 'withdrawal');
    if (txRef.current) txRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <AppLayout title="Transactions">
      <div className="px-4 lg:px-8 py-6 space-y-5 max-w-6xl mx-auto animate-fadeIn">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Account activity</p>
            <h3 className="font-display text-2xl font-bold" style={{ color: 'var(--text-1)' }}>Transaction history</h3>
          </div>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer self-start sm:self-auto"
            >
              <span>✕ Clear filter:</span>
              <span className="capitalize font-bold">{activeFilter}</span>
            </button>
          )}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            label="Total inflow (Credit)"
            value={fmt(stats.totalIn)}
            sub={`${stats.creditsCount} credit transactions`}
            color="#10B981"
            icon="M7 11l5-5m0 0l5 5m-5-5v12"
            clickable={true}
            active={activeFilter === 'credit'}
            onClick={handleInflowClick}
          />
          <SummaryCard
            label="Total outflow (Debit)"
            value={fmt(stats.totalOut)}
            sub={`${stats.debitsCount} withdrawals (debit only)`}
            color="#EF4444"
            icon="M17 13l-5 5m0 0l-5-5m5 5V6"
            clickable={true}
            active={activeFilter === 'withdrawal'}
            onClick={handleOutflowClick}
          />
          <SummaryCard
            label="Net flow"
            value={`${stats.net >= 0 ? '+' : '-'}${fmt(Math.abs(stats.net))}`}
            sub={stats.net >= 0 ? 'Surplus (Credit > Debit)' : 'Deficit (Debit > Credit)'}
            color={stats.net >= 0 ? '#06B6D4' : '#F59E0B'}
            icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            clickable={activeFilter !== 'all'}
            onClick={() => setActiveFilter('all')}
          />
          <SummaryCard
            label="Total records"
            value={String(stats.count)}
            sub={
              (stats.processing > 0 || stats.settling > 0 || stats.pending > 0 || stats.failed > 0) ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {stats.settling > 0 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); handleTotalRecordsClick('completed_settling'); }}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        activeFilter === 'completed_settling'
                          ? 'bg-teal-500 text-slate-950 shadow-sm'
                          : 'text-teal-300 bg-teal-500/20 border border-teal-500/30 hover:bg-teal-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'completed_settling' ? 'bg-slate-950' : 'bg-teal-400 animate-pulse'}`} />
                      {stats.settling} settling (10-12h)
                    </span>
                  )}
                  {stats.processing > 0 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); handleTotalRecordsClick('processing'); }}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        activeFilter === 'processing'
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'processing' ? 'bg-slate-950' : 'bg-cyan-400 animate-pulse'}`} />
                      {stats.processing} processing
                    </span>
                  )}
                  {stats.pending > 0 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); handleTotalRecordsClick('pending'); }}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        activeFilter === 'pending'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-amber-300 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'pending' ? 'bg-slate-950' : 'bg-amber-400'}`} />
                      {stats.pending} pending
                    </span>
                  )}
                  {stats.failed > 0 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); handleTotalRecordsClick('failed'); }}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        activeFilter === 'failed'
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'text-red-300 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'failed' ? 'bg-white' : 'bg-red-400'}`} />
                      {stats.failed} failed
                    </span>
                  )}
                </div>
              ) : (
                'All settled'
              )
            }
            color="#8B5CF6"
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            clickable={true}
            active={['processing', 'pending', 'failed', 'attention'].includes(activeFilter)}
            onClick={() => handleTotalRecordsClick()}
          />
        </div>

        {/* Full transaction list */}
        <TransactionHistory
          ref={txRef}
          fullHeight={true}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>
    </AppLayout>
  );
}

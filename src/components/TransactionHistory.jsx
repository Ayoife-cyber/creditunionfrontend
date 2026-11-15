import { forwardRef, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import TransactionReceiptModal from './TransactionReceiptModal.jsx';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'deposit', label: 'Deposits' },
  { key: 'withdrawal', label: 'Withdrawals' },
  { key: 'crypto', label: 'Crypto' },
];

const SORTS = [
  { key: 'latest', label: 'Newest' },
  { key: 'amount', label: 'Amount' },
  { key: 'name', label: 'Name' },
];

const TX_ICON_PATHS = {
  deposit: 'M19 14l-7 7m0 0l-7-7m7 7V3',
  withdrawal: 'M5 10l7-7m0 0l7 7M12 3v18',
  swap: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
};

function TxIcon({ type }) {
  if (type === 'crypto') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none">
          ₿
        </text>
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={TX_ICON_PATHS[type] || TX_ICON_PATHS.deposit} />
    </svg>
  );
}

const CACHE_KEY = 'shughar_tx_cache';

const TransactionHistory = forwardRef(function TransactionHistory({
  fullHeight = false,
  activeFilter: controlledFilter,
  onFilterChange,
}, ref) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [internalFilter, setInternalFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState('latest');
  const [selectedTx, setSelectedTx] = useState(null);

  const filter = controlledFilter !== undefined ? controlledFilter : internalFilter;

  const handleSelectFilter = (newFilter) => {
    setInternalFilter(newFilter);
    onFilterChange?.(newFilter);
  };

  // Load from cache instantly so history shows on first render
  const [transactions, setTransactions] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const fetchTransactions = () => {
    if (token) {
      authApi.getMyTransactions(token)
        .then(data => {
          setTransactions(data);
          // Update cache so next refresh is instant
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
        })
        .catch(err => console.error('Failed to load user transactions:', err));
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Use per-user transactions from backend
  const TRANSACTIONS = transactions;

  const statusCounts = useMemo(() => {
    let processing = 0, pending = 0, failed = 0;
    TRANSACTIONS.forEach(t => {
      if (t.status === 'processing') processing++;
      else if (t.status === 'pending') pending++;
      else if (t.status === 'failed') failed++;
    });
    return { processing, pending, failed };
  }, [TRANSACTIONS]);

  const filterOptions = useMemo(() => {
    const list = [{ key: 'all', label: 'All' }];

    if (statusCounts.processing > 0 || filter === 'processing') {
      list.push({
        key: 'processing',
        label: `Processing (${statusCounts.processing})`,
        dot: '#06B6D4',
        glow: true,
      });
    }
    if (statusCounts.pending > 0 || filter === 'pending') {
      list.push({
        key: 'pending',
        label: `Pending (${statusCounts.pending})`,
        dot: '#F59E0B',
      });
    }
    if (statusCounts.failed > 0 || filter === 'failed') {
      list.push({
        key: 'failed',
        label: `Failed (${statusCounts.failed})`,
        dot: '#EF4444',
      });
    }
    if (filter === 'attention') {
      const attnCount = statusCounts.processing + statusCounts.pending + statusCounts.failed;
      list.push({
        key: 'attention',
        label: `Attention (${attnCount})`,
        dot: '#06B6D4',
        glow: true,
      });
    }

    list.push(
      { key: 'credit', label: 'Credits (+)' },
      { key: 'withdrawal', label: 'Withdrawals (-)' },
      { key: 'deposit', label: 'Deposits' },
      { key: 'crypto', label: 'Crypto' }
    );
    return list;
  }, [statusCounts, filter]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return TRANSACTIONS.filter((tx) => {
      const isDebit = tx.type === 'withdrawal' || tx.tag === 'withdrawal';
      const isCredit = !isDebit;

      const matchFilter =
        filter === 'all'
          ? true
          : filter === 'credit'
          ? isCredit
          : filter === 'withdrawal'
          ? isDebit
          : filter === 'attention'
          ? ['processing', 'pending', 'failed'].includes(tx.status)
          : filter === 'processing'
          ? tx.status === 'processing'
          : filter === 'pending'
          ? tx.status === 'pending'
          : filter === 'failed'
          ? tx.status === 'failed'
          : filter === 'completed'
          ? tx.status === 'completed'
          : tx.tag === filter || tx.type === filter;

      const matchSearch =
        !q ||
        tx.label.toLowerCase().includes(q) ||
        tx.amount.toLowerCase().includes(q) ||
        tx.date.toLowerCase().includes(q) ||
        (tx.status && tx.status.toLowerCase().includes(q));

      return matchFilter && matchSearch;
    });
  }, [TRANSACTIONS, filter, query]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortMode === 'amount') {
      list.sort((a, b) => {
        const av = Number.parseFloat(a.amount.replace(/[^0-9.-]/g, ''));
        const bv = Number.parseFloat(b.amount.replace(/[^0-9.-]/g, ''));
        return bv - av;
      });
    }

    if (sortMode === 'name') {
      list.sort((a, b) => a.label.localeCompare(b.label));
    }

    return list;
  }, [filtered, sortMode]);

  const summary = useMemo(() => {
    const credits = filtered.filter((tx) => tx.type !== 'withdrawal' && tx.tag !== 'withdrawal').length;
    const debits = filtered.filter((tx) => tx.type === 'withdrawal' || tx.tag === 'withdrawal').length;
    return {
      count: filtered.length,
      credits,
      debits,
    };
  }, [filtered]);

  return (
    <div ref={ref} className="xl:col-span-3 glass-card rounded-3xl p-5 border border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-sm text-slate-200">Recent Activity</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {summary.count} items • {summary.credits} credits • {summary.debits} debits
          </p>
        </div>
        <button onClick={() => navigate('/transactions')} className="text-xs text-brand-accent font-semibold hover:underline cursor-pointer">See all</button>
      </div>

      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search transactions…"
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl transition-all focus:outline-none"
          style={{ background: 'var(--surface-high)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
        />
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 filter-scroll">
        {filterOptions.map((f) => (
          <button
            key={f.key}
            onClick={() => handleSelectFilter(f.key)}
            className={`filter-btn whitespace-nowrap text-xs px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === f.key ? 'active shadow-lg shadow-brand-accent/20' : ''
            }`}
          >
            {f.dot && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${f.glow ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: f.dot }}
              />
            )}
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 filter-scroll">
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSortMode(s.key)}
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer"
            style={{
              background: sortMode === s.key ? 'rgba(6,182,212,0.15)' : 'var(--surface-high)',
              color:      sortMode === s.key ? 'var(--accent)' : 'var(--text-muted)',
              border:     sortMode === s.key ? '1px solid var(--accent)' : '1px solid var(--border)',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Active Filter Callout */}
      {filter !== 'all' && (
        <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-semibold capitalize">
              Filtered by: {filter === 'attention' ? 'Processing / Pending / Failed' : filter}
            </span>
            <span className="text-slate-400">({filtered.length} found)</span>
          </div>
          <button
            onClick={() => handleSelectFilter('all')}
            className="text-cyan-400 hover:text-cyan-200 underline text-xs font-semibold cursor-pointer"
          >
            Reset to All
          </button>
        </div>
      )}

      <div className={`space-y-2 pr-1 custom-scroll ${fullHeight ? '' : 'max-h-64 overflow-y-auto'}`}>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.12)' }}>
              <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>No transactions yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {filter !== 'all'
                  ? `No ${filter} transactions found. Try a different filter.`
                  : query
                  ? 'No results match your search.'
                  : 'Your activity will appear here once you make a transaction.'}
              </p>
            </div>
          </div>
        ) : (
          sorted.map((tx) => {
            const isDebit = tx.type === 'withdrawal' || tx.tag === 'withdrawal';
            const isCredit = !isDebit;
            const rawAmount = String(tx.amount || '').trim();
            const displayAmount = isCredit
              ? (rawAmount.startsWith('+') ? rawAmount : `+${rawAmount.replace(/^-/, '')}`)
              : (rawAmount.startsWith('-') ? rawAmount : `-${rawAmount.replace(/^\+/, '')}`);
            const displayColor = isDebit ? '#EF4444' : '#10B981';

            return (
              <div
                key={tx.id}
                className="tx-item rounded-xl p-2 cursor-pointer transition-colors"
                style={{ border: '1px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-high)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                onClick={() => setSelectedTx({ ...tx, amount: displayAmount })}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${displayColor}15`, color: displayColor }}
                >
                  <TxIcon type={tx.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>{tx.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{tx.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: displayColor }}>
                    {displayAmount}
                  </p>
                <span
                  className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{
                    background:
                      tx.status === 'processing'
                        ? 'rgba(6,182,212,0.12)'
                        : tx.status === 'pending'
                        ? 'rgba(245,158,11,0.1)'
                        : tx.status === 'failed'
                        ? 'rgba(239,68,68,0.1)'
                        : 'rgba(16,185,129,0.1)',
                    color:
                      tx.status === 'processing'
                        ? '#06B6D4'
                        : tx.status === 'pending'
                        ? '#F59E0B'
                        : tx.status === 'failed'
                        ? '#EF4444'
                        : '#10B981',
                    border:
                      tx.status === 'processing'
                        ? '1px solid rgba(6,182,212,0.28)'
                        : tx.status === 'pending'
                        ? '1px solid rgba(245,158,11,0.2)'
                        : tx.status === 'failed'
                        ? '1px solid rgba(239,68,68,0.2)'
                        : '1px solid rgba(16,185,129,0.2)',
                  }}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* Receipt modal */}
      {selectedTx && (
        <TransactionReceiptModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
});

export default TransactionHistory;

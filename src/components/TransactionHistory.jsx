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

const TransactionHistory = forwardRef(function TransactionHistory({ fullHeight = false }, ref) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState('latest');
  const [selectedTx, setSelectedTx] = useState(null);

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

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return TRANSACTIONS.filter((tx) => {
      const matchFilter = filter === 'all' || tx.tag === filter;
      const matchSearch =
        !q ||
        tx.label.toLowerCase().includes(q) ||
        tx.amount.toLowerCase().includes(q) ||
        tx.date.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [filter, query]);

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
    const deposits = filtered.filter((tx) => tx.tag === 'deposit').length;
    const withdrawals = filtered.filter((tx) => tx.tag === 'withdrawal').length;
    return {
      count: filtered.length,
      deposits,
      withdrawals,
    };
  }, [filtered]);

  return (
    <div ref={ref} className="xl:col-span-3 glass-card rounded-3xl p-5 border border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-sm text-slate-200">Recent Activity</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {summary.count} items • {summary.deposits} deposits • {summary.withdrawals} withdrawals
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
          className="w-full pl-9 pr-4 py-2 text-xs bg-slate-800/50 rounded-xl border border-white/10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent/50 transition-all placeholder-slate-500"
        />
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 filter-scroll">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`filter-btn whitespace-nowrap text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filter === f.key ? 'active shadow-lg shadow-brand-accent/20' : ''
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 filter-scroll">
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSortMode(s.key)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
              sortMode === s.key ? 'border-brand-accent bg-brand-accent/10 text-brand-accent' : 'border-white/10 text-slate-400 bg-slate-800 hover:bg-slate-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

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
              <p className="text-sm font-semibold text-slate-300">No transactions yet</p>
              <p className="text-xs text-slate-500 mt-1">
                {filter !== 'all'
                  ? `No ${filter} transactions found. Try a different filter.`
                  : query
                  ? 'No results match your search.'
                  : 'Your activity will appear here once you make a transaction.'}
              </p>
            </div>
          </div>
        ) : (
          sorted.map((tx) => (
            <div key={tx.id} className="tx-item border border-transparent hover:border-white/5 hover:bg-slate-800/50 cursor-pointer" onClick={() => setSelectedTx(tx)}>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${tx.color}15`, color: tx.color }}
              >
                <TxIcon type={tx.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{tx.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{tx.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold" style={{ color: tx.color }}>
                  {tx.amount}
                </p>
                <span
                  className={`inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400 border border-white/5'
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          ))
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

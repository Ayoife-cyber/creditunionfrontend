import { useMemo } from 'react';
import { TRANSACTIONS } from '../data/mockData.js';

export default function StatsGrid({ btcHolding = 0, balanceUsd = 0 }) {
  const stats = useMemo(() => {
    // Calculate income and expenses from transactions
    let totalIncome = 0;
    let totalExpenses = 0;

    TRANSACTIONS.forEach((tx) => {
      const amount = parseFloat(tx.amount.replace(/[^0-9.-]/g, ''));
      if (tx.type === 'deposit' || (tx.type === 'swap' && tx.amount.startsWith('+'))) {
        totalIncome += Math.abs(amount);
      } else if (tx.type === 'withdrawal' || (tx.type === 'crypto' && tx.amount.startsWith('-'))) {
        totalExpenses += Math.abs(amount);
      }
    });

    const savings = balanceUsd * 0.4;
    const savingsGoal = 50000;
    const btcValue = btcHolding * 80000;

    return [
      {
        label: 'Income',
        value: `$${Math.round(totalIncome).toLocaleString()}`,
        trend: '↑ 12.3% this month',
        trendColor: 'text-emerald-500',
        iconBg: 'bg-blue-50',
        iconColor: 'text-brand-blueLight',
        icon: 'M7 11l5-5m0 0l5 5m-5-5v12',
        progress: Math.min(100, Math.round((totalIncome / 10000) * 100)),
        progressBar: 'bg-blue-400',
      },
      {
        label: 'Expenses',
        value: `$${Math.round(totalExpenses).toLocaleString()}`,
        trend: '↓ 3.1% this month',
        trendColor: 'text-red-400',
        iconBg: 'bg-red-50',
        iconColor: 'text-red-500',
        icon: 'M17 13l-5 5m0 0l-5-5m5 5V6',
        progress: Math.min(100, Math.round((totalExpenses / 5000) * 100)),
        progressBar: 'bg-red-400',
      },
      {
        label: 'BTC Value',
        value: `$${Math.round(btcValue).toLocaleString()}`,
        trend: `${(btcHolding ?? 0).toFixed(6)} BTC`,
        trendColor: 'text-emerald-500',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-500',
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        progress: 64,
        progressBar: 'bg-orange-500',
      },
      {
        label: 'Savings Goal',
        value: `$${Math.round(savings).toLocaleString()}`,
        trend: `Goal: $${savingsGoal.toLocaleString()}`,
        trendColor: 'text-emerald-500',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-500',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        progress: Math.min(100, Math.round((savings / savingsGoal) * 100)),
        progressBar: 'bg-purple-500',
      },
    ];
  }, [balanceUsd, btcHolding]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="stat-card glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-8 h-8 rounded-xl ${s.iconBg.replace('50', '500/10')} flex items-center justify-center border border-white/5`}>
              <svg className={`w-4 h-4 ${s.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} />
              </svg>
            </span>
            <span className="text-xs text-slate-400 font-medium">{s.label}</span>
          </div>
          <p className="font-display font-bold text-lg text-slate-100">{s.value}</p>
          <p className={`text-xs font-medium mt-0.5 ${s.trendColor}`}>{s.trend}</p>
          <div className="mt-3 h-2 rounded-full bg-slate-800">
            <div className={`h-2 rounded-full ${s.progressBar}`} style={{ width: `${Math.min(s.progress, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

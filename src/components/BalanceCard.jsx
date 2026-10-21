import { useEffect, useState } from 'react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getGreeting(hour) {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function BalanceCard({ user, balanceUsd, btcHolding, onAction, onTopUp }) {
  const [now, setNow] = useState(new Date());
  const [balanceHidden, setBalanceHidden] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const dateStr = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;

  const actions = [
    { key: 'account', label: 'Account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { key: 'send', label: 'Send', icon: 'M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8H3m18 0h-3' },
    { key: 'swap', label: 'Swap', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { key: 'withdraw', label: 'Withdraw', icon: 'M5 10l7-7m0 0l7 7M12 3v18' },
  ];

  return (
    <div className="xl:col-span-2 text-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.6) 100%)',
        border: '1px solid rgba(148,163,184,0.1)',
        backdropFilter: 'blur(10px)',
      }}>
      
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{getGreeting(now.getHours())}</p>
            <h2 className="font-display font-bold text-2xl lg:text-3xl text-white">{user?.fullName || 'Member'}</h2>
          </div>
          <div className="text-right">
            <p className="font-mono font-semibold text-lg lg:text-xl text-slate-200 tabular-nums">{`${hh}:${mm}:${ss}`}</p>
            <p className="text-slate-500 text-xs mt-0.5">{dateStr}</p>
          </div>
        </div>

        {/* Balance Section */}
        <div className={`space-y-4 mb-8 ${balanceHidden ? 'balance-hidden' : ''}`}>
          {/* USD Balance */}
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Total Balance</p>
            <div className="flex items-end gap-2 sm:gap-4">
              <span className="font-display font-extrabold text-5xl lg:text-6xl balance-display balance-font tracking-tight">
                ${(balanceUsd ?? 0).toLocaleString()}
              </span>
              <button
                onClick={() => setBalanceHidden((v) => !v)}
                className="mb-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                title="Toggle balance"
              >
                {balanceHidden ? (
                  <svg className="w-5 h-5 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* BTC Balance */}
          <div className="flex items-end gap-2">
            <span className="text-3xl text-cyan-400">₿</span>
            <div>
              <p className="text-slate-400 text-xs font-medium">Bitcoin Holdings</p>
              <p className="font-display font-semibold text-2xl balance-display balance-font">
                {(btcHolding ?? 0).toFixed(6)} BTC
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Horizontal Grid */}
        <div className="space-y-4">
          <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {actions.map((a) => (
              <button
                key={a.key}
                onClick={() => onAction(a.key)}
                className="group relative overflow-hidden rounded-xl lg:rounded-2xl p-3 lg:p-4 transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(71,84,103,0.15)',
                  border: '1px solid rgba(148,163,184,0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(6,182,212,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(71,84,103,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(148,163,184,0.2)';
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-transparent transition-all" />
                <div className="relative flex flex-col items-center gap-2">
                  <span className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 group-hover:from-cyan-500/40 group-hover:to-cyan-500/10 flex items-center justify-center transition-all">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={a.icon} />
                    </svg>
                  </span>
                  <span className="text-xs lg:text-sm font-semibold text-slate-300 group-hover:text-white text-center transition-colors">{a.label}</span>
                </div>
              </button>
            ))}
            
            {/* Top Up Button */}
            <button
              onClick={onTopUp}
              className="group relative overflow-hidden rounded-xl lg:rounded-2xl p-3 lg:p-4 transition-all duration-300 hover:scale-105 col-span-1 sm:col-span-1"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(10,134,95,0.1) 100%)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.35) 0%, rgba(10,134,95,0.2) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(10,134,95,0.1) 100%)';
              }}
            >
              <div className="relative flex flex-col items-center gap-2">
                <span className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-emerald-400/30 to-emerald-500/10 group-hover:from-emerald-400/50 group-hover:to-emerald-500/20 flex items-center justify-center transition-all">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                <span className="text-xs lg:text-sm font-semibold text-emerald-300 group-hover:text-emerald-200 text-center transition-colors leading-tight">Top Up</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

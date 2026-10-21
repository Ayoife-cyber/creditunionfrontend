import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AppLayout from '../components/AppLayout.jsx';
import BalanceCard from '../components/BalanceCard.jsx';
import AccountColumn from '../components/AccountColumn.jsx';
import StatsGrid from '../components/StatsGrid.jsx';
import PortfolioChart from '../components/PortfolioChart.jsx';
import TransactionHistory from '../components/TransactionHistory.jsx';
import WithdrawModal from '../components/WithdrawModal.jsx';
import DepositModal from '../components/DepositModal.jsx';
import AccountInfoModal from '../components/AccountInfoModal.jsx';
import ComingSoonModal from '../components/ComingSoonModal.jsx';
import SupportTicketDrawer from '../components/SupportTicketDrawer.jsx';
import Toast from '../components/Toast.jsx';
import DashboardSkeleton from '../components/DashboardSkeleton.jsx';
import SendMoneyModal from '../components/SendMoneyModal.jsx';
import CurrencyConverter from '../components/CurrencyConverter.jsx';
import { DEFAULT_BALANCE } from '../config/balanceConfig.js';

const ACTION_MESSAGES = {
  send: { msg: 'Account information opened.', type: 'info' },
};

const WITHDRAW_UPGRADE_MSG = 'Please upgrade your account to the next tier. Reach out to us via our support ticket to get started.';
const SWAP_LOW_BALANCE_MSG = 'Your balance is too low to carry out this operation. Kindly top up your balance.';

const QUICK_ACTIONS = [
  { key: 'withdraw', title: 'Withdraw', description: 'Withdraw funds from your account balance', badge: 'Upgrade', nextStep: WITHDRAW_UPGRADE_MSG },
  { key: 'send', title: 'Account info', description: 'View your account details and routing information', badge: 'Ready', nextStep: 'Open the account information view for your records.' },
  { key: 'swap', title: 'Swap crypto', description: 'Turn part of your balance into BTC or USD', badge: 'Live', nextStep: SWAP_LOW_BALANCE_MSG },
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [sendMoneyOpen, setSendMoneyOpen] = useState(false);
  const [accountInfoOpen, setAccountInfoOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState('');
  const [comingSoonMessage, setComingSoonMessage] = useState('');
  const [supportTicketOpen, setSupportTicketOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedAction, setSelectedAction] = useState('withdraw');
  const toastTimeoutRef = useRef(null);
  const txRef = useRef(null);

  const showToast = useCallback((msg, type = 'info') => {
    clearTimeout(toastTimeoutRef.current);
    setToast({ msg, type, hiding: false });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((t) => (t ? { ...t, hiding: true } : t));
      setTimeout(() => setToast(null), 300);
    }, 3000);
  }, []);

  const handleSidebarAction = (item) => {
    switch (item.key) {
      case 'home':
        navigate('/dashboard');
        break;
      case 'transactions':
        navigate('/transactions');
        break;
      case 'cards':
        navigate('/cards');
        break;
      case 'deposit':
        setDepositOpen(true);
        break;
      case 'save-invest':
        setDepositOpen(true);
        break;
      case 'support':
        setSupportTicketOpen(true);
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        setComingSoonTitle(item.label);
        setComingSoonMessage('');
        setComingSoonOpen(true);
    }
  };

  const quickInsights = useMemo(() => {
    const balance = user?.balanceUsd ?? DEFAULT_BALANCE.balanceUsd;
    const btc = user?.btcHolding ?? DEFAULT_BALANCE.btcHolding;
    const usdt = user?.usdtHolding ?? DEFAULT_BALANCE.usdtHolding;
    return [
      { label: 'Spendable', value: `$${Math.round(balance * 0.62).toLocaleString()}`, detail: 'Ready for transfers' },
      { label: 'Savings goal', value: '68%', detail: 'On track this month' },
      { label: 'Crypto assets', value: `$${Math.round(btc * 82000 + usdt).toLocaleString()}`, detail: 'BTC + USDT combined' },
    ];
  }, [user?.balanceUsd, user?.btcHolding, user?.usdtHolding]);

  function handleBalanceAction(action) {
    setSelectedAction(action);
    if (action === 'withdraw') {
      setWithdrawOpen(true);
      return;
    }
    if (action === 'swap') {
      setComingSoonTitle('Swap');
      setComingSoonMessage(SWAP_LOW_BALANCE_MSG);
      setComingSoonOpen(true);
      return;
    }
    if (action === 'send') {
      setSendMoneyOpen(true);
      return;
    }
    if (action === 'account') {
      setAccountInfoOpen(true);
      return;
    }
    const m = ACTION_MESSAGES[action];
    if (m) showToast(m.msg, m.type);
  }

  function handleHistoryScroll() {
    txRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Scrolling to transactions!', 'info');
  }

  function handleTopUp() {
    setDepositOpen(true);
    showToast('Deposit flow is ready.', 'success');
  }

  const selectedQuickAction = QUICK_ACTIONS.find((action) => action.key === selectedAction) || QUICK_ACTIONS[0];

  return (
    <AppLayout title="Dashboard" onSidebarAction={handleSidebarAction}>
      {loading ? (
        <DashboardSkeleton />
      ) : (
      <div className="px-4 lg:px-8 py-6 space-y-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <BalanceCard
            user={user}
            balanceUsd={user?.balanceUsd ?? DEFAULT_BALANCE.balanceUsd}
            btcHolding={user?.btcHolding ?? DEFAULT_BALANCE.btcHolding}
            usdtHolding={user?.usdtHolding ?? DEFAULT_BALANCE.usdtHolding}
            onAction={handleBalanceAction}
            onTopUp={handleTopUp}
          />
          <AccountColumn accountNumber={user?.accountNumber} status={user?.status} onTopUp={handleTopUp} onHistory={handleHistoryScroll} />
        </div>

        <StatsGrid balanceUsd={user?.balanceUsd ?? DEFAULT_BALANCE.balanceUsd} btcHolding={user?.btcHolding ?? DEFAULT_BALANCE.btcHolding} />

        {/* Converter + Snapshot + Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <CurrencyConverter />

          {/* Today's snapshot */}
          <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
                    Today&apos;s snapshot
                  </p>
                  <h3 className="font-display text-lg font-bold" style={{ color: 'var(--text-1)' }}>Account summary</h3>
                </div>
                <span
                  className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}
                >
                  +8.2% this week
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {quickInsights.map((item) => (
                  <div key={item.label} className="stat-card rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                      <p className="mt-0.5 font-display text-base font-bold" style={{ color: 'var(--text-1)' }}>{item.value}</p>
                    </div>
                    <p className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-3xl p-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Quick actions</p>
              <h3 className="font-display text-lg font-bold" style={{ color: 'var(--text-1)' }}>Choose a flow</h3>
            </div>

            <div className="mt-4 space-y-2">
              {QUICK_ACTIONS.map((action) => {
                const active = selectedAction === action.key;
                return (
                  <button
                    key={action.key}
                    onClick={() => handleBalanceAction(action.key)}
                    className="w-full rounded-2xl px-3 py-3 text-left transition-smooth"
                    style={{
                      background: active ? 'rgba(6,182,212,0.12)' : 'var(--surface-high)',
                      border: active ? '1.5px solid rgba(6,182,212,0.4)' : '1px solid var(--border)',
                      boxShadow: active ? '0 2px 12px rgba(6,182,212,0.1)' : 'none',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; e.currentTarget.style.background = 'var(--surface-mid)'; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-high)'; }}}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{action.title}</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4' }}
                      >
                        {action.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{action.description}</p>
                  </button>
                );
              })}
            </div>

            <div
              className="mt-4 rounded-2xl p-3"
              style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: '#06B6D4' }}>
                {selectedQuickAction.title}
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>{selectedQuickAction.nextStep}</p>
            </div>
          </div>
        </div>

        {/* Portfolio + Transactions */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <PortfolioChart />
          <TransactionHistory ref={txRef} />
        </div>
      </div>
      )} {/* end loading conditional */}

      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
      <SendMoneyModal open={sendMoneyOpen} onClose={() => setSendMoneyOpen(false)} userBalance={user?.balanceUsd ?? DEFAULT_BALANCE.balanceUsd} />
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} onCopy={showToast} userEmail={user?.email} />
      <AccountInfoModal
        open={accountInfoOpen}
        onClose={() => setAccountInfoOpen(false)}
        title="Account information"
        subtitle="Use these details for transfers, deposits, and account verification."
        details={[
          { label: 'Account holder', value: user?.fullName || 'Member' },
          { label: 'Account number', value: user?.accountNumber || '1234567890' },
          { label: 'Routing number', value: '021000021' },
        ]}
      />
      <ComingSoonModal open={comingSoonOpen} onClose={() => { setComingSoonOpen(false); setComingSoonMessage(''); }} title={comingSoonTitle} message={comingSoonMessage || undefined} />
      <SupportTicketDrawer open={supportTicketOpen} onClose={() => setSupportTicketOpen(false)} />
      <Toast toast={toast} />
    </AppLayout>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWalletAddress, getUserWalletAddress, saveUserWalletAddress, getUsdtWalletAddress, getUserUsdtWalletAddress, saveUserUsdtWalletAddress } from '../data/mockData.js';
import { authApi } from '../api/client.js';

// -- Helpers ----------------------------------------------------------------

function StatCard({ label, value, sub, color = '#06B6D4' }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.6)' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: 'rgba(100,116,139,0.8)' }}>{sub}</p>}
    </div>
  );
}


function Badge({ text, color = '#06B6D4' }) {
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {text}
    </span>
  );
}

const TX_TYPE_OPTIONS = [
  { value: 'deposit', label: 'Deposit', color: '#10b981', tag: 'deposit' },
  { value: 'withdrawal', label: 'Withdrawal', color: '#ef4444', tag: 'withdrawal' },
  { value: 'crypto', label: 'Crypto', color: '#f97316', tag: 'crypto' },
  { value: 'swap', label: 'Swap', color: '#8b5cf6', tag: 'crypto' },
];

const STATUS_OPTIONS = ['completed', 'pending', 'failed'];

function emptyTx() {
  return {
    id: null,
    type: 'deposit',
    label: '',
    amount: '',
    status: 'completed',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    tag: 'deposit',
    color: '#10b981',
  };
}

// -- Sub-components ---------------------------------------------------------

function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 rounded-2xl p-6 w-full max-w-xs" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-sm text-slate-200 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function TxFormModal({ open, tx, onSave, onClose }) {
  const [form, setForm] = useState(tx || emptyTx());

  useEffect(() => { setForm(tx || emptyTx()); }, [tx, open]);

  if (!open) return null;

  function handleTypeChange(val) {
    const opt = TX_TYPE_OPTIONS.find(o => o.value === val) || TX_TYPE_OPTIONS[0];
    setForm(f => ({ ...f, type: val, tag: opt.tag, color: opt.color }));
  }

  function handleSave() {
    if (!form.label.trim() || !form.amount.trim()) return;
    onSave(form);
  }

  const labelStyle = { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(148,163,184,0.7)', marginBottom: '6px', display: 'block' };
  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', color: '#E2E8F0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none', boxSizing: 'border-box' };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 rounded-2xl p-6 w-full max-w-sm" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        <h3 className="text-base font-bold text-white mb-5">{tx ? 'Edit Transaction' : 'Add Transaction'}</h3>

        <div className="space-y-4">
          <div>
            <label style={labelStyle}>Label</label>
            <input style={inputStyle} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Salary Deposit" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Type</label>
              <select style={inputStyle} value={form.type} onChange={e => handleTypeChange(e.target.value)}>
                {TX_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Amount</label>
              <input style={inputStyle} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="+$1,000.00" />
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} placeholder="Today, 09:00" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={!form.label.trim() || !form.amount.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: form.label.trim() && form.amount.trim() ? 'linear-gradient(135deg, #06B6D4, #6366F1)' : 'rgba(6,182,212,0.2)', cursor: form.label.trim() && form.amount.trim() ? 'pointer' : 'not-allowed' }}
          >Save</button>
        </div>
      </div>
    </div>
  );
}

// -- Tab: Users -------------------------------------------------------------

function UsersTab({ onRefresh }) {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [balanceUsd, setBalanceUsd] = useState('');
  const [btcHolding, setBtcHolding] = useState('');
  const [saved, setSaved] = useState(false);
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cardType, setCardType] = useState('');
  const [spendLimit, setSpendLimit] = useState('');
  const [rewards, setRewards] = useState('');
  const [cardSaved, setCardSaved] = useState(false);

  const [search, setSearch] = useState('');
  // per-user wallet
  const [walletAddr, setWalletAddr] = useState('');
  const [walletSaved, setWalletSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reload = useCallback(async () => { 
    try {
      const data = await authApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (editUser) {
      setBalanceUsd(String(editUser.balanceUsd ?? ''));
      setBtcHolding(String(editUser.btcHolding ?? ''));
      setSaved(false);
      
      setCardNumber(editUser.cardNumber || '');
      setExpiryDate(editUser.expiryDate || '');
      setCardType(editUser.cardType || '');
      setSpendLimit(editUser.spendLimit || '');
      setRewards(editUser.rewards || '');
      setCardSaved(false);

      // load this user's wallet (empty string if using global/default)
      const raw = localStorage.getItem('shughar_user_wallets');
      const store = raw ? JSON.parse(raw) : {};
      setWalletAddr(store[editUser.email] || '');
      setWalletSaved(false);
    }
  }, [editUser]);

  async function handleSaveBalance() {
    if (!editUser) return;
    try {
      const bUsd = parseFloat(balanceUsd) || 0;
      const bBtc = parseFloat(btcHolding) || 0;
      
      // Update the real backend database
      const res = await authApi.updateBalance(editUser.email, { balanceUsd: bUsd, btcHolding: bBtc });
      
      const updated = { ...editUser, balanceUsd: res.balanceUsd, btcHolding: res.btcHolding };
      
      setUsers(prev => prev.map(u => u.email === editUser.email ? updated : u));
      setEditUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update balance: ' + err.message);
    }
  }

  async function handleSaveCardDetails() {
    if (!editUser) return;
    try {
      const payload = { cardNumber, expiryDate, cardType, spendLimit, rewards };
      const res = await authApi.updateCardDetails(editUser.email, payload);
      
      const updated = { ...editUser, ...res };
      
      setUsers(prev => prev.map(u => u.email === editUser.email ? updated : u));
      setEditUser(updated);
      setCardSaved(true);
      setTimeout(() => setCardSaved(false), 2000);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update card details: ' + err.message);
    }
  }

  function handleSaveWallet() {
    if (!editUser) return;
    saveUserWalletAddress(editUser.email, walletAddr);
    setWalletSaved(true);
    setTimeout(() => setWalletSaved(false), 2000);
  }

  function handleClearWallet() {
    if (!editUser) return;
    saveUserWalletAddress(editUser.email, ''); // removes override -> falls back to global
    setWalletAddr('');
    setWalletSaved(false);
  }

  async function handleToggleLock() {
    if (!editUser) return;
    try {
      const res = await authApi.toggleCardLock(editUser.email);
      const updated = { ...editUser, isCardLocked: res.isCardLocked };
      setUsers(prev => prev.map(u => u.email === editUser.email ? updated : u));
      setEditUser(updated);
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle card lock:', err);
      alert('Failed to toggle card lock: ' + err.message);
    }
  }

  async function handleToggleStatus() {
    if (!editUser) return;
    try {
      const res = await authApi.toggleUserStatus(editUser.email);
      const updated = { ...editUser, status: res.status };
      setUsers(prev => prev.map(u => u.email === editUser.email ? updated : u));
      setEditUser(updated);
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle user status:', err);
      alert('Failed to toggle user status: ' + err.message);
    }
  }

  async function handleDeleteUser() {
    if (!editUser) return;
    try {
      await authApi.deleteUser(editUser.email);
      setUsers(prev => prev.filter(u => u.email !== editUser.email));
      setEditUser(null);
      setConfirmDelete(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user: ' + err.message);
    }
  }

  const filtered = users.filter(u =>
    !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
      {/* User list */}
      <div className="xl:col-span-2 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-4 py-2 text-xs rounded-xl text-slate-200 focus:outline-none transition-all placeholder-slate-500"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }} />
          </div>
        </div>
        <div className="divide-y overflow-y-auto" style={{ maxHeight: '480px', divideColor: 'rgba(255,255,255,0.04)' }}>
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500">No users found.</p>
              <p className="text-xs text-slate-600 mt-1">Users appear here after they sign up.</p>
            </div>
          ) : (
            filtered.map(u => (
              <button key={u.email} onClick={() => setEditUser(u)} className="w-full text-left px-4 py-3.5 transition-all flex items-center gap-3"
                style={{ background: editUser?.email === u.email ? 'rgba(6,182,212,0.08)' : 'transparent', borderLeft: editUser?.email === u.email ? '3px solid #06B6D4' : '3px solid transparent' }}
                onMouseEnter={e => { if (editUser?.email !== u.email) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { if (editUser?.email !== u.email) e.currentTarget.style.background = 'transparent'; }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #06B6D4, #6366F1)' }}>
                  {(u.fullName || u.email || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{u.fullName || 'Unnamed'}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <span className="text-xs font-semibold text-slate-400 flex-shrink-0">
                  ${(u.balanceUsd ?? 0).toLocaleString()}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Edit panel */}
      <div className="xl:col-span-3 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {!editUser ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
              <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">Select a user to edit their account</p>
          </div>
        ) : (
          <div>
            {/* User header */}
            <div className="flex items-center gap-4 mb-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #06B6D4, #6366F1)' }}>
                {(editUser.fullName || editUser.email || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white truncate">{editUser.fullName || 'Unnamed'}</h3>
                <p className="text-xs text-slate-400 truncate">{editUser.email}</p>
              </div>
              <Badge text={editUser.accountType || 'Savings'} color="#06B6D4" />
            </div>

            {/* Read-only info */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Mobile', value: editUser.mobileNumber || '-' },
                { label: 'Account No.', value: editUser.accountNumber || '-' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">{label}</p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5 truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* Card & Account Status */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="rounded-xl p-5 flex flex-col justify-between" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-red-400">Card Status</h4>
                  <p className="text-[11px] text-slate-500 mt-1 mb-4">Status: {editUser.isCardLocked ? 'Locked' : 'Active'}</p>
                </div>
                <button
                  onClick={handleToggleLock}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                  style={{ background: editUser.isCardLocked ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                >
                  {editUser.isCardLocked ? 'Unlock Card' : 'Lock Card'}
                </button>
              </div>
              
              <div className="rounded-xl p-5 flex flex-col justify-between" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Account Status</h4>
                  <p className="text-[11px] text-slate-500 mt-1 mb-4">Status: {editUser.status === 'inactive' ? 'Inactive' : 'Active'}</p>
                </div>
                <button
                  onClick={handleToggleStatus}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                  style={{ background: editUser.status === 'inactive' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #64748b, #475569)' }}
                >
                  {editUser.status === 'inactive' ? 'Set Active' : 'Set Inactive'}
                </button>
              </div>
            </div>

            {/* Editable Card Details */}
            <div className="rounded-xl p-5 mb-5" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Edit Card Details</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => { setCardNumber(e.target.value); setCardSaved(false); }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}
                    placeholder="**** 4821"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Expiry Date</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={e => { setExpiryDate(e.target.value); setCardSaved(false); }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}
                    placeholder="09/28"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Card Type</label>
                  <input
                    type="text"
                    value={cardType}
                    onChange={e => { setCardType(e.target.value); setCardSaved(false); }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}
                    placeholder="Platinum"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Spend Limit</label>
                  <input
                    type="text"
                    value={spendLimit}
                    onChange={e => { setSpendLimit(e.target.value); setCardSaved(false); }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}
                    placeholder="$8,500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Rewards</label>
                  <input
                    type="text"
                    value={rewards}
                    onChange={e => { setRewards(e.target.value); setCardSaved(false); }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}
                    placeholder="4,820 pts"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveCardDetails}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                style={{ background: cardSaved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 16px rgba(99,102,241,0.2)' }}
              >
                {cardSaved ? (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> Saved!</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg> Save Card Details</>
                )}
              </button>
            </div>

            {/* Editable balance */}
            <div className="rounded-xl p-5 mb-5" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)' }}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">Edit Balance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">USD Balance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
                    <input
                      id={`balance-usd-${editUser.email}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={balanceUsd}
                      onChange={e => { setBalanceUsd(e.target.value); setSaved(false); }}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm text-white focus:outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.2)' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(6,182,212,0.2)'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">BTC Holding</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 text-sm font-semibold">₿</span>
                    <input
                      id={`balance-btc-${editUser.email}`}
                      type="number"
                      min="0"
                      step="0.000001"
                      value={btcHolding}
                      onChange={e => { setBtcHolding(e.target.value); setSaved(false); }}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm text-white focus:outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.2)' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(6,182,212,0.2)'}
                    />
                  </div>
                </div>
              </div>
              <button
                id="save-balance-btn"
                onClick={handleSaveBalance}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                style={{ background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #06B6D4, #6366F1)', boxShadow: '0 4px 16px rgba(6,182,212,0.2)' }}
              >
                {saved ? (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> Saved!</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg> Save Balance Changes</>
                )}
              </button>
            </div>

            {/* Per-user wallet address */}
            <div className="rounded-xl p-5" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">Deposit Wallet Address</h4>
                {walletAddr ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>Custom set</span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(100,116,139,0.1)', color: '#64748b', border: '1px solid rgba(100,116,139,0.2)' }}>Using global</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-3">Leave blank to use the global address from Settings.</p>
              <textarea
                id={`wallet-addr-${editUser.email}`}
                value={walletAddr}
                onChange={e => { setWalletAddr(e.target.value); setWalletSaved(false); }}
                rows={2}
                placeholder={`Global: ${getUserWalletAddress('')}`}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-mono text-slate-200 focus:outline-none transition-all resize-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,158,11,0.2)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(245,158,11,0.2)'}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleClearWallet}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  Clear (use global)
                </button>
                <button
                  id={`save-wallet-btn-${editUser.email}`}
                  onClick={handleSaveWallet}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                  style={{ background: walletSaved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  {walletSaved ? (
                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> Saved!</>
                  ) : (
                    'Save Wallet Address'
                  )}
                </button>
              </div>
            </div>
            
            {/* Delete Account */}
            <div className="mt-8 pt-5 border-t" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">Danger Zone</h4>
              <p className="text-[11px] text-slate-500 mb-4">Deleting an account is irreversible. All associated data will be removed.</p>
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #991b1b, #7f1d1d)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete User Account
              </button>
            </div>
            </div>
          )}
        
        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={confirmDelete}
          title="Delete User Account"
          message={`Are you sure you want to permanently delete the account for ${editUser?.email}? This action cannot be undone.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setConfirmDelete(false)}
        />
        </div>
      </div>
    );
  }

// -- Tab: Transactions ------------------------------------------------------

function TransactionsTab() {
  const [users, setUsers] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [txList, setTxList] = useState([]);
  const [txModal, setTxModal] = useState({ open: false, tx: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  useEffect(() => {
    authApi.getUsers().then(data => setUsers(data || [])).catch(console.error);
  }, []);

  async function loadTx(email) {
    setSelectedEmail(email);
    try {
      const data = await authApi.getUserTransactions(email);
      setTxList(data || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setTxList([]);
    }
  }

  async function handleSaveTx(tx) {
    try {
      if (tx.id) {
        const updated = await authApi.updateTransaction(tx.id, tx);
        setTxList(txList.map(t => t.id === tx.id ? updated : t));
      } else {
        const created = await authApi.addTransaction(selectedEmail, tx);
        setTxList([created, ...txList]);
      }
      setTxModal({ open: false, tx: null });
    } catch (err) {
      console.error('Failed to save transaction:', err);
      alert('Failed to save transaction: ' + err.message);
    }
  }

  async function handleDeleteTx(id) {
    try {
      await authApi.deleteTransaction(id);
      setTxList(txList.filter(t => t.id !== id));
      setConfirmDelete({ open: false, id: null });
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      alert('Failed to delete transaction: ' + err.message);
    }
  }

  const typeColorMap = { deposit: '#10b981', withdrawal: '#ef4444', crypto: '#f97316', swap: '#8b5cf6' };

  return (
    <div>
      {/* User selector */}
      <div className="flex items-center gap-3 mb-5">
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Select User:</label>
        <select
          id="tx-user-select"
          value={selectedEmail}
          onChange={e => loadTx(e.target.value)}
          className="text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', minWidth: '220px' }}
        >
          <option value="">- choose a user -</option>
          {users.map(u => <option key={u.email} value={u.email}>{u.fullName || u.email}</option>)}
        </select>
        {selectedEmail && (
          <div className="ml-auto flex gap-2">
            <button
              id="add-tx-btn"
              onClick={() => setTxModal({ open: true, tx: null })}
              className="text-xs px-4 py-2 rounded-xl font-semibold text-white transition-all flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #06B6D4, #6366F1)' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Add Transaction
            </button>
          </div>
        )}
      </div>

      {!selectedEmail ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm text-slate-500">Select a user to view and manage their transactions.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <h3 className="text-sm font-bold text-white">Transaction History</h3>
              <p className="text-xs text-slate-500 mt-0.5">{txList.length} entries for {selectedEmail}</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Label', 'Type', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.5)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: 'rgba(255,255,255,0.03)' }}>
                {txList.length === 0 ? (
                  <tr><td colSpan="6" className="px-5 py-8 text-center text-xs text-slate-500">No transactions. Add one above.</td></tr>
                ) : (
                  txList.map(tx => (
                    <tr key={tx.id} className="group transition-all" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-slate-200">{tx.label}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge text={tx.type} color={typeColorMap[tx.type] || '#06B6D4'} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-bold" style={{ color: typeColorMap[tx.type] || '#06B6D4' }}>{tx.amount}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-slate-400">{tx.date}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge text={tx.status} color={tx.status === 'completed' ? '#10b981' : tx.status === 'pending' ? '#f59e0b' : '#ef4444'} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setTxModal({ open: true, tx })}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all text-slate-400 hover:text-cyan-400"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                            title="Edit">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ open: true, id: tx.id })}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all text-slate-400 hover:text-red-400"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                            title="Delete">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TxFormModal open={txModal.open} tx={txModal.tx} onSave={handleSaveTx} onClose={() => setTxModal({ open: false, tx: null })} />
      <ConfirmModal
        open={confirmDelete.open}
        message="Delete this transaction? This cannot be undone."
        onConfirm={() => handleDeleteTx(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </div>
  );
}

// -- Tab: Settings ----------------------------------------------------------

function SettingsTab() {
  // ── BTC ──
  const [address, setAddress] = useState(getWalletAddress());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function handleSave() {
    if (!address.trim()) { setError('Address cannot be empty.'); return; }
    localStorage.setItem('shughar_wallet_address', address.trim());
    setSaved(true);
    setError('');
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    localStorage.removeItem('shughar_wallet_address');
    setAddress('bc1qrkue55nt2h0pjkge2yk7jqkekymxknawr982py');
    setSaved(false);
  }

  // ── USDT ──
  const [usdtAddress, setUsdtAddress] = useState(getUsdtWalletAddress());
  const [usdtSaved, setUsdtSaved] = useState(false);
  const [usdtError, setUsdtError] = useState('');

  function handleUsdtSave() {
    if (!usdtAddress.trim()) { setUsdtError('Address cannot be empty.'); return; }
    localStorage.setItem('shughar_usdt_wallet_address', usdtAddress.trim());
    setUsdtSaved(true);
    setUsdtError('');
    setTimeout(() => setUsdtSaved(false), 2500);
  }

  function handleUsdtReset() {
    localStorage.removeItem('shughar_usdt_wallet_address');
    setUsdtAddress('0xD5d04b7628fE6d0834870888Fe557972aF8Ca49f');
    setUsdtSaved(false);
  }

  return (
    <div className="max-w-lg space-y-6">

      {/* ── BTC Wallet Card ── */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Global BTC Wallet Address</h3>
            <p className="text-xs text-slate-400 mt-0.5">Shown to ALL users on the Deposit modal (Bitcoin tab)</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">BTC Deposit Address</label>
          <textarea
            id="wallet-address-input"
            value={address}
            onChange={e => { setAddress(e.target.value); setSaved(false); setError(''); }}
            rows={3}
            placeholder="bc1q..."
            className="w-full px-4 py-3 rounded-xl text-sm font-mono text-slate-200 focus:outline-none transition-all resize-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}` }}
            onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
            onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}
          />
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            Reset to Default
          </button>
          <button
            id="save-wallet-btn"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
            style={{ background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
            {saved ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> Saved!</>
            ) : (
              'Save BTC Address'
            )}
          </button>
        </div>

        <div className="mt-4 rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-amber-400/70">Changes take effect immediately — users will see the new address the next time they open the Deposit modal.</p>
        </div>
      </div>

      {/* ── USDT Wallet Card ── */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(38,161,123,0.15)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold" style={{ background: 'rgba(38,161,123,0.1)', border: '1px solid rgba(38,161,123,0.25)', color: '#26A17B' }}>
            ₮
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Global USDT Wallet Address</h3>
            <p className="text-xs text-slate-400 mt-0.5">Shown to ALL users on the Deposit modal (USDT tab)</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#26A17B', opacity: 0.8 }}>USDT Deposit Address (ERC-20)</label>
          <textarea
            id="usdt-wallet-address-input"
            value={usdtAddress}
            onChange={e => { setUsdtAddress(e.target.value); setUsdtSaved(false); setUsdtError(''); }}
            rows={3}
            placeholder="0x..."
            className="w-full px-4 py-3 rounded-xl text-sm font-mono text-slate-200 focus:outline-none transition-all resize-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${usdtError ? 'rgba(239,68,68,0.4)' : 'rgba(38,161,123,0.15)'}` }}
            onFocus={e => e.target.style.borderColor = 'rgba(38,161,123,0.5)'}
            onBlur={e => e.target.style.borderColor = usdtError ? 'rgba(239,68,68,0.4)' : 'rgba(38,161,123,0.15)'}
          />
          {usdtError && <p className="text-xs text-red-400 mt-1">{usdtError}</p>}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleUsdtReset}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            Reset to Default
          </button>
          <button
            id="save-usdt-wallet-btn"
            onClick={handleUsdtSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
            style={{ background: usdtSaved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #26A17B, #1a7a5e)' }}>
            {usdtSaved ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> Saved!</>
            ) : (
              'Save USDT Address'
            )}
          </button>
        </div>

        <div className="mt-4 rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(38,161,123,0.06)', border: '1px solid rgba(38,161,123,0.15)' }}>
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#26A17B' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs" style={{ color: 'rgba(38,161,123,0.7)' }}>Ensure this is an ERC-20 compatible address. Changes take effect immediately.</p>
        </div>
      </div>

    </div>
  );
}

// -- Main AdminPanel component ----------------------------------------------

const TABS = [
  { key: 'users', label: 'Users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { key: 'transactions', label: 'Transactions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { key: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [userCount, setUserCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    authApi.getUsers().then(data => setUserCount(data ? data.length : 0)).catch(console.error);
  }, [refreshKey]);

  function handleLogout() {
    sessionStorage.removeItem('shughar_admin_auth');
    localStorage.removeItem('shughar_admin_token');
    navigate('/admin/login', { replace: true });
  }

  const walletOverrideSet = !!localStorage.getItem('shughar_wallet_address');

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #060b18 0%, #0a1020 50%, #070d1a 100%)' }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* Top bar */}
      <header className="relative z-10 border-b" style={{ background: 'rgba(6,11,24,0.9)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #06B6D4, #6366F1)' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-white">WalletSync Admin</span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.2)' }}>Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block">Session active</span>
            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              className="text-xs px-4 py-2 rounded-xl font-semibold text-slate-300 transition-all flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#f87171'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#cbd5e1'; }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Users" value={userCount} sub="Registered accounts" />
          <StatCard label="Wallet Override" value={walletOverrideSet ? 'Active' : 'Default'} sub={walletOverrideSet ? 'Custom address set' : 'Using hardcoded address'} color={walletOverrideSet ? '#10b981' : '#64748b'} />
          <StatCard label="Admin Session" value="Active" sub="sessionStorage auth" color="#8b5cf6" />
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-6 p-1 rounded-2xl w-fit" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab.key ? 'rgba(6,182,212,0.1)' : 'transparent',
                color: activeTab === tab.key ? '#06B6D4' : '#64748b',
                border: activeTab === tab.key ? '1px solid rgba(6,182,212,0.25)' : '1px solid transparent',
              }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'users' && <UsersTab onRefresh={() => setRefreshKey(k => k + 1)} />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}


import { useEffect, useState } from 'react';

// ── Fetch live BTC + USDT prices ───────────────────────────────────────────
async function fetchLivePrices() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=usd',
      { signal: controller.signal }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      btcUsd:  data?.bitcoin?.usd ?? null,
      usdtUsd: data?.tether?.usd  ?? null,
    };
  } catch { return null; }
  finally { clearTimeout(timeout); }
}

const COINS = [
  { key: 'BTC',  label: 'Bitcoin',  icon: '₿', color: '#F59E0B' },
  { key: 'USDT', label: 'Tether',   icon: '₮', color: '#26A17B' },
  { key: 'USD',  label: 'US Dollar', icon: '$', color: '#6366F1' },
];

export default function CurrencyConverter() {
  const [fromCoin, setFromCoin] = useState('BTC');
  const [toCoin,   setToCoin]   = useState('USD');
  const [amount,   setAmount]   = useState('1');
  const [btcPrice, setBtcPrice] = useState(82000);
  const [usdtPrice, setUsdtPrice] = useState(1.0);
  const [live, setLive] = useState(false);

  useEffect(() => {
    fetchLivePrices().then(d => {
      if (d?.btcUsd)  { setBtcPrice(d.btcUsd);  setLive(true); }
      if (d?.usdtUsd) { setUsdtPrice(d.usdtUsd); }
    });
    const iv = setInterval(() => {
      fetchLivePrices().then(d => {
        if (d?.btcUsd)  setBtcPrice(d.btcUsd);
        if (d?.usdtUsd) setUsdtPrice(d.usdtUsd);
      });
    }, 60000);
    return () => clearInterval(iv);
  }, []);

  // Convert any coin to USD first, then to target
  function toUsd(value, coin) {
    const v = parseFloat(value) || 0;
    if (coin === 'BTC')  return v * btcPrice;
    if (coin === 'USDT') return v * usdtPrice;
    return v; // USD
  }

  function fromUsd(usdValue, coin) {
    if (coin === 'BTC')  return usdValue / btcPrice;
    if (coin === 'USDT') return usdValue / usdtPrice;
    return usdValue;
  }

  const rawInput   = parseFloat(amount) || 0;
  const usdValue   = toUsd(rawInput, fromCoin);
  const result     = fromUsd(usdValue, toCoin);

  function formatResult(val, coin) {
    if (!isFinite(val)) return '—';
    if (coin === 'BTC')  return val.toFixed(8);
    if (coin === 'USDT') return val.toFixed(4);
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function swap() {
    setFromCoin(toCoin);
    setToCoin(fromCoin);
  }

  const fromMeta = COINS.find(c => c.key === fromCoin);
  const toMeta   = COINS.find(c => c.key === toCoin);

  return (
    <div className="glass-card h-full min-w-0 overflow-hidden rounded-3xl p-4 sm:p-5">
      {/* Header */}
      <div className="mb-4 flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Currency Converter</p>
          <h3 className="font-display text-lg font-bold" style={{ color: 'var(--text-1)' }}>Convert Crypto & USD</h3>
        </div>
        {live && (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      {/* From */}
      <div className="rounded-2xl p-4 mb-2" style={{ background: 'var(--surface-high)', border: '1px solid var(--border)' }}>
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>From</p>
        <div className="grid min-w-0 grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-3">
          <select
            value={fromCoin}
            onChange={e => setFromCoin(e.target.value)}
            className="w-full min-w-0 rounded-xl px-2 py-2 text-sm font-bold focus:outline-none transition-all sm:w-auto sm:px-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: fromMeta?.color }}
          >
            {COINS.map(c => (
              <option key={c.key} value={c.key} disabled={c.key === toCoin}>
                {c.icon} {c.key}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="min-w-0 w-full bg-transparent text-right text-xl font-bold focus:outline-none"
            style={{ color: 'var(--text-1)' }}
            placeholder="0"
          />
        </div>
        <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
          ≈ ${usdValue.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
        </p>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center my-1">
        <button
          onClick={swap}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', color: '#06B6D4' }}
          title="Swap currencies"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
              d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* To */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--surface-high)', border: '1px solid var(--border)' }}>
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>To</p>
        <div className="grid min-w-0 grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-3">
          <select
            value={toCoin}
            onChange={e => setToCoin(e.target.value)}
            className="w-full min-w-0 rounded-xl px-2 py-2 text-sm font-bold focus:outline-none transition-all sm:w-auto sm:px-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: toMeta?.color }}
          >
            {COINS.map(c => (
              <option key={c.key} value={c.key} disabled={c.key === fromCoin}>
                {c.icon} {c.key}
              </option>
            ))}
          </select>
          <p className="min-w-0 break-words text-right text-xl font-bold" style={{ color: toMeta?.color }}>
            {formatResult(result, toCoin)}
          </p>
        </div>
        <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{toMeta?.label}</p>
      </div>

      {/* Rate reference */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="whitespace-nowrap">1 BTC = ${btcPrice.toLocaleString()}</span>
        <span className="whitespace-nowrap">1 USDT = ${usdtPrice.toFixed(4)}</span>
      </div>
    </div>
  );
}

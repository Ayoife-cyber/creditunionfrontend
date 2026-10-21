import { useEffect, useState } from 'react';
import { BTC_PRICE_USD } from '../data/mockData.js';

// Fetch live BTC + USDT prices from CoinGecko in one request (free, no API key needed)
async function fetchLivePrices() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=usd&include_24hr_change=true',
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      btc: {
        price:  data?.bitcoin?.usd              ?? null,
        change: data?.bitcoin?.usd_24h_change   ?? null,
      },
      usdt: {
        price:  data?.tether?.usd               ?? null,
        change: data?.tether?.usd_24h_change    ?? null,
      },
    };
  } catch {
    return null;
  }
}

export default function AccountColumn({ accountNumber, status, onTopUp, onHistory }) {
  // BTC
  const [btcPrice, setBtcPrice]     = useState(BTC_PRICE_USD);
  const [btcChange, setBtcChange]   = useState(2.4);
  const [btcLive, setBtcLive]       = useState(false);

  // USDT
  const [usdtPrice, setUsdtPrice]   = useState(1.00);
  const [usdtChange, setUsdtChange] = useState(0.01);
  const [usdtLive, setUsdtLive]     = useState(false);

  useEffect(() => {
    function applyData(data) {
      if (!data) return;
      if (data.btc?.price) {
        setBtcPrice(data.btc.price);
        setBtcChange(Number(data.btc.change?.toFixed(2) ?? 2.4));
        setBtcLive(true);
      }
      if (data.usdt?.price) {
        setUsdtPrice(data.usdt.price);
        setUsdtChange(Number(data.usdt.change?.toFixed(4) ?? 0.01));
        setUsdtLive(true);
      }
    }

    fetchLivePrices().then(applyData);
    const interval = setInterval(() => fetchLivePrices().then(applyData), 60000);
    return () => clearInterval(interval);
  }, []);

  const btcPositive  = Number(btcChange)  >= 0;
  const usdtPositive = Number(usdtChange) >= 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Account Card */}
      <div className="glass-card rounded-3xl p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">Account</span>
          {status === 'inactive' ? (
            <span className="px-2.5 py-1 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full border border-red-500/20">
              ● Inactive
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
              ● Active
            </span>
          )}
        </div>
        <p className="font-display font-bold text-xl text-slate-100 tracking-widest mb-4">
          {accountNumber || '—'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onTopUp}
            className="action-btn flex-1 text-xs font-semibold bg-brand-accent text-white rounded-xl py-2.5 hover:bg-brand-accentHover transition-all shadow-lg shadow-brand-accent/20"
          >
            Deposit
          </button>
          <button
            onClick={onHistory}
            className="action-btn flex-1 text-xs font-semibold bg-slate-700/60 text-slate-300 rounded-xl py-2.5 hover:bg-slate-700 transition-all border border-white/5"
          >
            History
          </button>
        </div>
      </div>

      {/* BTC Price Card */}
      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
              ₿
            </span>
            <span className="text-sm font-semibold text-slate-300">Bitcoin</span>
          </div>
          <div className="flex items-center gap-1.5">
            {btcLive && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            )}
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                btcPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {btcPositive ? '+' : ''}{btcChange}%
            </span>
          </div>
        </div>
        <p className="font-display font-bold text-2xl text-slate-100">${Number(btcPrice).toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-0.5">{btcLive ? 'Live BTC/USD · CoinGecko' : 'BTC/USD rate'}</p>
      </div>

      {/* USDT Price Card */}
      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: 'rgba(38,161,123,0.1)', border: '1px solid rgba(38,161,123,0.25)', color: '#26A17B' }}>
              ₮
            </span>
            <span className="text-sm font-semibold text-slate-300">Tether</span>
          </div>
          <div className="flex items-center gap-1.5">
            {usdtLive && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            )}
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                usdtPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {usdtPositive ? '+' : ''}{usdtChange}%
            </span>
          </div>
        </div>
        <p className="font-display font-bold text-2xl text-slate-100">${Number(usdtPrice).toFixed(4)}</p>
        <p className="text-xs text-slate-500 mt-0.5">{usdtLive ? 'Live USDT/USD · CoinGecko' : 'USDT/USD rate'}</p>
      </div>

    </div>
  );
}

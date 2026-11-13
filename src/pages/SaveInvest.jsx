import { useState, useEffect, useMemo, useRef } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import DepositModal from '../components/DepositModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../api/client.js';

// Market instruments configuration
const MARKETS = [
  { symbol: 'BTC/USD', name: 'Bitcoin', category: 'crypto', basePrice: 91420.50, decimals: 2, icon: '₿', step: 0.0001 },
  { symbol: 'ETH/USD', name: 'Ethereum', category: 'crypto', basePrice: 3385.20, decimals: 2, icon: 'Ξ', step: 0.001 },
  { symbol: 'SOL/USD', name: 'Solana', category: 'crypto', basePrice: 194.80, decimals: 2, icon: '◎', step: 0.01 },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex', basePrice: 1.0845, decimals: 4, icon: '€', step: 100 },
  { symbol: 'GBP/USD', name: 'British Pound', category: 'forex', basePrice: 1.2982, decimals: 4, icon: '£', step: 100 },
  { symbol: 'USD/JPY', name: 'US Dollar / Yen', category: 'forex', basePrice: 154.35, decimals: 3, icon: '¥', step: 100 },
  { symbol: 'XAU/USD', name: 'Gold Spot', category: 'commodities', basePrice: 2684.40, decimals: 2, icon: '🪙', step: 0.01 },
];

const TIMEFRAMES = ['1m', '5m', '15m', '1H', '1D', '1W'];
const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20];

// Generate initial candlestick history
function generateInitialCandles(basePrice, count = 35) {
  const candles = [];
  let currentClose = basePrice;
  const now = Date.now();
  const stepMs = 60 * 1000;

  for (let i = count; i >= 0; i--) {
    const volatility = basePrice * 0.0035;
    const change = (Math.random() - 0.49) * volatility;
    const open = currentClose;
    const close = Math.max(basePrice * 0.5, open + change);
    const high = Math.max(open, close) + Math.random() * (volatility * 0.6);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.6);
    const volume = Math.floor(Math.random() * 50) + 10;

    candles.push({
      time: now - i * stepMs,
      open,
      high,
      low,
      close,
      volume,
    });
    currentClose = close;
  }
  return candles;
}

export default function SaveInvestPage() {
  const { user, updateUserState } = useAuth();
  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]);
  const [timeframe, setTimeframe] = useState('15m');
  const [chartType, setChartType] = useState('candles'); // 'candles' | 'area'
  const [tradeMode, setTradeMode] = useState('position'); // 'position' | 'spot'
  const [orderSide, setOrderSide] = useState('buy'); // 'buy' | 'sell'
  const [orderType, setOrderType] = useState('market'); // 'market' | 'limit'
  const [leverage, setLeverage] = useState(5);
  const [orderAmountUsd, setOrderAmountUsd] = useState('250');
  const [limitPrice, setLimitPrice] = useState('');
  
  // Real-time market state
  const [marketPrices, setMarketPrices] = useState(() => {
    const initial = {};
    MARKETS.forEach(m => {
      initial[m.symbol] = {
        price: m.basePrice,
        change24h: +(Math.random() * 4.2 - 1.5).toFixed(2),
        high24h: m.basePrice * 1.025,
        low24h: m.basePrice * 0.978,
        volume24h: Math.floor(Math.random() * 850000) + 120000,
      };
    });
    return initial;
  });

  const [candles, setCandles] = useState(() => generateInitialCandles(MARKETS[0].basePrice));
  const [recentTrades, setRecentTrades] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closingPositionId, setClosingPositionId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('positions'); // 'positions' | 'history'

  const currentPrice = marketPrices[selectedMarket.symbol]?.price || selectedMarket.basePrice;
  const currentStats = marketPrices[selectedMarket.symbol] || {
    price: selectedMarket.basePrice,
    change24h: 1.25,
    high24h: selectedMarket.basePrice * 1.02,
    low24h: selectedMarket.basePrice * 0.98,
    volume24h: 540000,
  };

  // Re-seed candles when switching symbol
  useEffect(() => {
    setCandles(generateInitialCandles(selectedMarket.basePrice));
    setLimitPrice(selectedMarket.basePrice.toFixed(selectedMarket.decimals));
  }, [selectedMarket.symbol]);

  // Real-time market price oscillation & candle ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketPrices(prev => {
        const next = { ...prev };
        MARKETS.forEach(m => {
          const current = next[m.symbol]?.price || m.basePrice;
          const delta = (Math.random() - 0.495) * (current * 0.0009);
          const newPrice = Math.max(m.basePrice * 0.2, current + delta);
          next[m.symbol] = {
            ...next[m.symbol],
            price: newPrice,
          };
        });
        return next;
      });

      // Update current candle or start new candle periodically
      setCandles(prevCandles => {
        if (!prevCandles || prevCandles.length === 0) return prevCandles;
        const lastCandle = { ...prevCandles[prevCandles.length - 1] };
        const price = marketPrices[selectedMarket.symbol]?.price || selectedMarket.basePrice;
        
        lastCandle.close = price;
        if (price > lastCandle.high) lastCandle.high = price;
        if (price < lastCandle.low) lastCandle.low = price;
        lastCandle.volume += Math.floor(Math.random() * 3) + 1;

        return [...prevCandles.slice(0, -1), lastCandle];
      });

      // Push simulated live trades
      setRecentTrades(prev => {
        const side = Math.random() > 0.48 ? 'buy' : 'sell';
        const price = marketPrices[selectedMarket.symbol]?.price || selectedMarket.basePrice;
        const size = +(Math.random() * (selectedMarket.symbol.startsWith('BTC') ? 0.35 : 5.5) + 0.01).toFixed(4);
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newTrade = { id: Date.now() + Math.random(), side, price, size, time };
        return [newTrade, ...prev.slice(0, 18)];
      });
    }, 1400);

    return () => clearInterval(interval);
  }, [selectedMarket.symbol, selectedMarket.basePrice, marketPrices]);

  // Computed account values
  const balanceUsd = Number(user?.balanceUsd || 0);
  const btcHolding = Number(user?.btcHolding || 0);
  const usdtHolding = Number(user?.usdtHolding || 0);
  const btcPrice = marketPrices['BTC/USD']?.price || 91420;
  const totalPortfolioEquity = balanceUsd + (btcHolding * btcPrice) + usdtHolding;

  // Order calculations
  const parsedAmountUsd = parseFloat(orderAmountUsd) || 0;
  const orderUnits = currentPrice > 0 ? (parsedAmountUsd * (tradeMode === 'position' ? leverage : 1)) / currentPrice : 0;
  const isBtcTrade = selectedMarket.symbol.startsWith('BTC');

  // Handle quick percentage selection
  const handleQuickPercent = (pct) => {
    if (balanceUsd <= 0) {
      setOrderAmountUsd('0');
      return;
    }
    const val = (balanceUsd * (pct / 100)).toFixed(2);
    setOrderAmountUsd(val);
  };

  // Execute Order
  const handlePlaceOrder = async () => {
    setErrorMessage(null);
    setToastMessage(null);

    if (parsedAmountUsd <= 0) {
      setErrorMessage('Please enter a valid order amount greater than $0');
      return;
    }

    if (tradeMode === 'spot' && orderSide === 'sell') {
      if (isBtcTrade && btcHolding < orderUnits) {
        setErrorMessage(`Insufficient BTC holding. You have ${btcHolding.toFixed(6)} BTC.`);
        return;
      }
    } else {
      if (parsedAmountUsd > balanceUsd) {
        setErrorMessage(`Insufficient USD balance. Available: $${balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Please deposit funds to continue.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let action = 'open_position';
      if (tradeMode === 'spot') {
        action = orderSide === 'buy' ? 'spot_buy' : 'spot_sell';
      }

      const payload = {
        action,
        symbol: selectedMarket.symbol,
        side: orderSide,
        assetType: selectedMarket.category,
        amountUsd: parsedAmountUsd,
        cryptoAmount: orderUnits,
        price: orderType === 'limit' && parseFloat(limitPrice) ? parseFloat(limitPrice) : currentPrice,
        leverage: tradeMode === 'position' ? leverage : 1,
      };

      const res = await authApi.executeTrade(payload);
      if (res?.user && updateUserState) {
        updateUserState(res.user);
      }

      setToastMessage({
        type: 'success',
        text: `Order executed! ${orderSide.toUpperCase()} ${selectedMarket.symbol} for $${parsedAmountUsd.toLocaleString()}`,
      });
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Trade execution failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close Open Position
  const handleClosePosition = async (position) => {
    setClosingPositionId(position.id);
    setErrorMessage(null);
    try {
      // Calculate dynamic PnL
      const livePrice = marketPrices[position.symbol]?.price || position.entryPrice;
      const isLong = position.side === 'buy' || position.side === 'long';
      const priceDelta = livePrice - position.entryPrice;
      const rawPnl = (priceDelta / position.entryPrice) * position.amountUsd * (position.leverage || 1);
      const pnl = isLong ? rawPnl : -rawPnl;

      const res = await authApi.executeTrade({
        action: 'close_position',
        positionId: position.id,
        pnl: +pnl.toFixed(2),
        closePrice: livePrice,
      });

      if (res?.user && updateUserState) {
        updateUserState(res.user);
      }

      setToastMessage({
        type: 'success',
        text: `Position closed! Returned $${(position.amountUsd + pnl).toFixed(2)} to your balance (${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)})`,
      });
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to close position.');
    } finally {
      setClosingPositionId(null);
    }
  };

  // Chart rendering math
  const chartWidth = 720;
  const chartHeight = 300;
  const chartPadding = { top: 20, right: 65, bottom: 25, left: 10 };

  const minPrice = useMemo(() => {
    if (!candles.length) return currentPrice * 0.98;
    return Math.min(...candles.map(c => c.low)) * 0.999;
  }, [candles, currentPrice]);

  const maxPrice = useMemo(() => {
    if (!candles.length) return currentPrice * 1.02;
    return Math.max(...candles.map(c => c.high)) * 1.001;
  }, [candles, currentPrice]);

  const priceRange = maxPrice - minPrice || 1;
  const getY = (p) => chartHeight - chartPadding.bottom - ((p - minPrice) / priceRange) * (chartHeight - chartPadding.top - chartPadding.bottom);
  const candleSlotWidth = (chartWidth - chartPadding.left - chartPadding.right) / Math.max(candles.length, 1);
  const candleBodyWidth = Math.max(2, candleSlotWidth * 0.65);

  // Area path
  const areaPoints = useMemo(() => {
    if (!candles.length) return '';
    return candles.map((c, i) => {
      const x = chartPadding.left + i * candleSlotWidth + candleSlotWidth / 2;
      const y = getY(c.close);
      return `${x},${y}`;
    }).join(' ');
  }, [candles, candleSlotWidth, minPrice, maxPrice]);

  const areaClosedPath = useMemo(() => {
    if (!areaPoints || !candles.length) return '';
    const firstX = chartPadding.left + candleSlotWidth / 2;
    const lastX = chartPadding.left + (candles.length - 1) * candleSlotWidth + candleSlotWidth / 2;
    const bottomY = chartHeight - chartPadding.bottom;
    return `M ${firstX},${bottomY} L ${areaPoints.split(' ')[0]} ${areaPoints.split(' ').map(p => `L ${p}`).join(' ')} L ${lastX},${bottomY} Z`;
  }, [areaPoints, candles, candleSlotWidth]);

  // Open positions from user state
  const openPositions = user?.openPositions || [];

  return (
    <AppLayout title="Save & Invest — Live Trading">
      <div className="max-w-[1480px] mx-auto px-3 sm:px-6 py-4 space-y-4">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>{toastMessage.text}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white font-bold ml-4">✕</button>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-rose-500/15 border border-rose-500/40 text-rose-400 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDepositOpen(true)} className="px-2.5 py-1 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 rounded-lg underline">
                Deposit Now
              </button>
              <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white font-bold ml-2">✕</button>
            </div>
          </div>
        )}

        {/* Top Market Instruments Ticker */}
        <div className="bg-[#0b1426] border border-cyan-500/15 rounded-2xl p-2.5 sm:p-3 overflow-x-auto shadow-sm">
          <div className="flex items-center gap-2 min-w-max">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE FEED
            </div>
            {MARKETS.map(market => {
              const info = marketPrices[market.symbol] || {};
              const isSelected = selectedMarket.symbol === market.symbol;
              const isUp = (info.change24h || 0) >= 0;
              return (
                <button
                  key={market.symbol}
                  onClick={() => setSelectedMarket(market)}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-left transition-all text-xs font-medium ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400/50 text-white shadow-sm'
                      : 'bg-[#0f1d33]/80 hover:bg-[#142644] border border-white/5 text-slate-300'
                  }`}
                >
                  <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-bold text-[11px] text-cyan-300">
                    {market.icon}
                  </span>
                  <div>
                    <div className="font-semibold">{market.symbol}</div>
                    <div className="text-[11px] text-slate-400">
                      ${(info.price || market.basePrice).toLocaleString(undefined, { minimumFractionDigits: market.decimals, maximumFractionDigits: market.decimals })}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                    {isUp ? '+' : ''}{info.change24h || '0.00'}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Portfolio Overview Cards — Persisted in MongoDB */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#0b1426] border border-white/10 rounded-2xl p-3.5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none"></div>
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              <span>USD Cash Balance</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">
              ${balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Ready to trade</span>
              <button onClick={() => setDepositOpen(true)} className="text-cyan-400 hover:text-cyan-300 font-semibold underline">
                + Deposit
              </button>
            </div>
          </div>

          <div className="bg-[#0b1426] border border-white/10 rounded-2xl p-3.5 relative overflow-hidden group">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              <span>BTC Holding</span>
              <span className="text-amber-400 font-bold">₿</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">
              {btcHolding.toFixed(6)} <span className="text-xs text-amber-400 font-semibold">BTC</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              ≈ ${(btcHolding * btcPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </div>
          </div>

          <div className="bg-[#0b1426] border border-white/10 rounded-2xl p-3.5 relative overflow-hidden group">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              <span>USDT Reserves</span>
              <span className="text-emerald-400 font-bold">₮</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">
              {usdtHolding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-emerald-400 font-semibold">USDT</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Stablecoin Asset Pool
            </div>
          </div>

          <div className="bg-[#0b1426] border border-white/10 rounded-2xl p-3.5 relative overflow-hidden group">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              <span>Total Portfolio Value</span>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">LIVE</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">
              ${totalPortfolioEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <span>▲ Live Real-time Equity</span>
            </div>
          </div>
        </div>

        {/* Main Trading Area Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Chart & Terminal Center Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Chart Container */}
            <div className="bg-[#0b1426] border border-white/10 rounded-2xl p-4 shadow-sm">
              
              {/* Chart Top Header & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                    {selectedMarket.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">{selectedMarket.symbol}</h2>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-300 font-medium uppercase">
                        {selectedMarket.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{selectedMarket.name}</div>
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <div className="text-lg font-bold text-white">
                      ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals, maximumFractionDigits: selectedMarket.decimals })}
                    </div>
                    <div className={`text-xs font-semibold ${currentStats.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {currentStats.change24h >= 0 ? '+' : ''}{currentStats.change24h}% (24h)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Timeframe Toggles */}
                  <div className="flex items-center bg-[#070d18] p-1 rounded-xl border border-white/5 text-xs">
                    {TIMEFRAMES.map(tf => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                          timeframe === tf ? 'bg-cyan-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>

                  {/* Chart Style Toggle */}
                  <div className="flex items-center bg-[#070d18] p-1 rounded-xl border border-white/5 text-xs">
                    <button
                      onClick={() => setChartType('candles')}
                      className={`px-2.5 py-1 rounded-lg font-medium ${chartType === 'candles' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Candlestick Chart"
                    >
                      📊 Candles
                    </button>
                    <button
                      onClick={() => setChartType('area')}
                      className={`px-2.5 py-1 rounded-lg font-medium ${chartType === 'area' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Area Chart"
                    >
                      📈 Area
                    </button>
                  </div>
                </div>
              </div>

              {/* 24h Stats Bar */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 py-2 text-[11px] text-slate-400 border-b border-white/5">
                <div>
                  <span className="text-slate-500 block">24h High</span>
                  <span className="text-slate-200 font-semibold">${currentStats.high24h.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">24h Low</span>
                  <span className="text-slate-200 font-semibold">${currentStats.low24h.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">24h Volume</span>
                  <span className="text-slate-200 font-semibold">${currentStats.volume24h.toLocaleString()}</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-slate-500 block">Spread</span>
                  <span className="text-emerald-400 font-semibold">0.01% (Zero Fee)</span>
                </div>
              </div>

              {/* SVG Interactive Chart Canvas */}
              <div className="relative w-full h-[280px] sm:h-[340px] pt-3 select-none">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="60%" stopColor="#0891b2" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines and Price labels */}
                  {[0.15, 0.38, 0.62, 0.85].map((pct, idx) => {
                    const price = minPrice + (maxPrice - minPrice) * (1 - pct);
                    const y = getY(price);
                    return (
                      <g key={idx}>
                        <line
                          x1={chartPadding.left}
                          y1={y}
                          x2={chartWidth - chartPadding.right}
                          y2={y}
                          stroke="#ffffff"
                          strokeOpacity="0.06"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={chartWidth - chartPadding.right + 6}
                          y={y + 3}
                          fill="#94a3b8"
                          fontSize="9.5"
                          fontFamily="monospace"
                        >
                          ${price.toFixed(selectedMarket.decimals)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area view mode */}
                  {chartType === 'area' && (
                    <>
                      <path d={areaClosedPath} fill="url(#chartAreaGrad)" />
                      <polyline
                        points={areaPoints}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}

                  {/* Candlestick view mode */}
                  {chartType === 'candles' && (
                    candles.map((candle, idx) => {
                      const isBullish = candle.close >= candle.open;
                      const xCenter = chartPadding.left + idx * candleSlotWidth + candleSlotWidth / 2;
                      const wickYTop = getY(candle.high);
                      const wickYBottom = getY(candle.low);
                      const bodyYTop = getY(Math.max(candle.open, candle.close));
                      const bodyYBottom = getY(Math.min(candle.open, candle.close));
                      const bodyHeight = Math.max(2, bodyYBottom - bodyYTop);

                      const color = isBullish ? '#10b981' : '#f43f5e';

                      return (
                        <g key={idx} className="transition-all">
                          {/* Wick */}
                          <line
                            x1={xCenter}
                            y1={wickYTop}
                            x2={xCenter}
                            y2={wickYBottom}
                            stroke={color}
                            strokeWidth="1.2"
                          />
                          {/* Candle Body */}
                          <rect
                            x={xCenter - candleBodyWidth / 2}
                            y={bodyYTop}
                            width={candleBodyWidth}
                            height={bodyHeight}
                            fill={color}
                            rx="1"
                          />
                        </g>
                      );
                    })
                  )}

                  {/* Current Price Ticker Dashed Line */}
                  {(() => {
                    const currentY = getY(currentPrice);
                    return (
                      <g>
                        <line
                          x1={chartPadding.left}
                          y1={currentY}
                          x2={chartWidth - chartPadding.right}
                          y2={currentY}
                          stroke="#06b6d4"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                        />
                        <rect
                          x={chartWidth - chartPadding.right + 2}
                          y={currentY - 9}
                          width="58"
                          height="18"
                          fill="#0891b2"
                          rx="3"
                        />
                        <text
                          x={chartWidth - chartPadding.right + 6}
                          y={currentY + 3.5}
                          fill="#ffffff"
                          fontSize="9.5"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          ${currentPrice.toFixed(selectedMarket.decimals)}
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Bottom Tabs: Open Positions & Order History */}
            <div className="bg-[#0b1426] border border-white/10 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('positions')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      activeTab === 'positions'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Open Positions ({openPositions.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      activeTab === 'history'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Recent Market Trades
                  </button>
                </div>
                <div className="text-[11px] text-slate-400">
                  Auto-synced with MongoDB
                </div>
              </div>

              {/* Tab 1: Open Positions */}
              {activeTab === 'positions' && (
                <div className="mt-3 overflow-x-auto">
                  {openPositions.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <div className="text-3xl mb-2">📊</div>
                      <p className="font-semibold text-slate-300">No active positions open.</p>
                      <p className="text-slate-500 mt-1">Select an instrument above and execute a Long or Short trade to begin investing.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead>
                        <tr className="text-slate-500 border-b border-white/5 font-semibold">
                          <th className="pb-2">Pair</th>
                          <th className="pb-2">Side</th>
                          <th className="pb-2">Leverage</th>
                          <th className="pb-2">Margin</th>
                          <th className="pb-2">Entry Price</th>
                          <th className="pb-2">Mark Price</th>
                          <th className="pb-2">Unrealized PnL</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {openPositions.map(pos => {
                          const livePrice = marketPrices[pos.symbol]?.price || pos.entryPrice;
                          const isLong = pos.side === 'buy' || pos.side === 'long';
                          const priceDelta = livePrice - pos.entryPrice;
                          const rawPnl = (priceDelta / pos.entryPrice) * pos.amountUsd * (pos.leverage || 1);
                          const pnl = isLong ? rawPnl : -rawPnl;
                          const pnlPct = (pnl / pos.amountUsd) * 100;
                          const isProfit = pnl >= 0;

                          return (
                            <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 font-bold text-white flex items-center gap-1.5">
                                <span>{pos.symbol}</span>
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  isLong ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                }`}>
                                  {isLong ? 'Long' : 'Short'}
                                </span>
                              </td>
                              <td className="py-3 font-semibold text-slate-300">{pos.leverage || 1}x</td>
                              <td className="py-3 font-mono">${Number(pos.amountUsd).toFixed(2)}</td>
                              <td className="py-3 font-mono">${Number(pos.entryPrice).toFixed(2)}</td>
                              <td className="py-3 font-mono text-cyan-300">${livePrice.toFixed(2)}</td>
                              <td className="py-3 font-mono font-bold">
                                <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                                  {isProfit ? '+' : ''}${pnl.toFixed(2)} ({isProfit ? '+' : ''}{pnlPct.toFixed(2)}%)
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleClosePosition(pos)}
                                  disabled={closingPositionId === pos.id}
                                  className="px-3 py-1 bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 rounded-lg text-xs font-semibold transition-all border border-white/5"
                                >
                                  {closingPositionId === pos.id ? 'Closing...' : 'Close Position'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab 2: Recent Market Trades Feed */}
              {activeTab === 'history' && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead>
                      <tr className="text-slate-500 border-b border-white/5 font-semibold">
                        <th className="pb-2">Time</th>
                        <th className="pb-2">Side</th>
                        <th className="pb-2">Price</th>
                        <th className="pb-2 text-right">Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {recentTrades.map(t => (
                        <tr key={t.id} className="hover:bg-white/[0.02]">
                          <td className="py-2 text-slate-400">{t.time}</td>
                          <td className="py-2">
                            <span className={`font-bold ${t.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {t.side.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2 text-white">${t.price.toFixed(selectedMarket.decimals)}</td>
                          <td className="py-2 text-right text-slate-300">{t.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Order Execution Terminal (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Order Placement Box */}
            <div className="bg-[#0b1426] border border-white/10 rounded-2xl p-4 shadow-sm space-y-4">
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Trade Terminal
                </span>
                {/* Trade Mode Selector */}
                <div className="flex items-center bg-[#070d18] p-0.5 rounded-lg border border-white/5 text-[11px]">
                  <button
                    onClick={() => setTradeMode('position')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      tradeMode === 'position' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Margin (CFD)
                  </button>
                  <button
                    onClick={() => setTradeMode('spot')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      tradeMode === 'spot' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Spot Asset
                  </button>
                </div>
              </div>

              {/* Buy / Sell Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#070d18] rounded-xl border border-white/5">
                <button
                  onClick={() => setOrderSide('buy')}
                  className={`py-2 rounded-lg font-bold text-xs transition-all ${
                    orderSide === 'buy'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Buy / Long
                </button>
                <button
                  onClick={() => setOrderSide('sell')}
                  className={`py-2 rounded-lg font-bold text-xs transition-all ${
                    orderSide === 'sell'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sell / Short
                </button>
              </div>

              {/* Order Type: Market vs Limit */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Order Type</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOrderType('market')}
                    className={`font-semibold ${orderType === 'market' ? 'text-cyan-400 underline' : 'hover:text-white'}`}
                  >
                    Market Price
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => setOrderType('limit')}
                    className={`font-semibold ${orderType === 'limit' ? 'text-cyan-400 underline' : 'hover:text-white'}`}
                  >
                    Limit Order
                  </button>
                </div>
              </div>

              {/* Limit Price Input if selected */}
              {orderType === 'limit' && (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Limit Price (USD)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      className="w-full bg-[#070d18] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500">USD</span>
                  </div>
                </div>
              )}

              {/* Leverage Selector (when in Margin mode) */}
              {tradeMode === 'position' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Leverage Multiplier</span>
                    <span className="text-cyan-400 font-bold">{leverage}x</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {LEVERAGE_OPTIONS.map(lev => (
                      <button
                        key={lev}
                        onClick={() => setLeverage(lev)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          leverage === lev
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lev}x
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Investment Amount (USD)</span>
                  <span>Avail: <strong className="text-white">${balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-semibold">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={orderAmountUsd}
                    onChange={(e) => setOrderAmountUsd(e.target.value)}
                    className="w-full bg-[#070d18] border border-white/10 rounded-xl pl-7 pr-12 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-cyan-400"
                    placeholder="100.00"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">USD</span>
                </div>

                {/* Quick % Pills */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[25, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleQuickPercent(pct)}
                      className="py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Breakdown Summary */}
              <div className="bg-[#070d18] rounded-xl p-3 space-y-1.5 text-[11px] text-slate-400 border border-white/5 font-mono">
                <div className="flex justify-between">
                  <span>Asset Size</span>
                  <span className="text-white font-semibold">
                    {orderUnits.toFixed(4)} {selectedMarket.symbol.split('/')[0]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Position Value</span>
                  <span className="text-white font-semibold">
                    ${(parsedAmountUsd * (tradeMode === 'position' ? leverage : 1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trading Fee</span>
                  <span className="text-emerald-400 font-semibold">0.00% (No commission)</span>
                </div>
                {tradeMode === 'position' && (
                  <div className="flex justify-between border-t border-white/5 pt-1">
                    <span>Est. Liquidation</span>
                    <span className="text-amber-400 font-semibold">
                      ${(currentPrice * (orderSide === 'buy' ? (1 - 0.85 / leverage) : (1 + 0.85 / leverage))).toFixed(selectedMarket.decimals)}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Execution Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || parsedAmountUsd <= 0}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                  orderSide === 'buy'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20 active:scale-[0.99]'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20 active:scale-[0.99]'
                } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <span>Executing Trade...</span>
                ) : (
                  <span>
                    {orderSide === 'buy' ? 'Buy / Open Long' : 'Sell / Open Short'} {selectedMarket.symbol}
                  </span>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-500 leading-tight">
                Funds are immediately verified & deducted from your live MongoDB account balance.
              </p>
            </div>

            {/* Live Order Book Preview Widget */}
            <div className="bg-[#0b1426] border border-white/10 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white pb-1 border-b border-white/5">
                <span>Live Order Book</span>
                <span className="text-[10px] text-slate-400 font-normal">Real-time Depth</span>
              </div>

              {/* Asks (Sell orders - red) */}
              <div className="space-y-1 font-mono text-[11px]">
                {[3, 2, 1].map(i => {
                  const askPrice = currentPrice + (i * currentPrice * 0.0004);
                  const amount = (Math.random() * 1.5 + 0.2).toFixed(3);
                  return (
                    <div key={i} className="flex justify-between items-center relative py-0.5">
                      <div className="absolute right-0 top-0 bottom-0 bg-rose-500/10 rounded" style={{ width: `${i * 28}%` }}></div>
                      <span className="text-rose-400 relative z-10">${askPrice.toFixed(selectedMarket.decimals)}</span>
                      <span className="text-slate-400 relative z-10">{amount}</span>
                    </div>
                  );
                })}
              </div>

              {/* Mid Spread Indicator */}
              <div className="py-1 px-2 my-1 bg-[#070d18] rounded-lg text-center font-mono text-xs font-bold text-cyan-300 border border-white/5 flex items-center justify-between">
                <span>Spread: 0.01</span>
                <span>${currentPrice.toFixed(selectedMarket.decimals)}</span>
              </div>

              {/* Bids (Buy orders - green) */}
              <div className="space-y-1 font-mono text-[11px]">
                {[1, 2, 3].map(i => {
                  const bidPrice = currentPrice - (i * currentPrice * 0.0004);
                  const amount = (Math.random() * 1.8 + 0.3).toFixed(3);
                  return (
                    <div key={i} className="flex justify-between items-center relative py-0.5">
                      <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 rounded" style={{ width: `${(4 - i) * 26}%` }}></div>
                      <span className="text-emerald-400 relative z-10">${bidPrice.toFixed(selectedMarket.decimals)}</span>
                      <span className="text-slate-400 relative z-10">{amount}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Deposit Modal Shortcut */}
      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        user={user}
      />
    </AppLayout>
  );
}


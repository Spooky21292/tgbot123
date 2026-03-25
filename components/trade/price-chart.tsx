"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { getCurrencySymbol, type MarketCandle, type MarketQuote } from '@/lib/market-data';

type ChartRange = '1D' | '1W' | '1M';

type RangeConfig = {
  interval: '1min' | '1h' | '1day';
  points: number;
};

const rangeConfig: Record<ChartRange, RangeConfig> = {
  '1D': { interval: '1min', points: 240 },
  '1W': { interval: '1h', points: 7 * 24 },
  '1M': { interval: '1day', points: 30 }
};

function formatPrice(value: number, precision: number) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function syncLastCandleWithQuote(candles: MarketCandle[], quote: MarketQuote | null) {
  if (!candles.length || !quote) return candles;
  const next = [...candles];
  const last = next[next.length - 1];
  next[next.length - 1] = {
    ...last,
    close: quote.price,
    high: Math.max(last.high, quote.price),
    low: Math.min(last.low, quote.price)
  };
  return next;
}

export function PriceChart({
  symbol,
  candles: initialCandles,
  initialQuote,
  className
}: {
  symbol: string;
  candles: MarketCandle[];
  initialQuote: MarketQuote;
  className?: string;
}) {
  const [range, setRange] = useState<ChartRange>('1M');
  const [candles, setCandles] = useState(initialCandles);
  const [monthlyCandles, setMonthlyCandles] = useState(initialCandles);
  const [quote, setQuote] = useState(initialQuote);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setCandles(initialCandles);
    setMonthlyCandles(initialCandles);
  }, [initialCandles]);

  useEffect(() => {
    setQuote(initialQuote);
  }, [initialQuote]);


  const refreshCandles = useCallback(async () => {
    try {
      const config = rangeConfig[range];
      setStatus((current) => (current === 'idle' ? 'loading' : current));
      const [candlesResponse, quoteResponse] = await Promise.all([
        fetch(`/api/trade/market/candles?symbol=${encodeURIComponent(symbol)}&interval=${config.interval}&points=${config.points}`, { cache: 'no-store' }),
        fetch(`/api/trade/market/quote?symbol=${encodeURIComponent(symbol)}`, { cache: 'no-store' })
      ]);

      const candlesPayload = await candlesResponse.json().catch(() => null);
      const quotePayload = await quoteResponse.json().catch(() => null);

      if (!candlesResponse.ok || !Array.isArray(candlesPayload?.data)) {
        throw new Error('CANDLES_REQUEST_FAILED');
      }

      const nextQuote = quoteResponse.ok && quotePayload?.data ? quotePayload.data as MarketQuote : null;
      if (nextQuote) setQuote(nextQuote);
      const syncedCandles = syncLastCandleWithQuote(candlesPayload.data, nextQuote ?? quote);
      setCandles(syncedCandles);
      if (range === '1M') setMonthlyCandles(syncedCandles);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }, [quote, range, symbol]);

  useEffect(() => {
    setZoomLevel(1);
  }, [range]);

  useEffect(() => {
    void refreshCandles();

    const intervalId = window.setInterval(() => {
      void refreshCandles();
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [refreshCandles]);

  const visibleCandles = useMemo(() => {
    const basePoints = rangeConfig[range].points;
    const count = clamp(Math.round(basePoints / zoomLevel), 20, candles.length || 20);
    return candles.slice(-count);
  }, [candles, range, zoomLevel]);

  if (!visibleCandles.length) {
    return <div className={cn('flex h-72 items-center justify-center rounded-2xl border border-border/80 bg-card text-sm text-muted-foreground', className)}>История цен временно недоступна.</div>;
  }

  const width = 920;
  const height = 360;
  const paddingTop = 18;
  const paddingBottom = 36;
  const paddingX = 56;
  const precision = 2;
  const currencySymbol = getCurrencySymbol(symbol);
  const highs = visibleCandles.map((item: any) => item.high);
  const lows = visibleCandles.map((item: any) => item.low);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const rangeValue = Math.max(max - min, 1 / 10 ** precision);
  const plotHeight = height - paddingTop - paddingBottom;
  const plotWidth = width - paddingX * 2;
  const candleSlot = plotWidth / visibleCandles.length;
  const candleWidth = Math.max(Math.min(candleSlot * 0.58, 18), 4);
  const latest = quote ?? { price: visibleCandles[visibleCandles.length - 1].close, change: 0, changePercent: 0 };
  const monthStart = monthlyCandles[0]?.open ?? monthlyCandles[0]?.close ?? latest.price;
  const lastDelta = latest.price - monthStart;
  const lastDeltaPercent = monthStart ? (lastDelta / monthStart) * 100 : 0;

  const yForPrice = (price: number) => paddingTop + ((max - price) / rangeValue) * plotHeight;

  const gridLines = Array.from({ length: 5 }, (_, index) => {
    const price = max - (index / 4) * rangeValue;
    const y = yForPrice(price);
    return { price, y };
  });

  return (
    <div className={cn('rounded-2xl border border-border/80 bg-card p-4 sm:p-5', className)}>
      <div className="flex flex-col gap-4 border-b border-border/70 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">График цены</p>
          <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="text-3xl font-semibold tracking-tight text-foreground">{formatPrice(latest.price, precision)} {currencySymbol}</p>
            <p className={cn('text-sm font-medium', lastDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
              {lastDelta >= 0 ? '+' : '-'}{formatPrice(Math.abs(lastDelta), precision)} {currencySymbol} ({lastDeltaPercent >= 0 ? '+' : ''}{lastDeltaPercent.toFixed(2)}%) за месяц
            </p>
          </div>
          {status === 'error' ? <p className="mt-1 text-xs text-muted-foreground">Данные графика временно недоступны</p> : null}
        </div>

        <div className="flex flex-col gap-2 self-start">
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 p-1">
            {(['1D', '1W', '1M'] as ChartRange[]).map((item: any) => (
              <button
                key={item}
                type="button"
                onClick={() => setRange(item)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  range === item ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 p-1">
            <button type="button" onClick={() => setZoomLevel((value) => clamp(value / 1.5, 1, 8))} className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground">−</button>
            <span className="px-2 text-xs text-muted-foreground">Zoom ×{zoomLevel.toFixed(1)}</span>
            <button type="button" onClick={() => setZoomLevel((value) => clamp(value * 1.5, 1, 8))} className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground">+</button>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[360px] min-w-[760px] w-full">
          {gridLines.map((line: any) => (
            <g key={line.y}>
              <line x1={paddingX} y1={line.y} x2={width - paddingX} y2={line.y} stroke="#334155" strokeOpacity="0.35" strokeDasharray="4 6" />
              <text x={width - paddingX + 8} y={line.y + 4} fontSize="12" fill="#94a3b8">{formatPrice(line.price, precision)}</text>
            </g>
          ))}

          {visibleCandles.map((candle: any, index: any) => {
            const centerX = paddingX + candleSlot * index + candleSlot / 2;
            const openY = yForPrice(candle.open);
            const closeY = yForPrice(candle.close);
            const highY = yForPrice(candle.high);
            const lowY = yForPrice(candle.low);
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 2);
            const bullish = candle.close >= candle.open;
            const color = bullish ? '#22c55e' : '#ef4444';

            return (
              <g key={`${candle.time}-${index}`}>
                <line x1={centerX} y1={highY} x2={centerX} y2={lowY} stroke={color} strokeWidth="2" strokeLinecap="round" />
                <rect x={centerX - candleWidth / 2} y={bodyTop} width={candleWidth} height={bodyHeight} rx="2" fill={color} fillOpacity={bullish ? '0.92' : '0.88'} />
              </g>
            );
          })}

          {visibleCandles.map((candle: any, index: any) => {
            const centerX = paddingX + candleSlot * index + candleSlot / 2;
            const label = range === '1D'
              ? new Date(candle.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
              : new Date(candle.time).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
            const showLabel = index === 0 || index === visibleCandles.length - 1 || index === Math.floor(visibleCandles.length / 2);
            if (!showLabel) return null;

            return <text key={`label-${candle.time}`} x={centerX} y={height - 10} textAnchor="middle" fontSize="12" fill="#94a3b8">{label}</text>;
          })}
        </svg>
      </div>
    </div>
  );
}

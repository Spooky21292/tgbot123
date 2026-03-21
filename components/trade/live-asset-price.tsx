"use client";

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getCurrencySymbol, type MarketQuote } from '@/lib/market-data';

type Props = {
  symbol: string;
  initialQuote: MarketQuote;
};

function formatPrice(symbol: string, price: number) {
  const precision = 2;
  return `${price.toFixed(precision)} ${getCurrencySymbol(symbol)}`;
}

export function LiveAssetPrice({ symbol, initialQuote }: Props) {
  const [quote, setQuote] = useState(initialQuote);
  const [status, setStatus] = useState<'idle' | 'error'>('idle');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setQuote(initialQuote);
  }, [initialQuote]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refreshQuote = useCallback(async () => {
    try {
      const response = await fetch(`/api/trade/market/quote?symbol=${encodeURIComponent(symbol)}`, {
        cache: 'no-store'
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.data) {
        throw new Error('QUOTE_REQUEST_FAILED');
      }
      setQuote(payload.data);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }, [symbol]);

  useEffect(() => {
    void refreshQuote();

    const intervalId = window.setInterval(() => {
      void refreshQuote();
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [refreshQuote]);

  return (
    <div className="rounded-2xl border border-border/80 bg-card px-5 py-4">
      <p className="text-sm text-muted-foreground">Текущая цена</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{formatPrice(symbol, quote.price)}</p>
      <p className={cn('mt-1 text-sm', quote.changePercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
        {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}% за сессию
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {status === 'error'
          ? 'Автообновление временно недоступно'
          : mounted ? `Автообновление каждые 60 секунд • ${new Date(quote.asOf).toLocaleTimeString('ru-RU')}` : 'Автообновление каждые 60 секунд'}
      </p>
    </div>
  );
}

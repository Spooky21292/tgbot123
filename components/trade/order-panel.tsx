"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getCurrencySymbol } from '@/lib/market-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function OrderPanel({ symbol, price, availableBalance, ownedQuantity }: { symbol: string; price: number; availableBalance: number; ownedQuantity: number }) {
  const [livePrice, setLivePrice] = useState(price);
  const currencySymbol = getCurrencySymbol(symbol);
  const router = useRouter();
  const [quantity, setQuantity] = useState('1');
  const [pending, startTransition] = useTransition();
  const numericQuantity = Number(quantity || 0);
  const estimatedTotal = useMemo(() => Number.isFinite(numericQuantity) ? numericQuantity * livePrice : 0, [numericQuantity, livePrice]);

  useEffect(() => {
    setLivePrice(price);
  }, [price]);

  const refreshPrice = useCallback(async () => {
    try {
      const response = await fetch(`/api/trade/market/quote?symbol=${encodeURIComponent(symbol)}`, { cache: 'no-store' });
      const data = await response.json().catch(() => null);
      if (response.ok && typeof data?.data?.price === 'number') {
        setLivePrice(data.data.price);
      }
    } catch {
      // keep latest visible price
    }
  }, [symbol]);

  useEffect(() => {
    void refreshPrice();

    const intervalId = window.setInterval(() => {
      void refreshPrice();
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [refreshPrice]);

  const submit = (side: 'BUY' | 'SELL') => {
    startTransition(async () => {
      const response = await fetch('/api/trade/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, side, quantity: numericQuantity })
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(typeof data?.error === 'string' ? data.error : 'Не удалось выполнить демо-сделку');
        return;
      }
      toast.success(side === 'BUY' ? 'Покупка выполнена на демо-счёте' : 'Продажа выполнена на демо-счёте');
      router.refresh();
    });
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6">
      <p className="text-sm font-medium text-foreground">Демо-ордер</p>
      <p className="mt-1 text-sm text-muted-foreground">Без реальных денег, без вывода средств и без брокерского исполнения.</p>

      <div className="mt-5 space-y-4">
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Текущая цена</span>
            <span className="font-medium text-foreground">{livePrice.toFixed(2)} {currencySymbol}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Доступный баланс</span>
            <span className="font-medium text-foreground">{availableBalance.toFixed(2)} {currencySymbol}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Ваш объём</span>
            <span className="font-medium text-foreground">{ownedQuantity.toFixed(4)}</span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Количество</label>
          <Input type="number" min="0" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          <p className="mt-2 text-sm text-muted-foreground">Оценка сделки: {estimatedTotal.toFixed(2)} {currencySymbol}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button className="h-14 w-full text-base" disabled={pending} onClick={() => submit('BUY')}>Купить демо</Button>
          <Button className="h-14 w-full text-base" variant="secondary" disabled={pending} onClick={() => submit('SELL')}>Продать демо</Button>
        </div>
      </div>
    </div>
  );
}

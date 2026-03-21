"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function ResetDemoAccountButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      onClick={() => {
        if (!window.confirm('Сбросить демо-счёт? Баланс вернётся к стартовому, позиции и история сделок будут очищены.')) return;
        startTransition(async () => {
          const response = await fetch('/api/trade/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ confirm: true })
          });
          const data = await response.json().catch(() => null);
          if (!response.ok) {
            toast.error(typeof data?.error === 'string' ? data.error : 'Не удалось сбросить демо-счёт');
            return;
          }
          toast.success('Демо-счёт сброшен');
          router.refresh();
        });
      }}
      disabled={pending}
    >
      Сбросить счёт
    </Button>
  );
}

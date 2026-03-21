"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ActivatePlanForm({ planId }: { planId: string }) {
  const [promoCode, setPromoCode] = useState('TESTPROMO');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const activate = () => startTransition(async () => {
    const response = await fetch('/api/pricing/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, promoCode })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return toast.error(data?.error || 'Не удалось активировать тариф');
    toast.success('Тариф активирован на 31 день');
    router.push('/dashboard');
    router.refresh();
  });

  return (
    <div className="mt-4 space-y-3">
      <Input value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder="Промокод" />
      <Button className="w-full rounded-full" disabled={pending} onClick={activate}>
        {pending ? 'Активация...' : 'Перейти к оплате'}
      </Button>
    </div>
  );
}

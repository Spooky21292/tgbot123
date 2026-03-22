"use client";

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function LeaveFamilyButton() {
  const [pending, startTransition] = useTransition();

  const leaveFamily = () => startTransition(async () => {
    const response = await fetch('/api/family/leave', { method: 'POST' });
    const data = await response.json().catch(() => null);
    if (!response.ok) return toast.error(data?.error || 'Не удалось выйти из семейного доступа');
    toast.success('Вы вышли из семейного доступа');
    window.location.reload();
  });

  return (
    <Button type="button" variant="outline" disabled={pending} onClick={leaveFamily}>
      {pending ? 'Выходим...' : 'Выйти из семейного доступа'}
    </Button>
  );
}

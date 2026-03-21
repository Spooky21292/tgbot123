"use client";

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function FamilyMembersManager({ members }: { members: { id: string; email: string; name: string }[] }) {
  const [email, setEmail] = useState('');
  const [pending, startTransition] = useTransition();

  const submit = () => startTransition(async () => {
    const response = await fetch('/api/family/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return toast.error(data?.error || 'Не удалось добавить участника');
    toast.success('Участник добавлен в семейный доступ');
    window.location.reload();
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {members.length ? members.map((member) => (
          <div key={member.id} className="rounded-xl border border-border/80 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">{member.name}</p>
            <p className="text-muted-foreground">{member.email}</p>
          </div>
        )) : <p className="text-sm text-muted-foreground">Пока никого не добавили.</p>}
      </div>
      <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email участника" />
      <Button disabled={pending || members.length >= 3} onClick={submit}>{pending ? 'Добавление...' : 'Добавить по email'}</Button>
    </div>
  );
}

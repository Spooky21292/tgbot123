"use client";

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { contactSchema } from '@/lib/validations';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const { register, reset, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(contactSchema) });
  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch('/api/contact', { method: 'POST', body: JSON.stringify(values) });
      const data = await response.json();
      if (!response.ok) return toast.error(data.error || 'Не удалось отправить сообщение');
      toast.success('Заявка отправлена');
      reset();
    });
  });
  return <form className="space-y-4" onSubmit={onSubmit}><div><Input placeholder="Имя" {...register('name')} /><p className="text-xs text-red-500">{errors.name?.message as string}</p></div><div><Input placeholder="Email" {...register('email')} /><p className="text-xs text-red-500">{errors.email?.message as string}</p></div><div><Textarea placeholder="Сообщение" {...register('message')} /><p className="text-xs text-red-500">{errors.message?.message as string}</p></div><Button type="submit" disabled={pending}>{pending ? 'Отправка...' : 'Отправить'}</Button></form>;
}

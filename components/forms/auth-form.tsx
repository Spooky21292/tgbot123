"use client";

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { registerSchema, loginSchema } from '@/lib/validations';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Mode = 'login' | 'register';

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const schema = mode === 'login' ? loginSchema : registerSchema;
  const { register, handleSubmit, formState: { errors } } = useForm<any>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      if (mode === 'register') {
        const response = await fetch('/api/register', { method: 'POST', body: JSON.stringify(values) });
        const data = await response.json();
        if (!response.ok) return toast.error(data.error || 'Ошибка регистрации');
        toast.success('Аккаунт создан');
      }
      const result = await signIn('credentials', { email: values.email, password: values.password, redirect: false });
      if (result?.error) return toast.error('Неверный email или пароль');
      toast.success('Добро пожаловать!');
      router.push('/dashboard');
      router.refresh();
    });
  });

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader><CardTitle>{mode === 'login' ? 'Вход' : 'Регистрация'}</CardTitle></CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === 'register' && <div><Input placeholder="Имя" {...register('name')} /><p className="mt-1 text-xs text-red-500">{errors.name?.message as string}</p></div>}
          <div><Input placeholder="Email" {...register('email')} /><p className="mt-1 text-xs text-red-500">{errors.email?.message as string}</p></div>
          <div><Input type="password" placeholder="Пароль" {...register('password')} /><p className="mt-1 text-xs text-red-500">{errors.password?.message as string}</p></div>
          {mode === 'register' && <div><Select {...register('ageGroup')} defaultValue="young"><option value="teen">Подросток</option><option value="young">18–30 лет</option><option value="adult">30–45 лет</option></Select><p className="mt-1 text-xs text-red-500">{errors.ageGroup?.message as string}</p></div>}
          <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

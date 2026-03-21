"use client";

import { useMemo, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  registerSchema,
  loginSchema,
  type LoginInput,
  type RegisterInput
} from '@/lib/validations';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Mode = 'login' | 'register';
type FormValues = LoginInput | RegisterInput;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const schema = useMemo(() => (mode === 'login' ? loginSchema : registerSchema), [mode]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues:
      mode === 'login'
        ? { email: '', password: '' }
        : { name: '', email: '', password: '', ageGroup: 'young' }
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      if (mode === 'register') {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        const data = await response.json();
        if (!response.ok) {
          return toast.error(typeof data.error === 'string' ? data.error : 'Ошибка регистрации');
        }
        toast.success('Аккаунт создан');
        reset({ email: values.email, password: values.password });
      }

      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false
      });

      if (result?.error) return toast.error('Неверный email или пароль');
      toast.success('Добро пожаловать!');
      router.push('/dashboard');
      router.refresh();
    });
  });

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === 'login' ? 'Вход' : 'Регистрация'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {mode === 'register' && (
            <div>
              <Input placeholder="Имя" autoComplete="name" {...register('name' as const)} />
              <p className="mt-1 text-xs text-red-500">{errors.name?.message as string}</p>
            </div>
          )}

          <div>
            <Input placeholder="Email" type="email" autoComplete="email" {...register('email')} />
            <p className="mt-1 text-xs text-red-500">{errors.email?.message as string}</p>
          </div>

          <div>
            <Input type="password" placeholder="Пароль" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} {...register('password')} />
            <p className="mt-1 text-xs text-red-500">{errors.password?.message as string}</p>
          </div>

          {mode === 'register' && (
            <div>
              <Select {...register('ageGroup' as const)}>
                <option value="teen">Подросток</option>
                <option value="young">18–30 лет</option>
                <option value="adult">30–45 лет</option>
              </Select>
              <p className="mt-1 text-xs text-red-500">{errors.ageGroup?.message as string}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

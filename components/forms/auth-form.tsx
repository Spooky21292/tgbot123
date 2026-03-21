"use client";

import { useMemo, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues:
      mode === 'login'
        ? { email: '', password: '' }
        : { name: '', email: '', password: '', ageGroup: 'age_18_25' }
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
        const registeredValues = values as RegisterInput;
        reset({
          name: '',
          email: registeredValues.email,
          password: registeredValues.password,
          ageGroup: registeredValues.ageGroup
        } as FormValues);
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
    <Card className="mx-auto w-full max-w-md rounded-[28px] border-slate-200/80 shadow-soft">
      <CardHeader>
        <CardTitle>{mode === 'login' ? 'Вход в FinSkills Pro' : 'Создать аккаунт'}</CardTitle>
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
            <Input
              type="password"
              placeholder="Пароль"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              {...register('password')}
            />
            <p className="mt-1 text-xs text-red-500">{errors.password?.message as string}</p>
          </div>

          {mode === 'register' && (
            <div>
              <Controller
                control={control}
                name={'ageGroup' as const}
                render={({ field }) => (
                  <Select value={field.value ?? 'age_18_25'} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref}>
                    <option value="age_12_17">12–17</option>
                    <option value="age_18_25">18–25</option>
                    <option value="age_26_plus">26+</option>
                  </Select>
                )}
              />
              <p className="mt-1 text-xs text-red-500">{errors.ageGroup?.message as string}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

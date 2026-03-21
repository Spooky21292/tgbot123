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
import { cn } from '@/lib/utils';

type Mode = 'login' | 'register';
type FormValues = LoginInput | RegisterInput;

async function parseJsonSafely(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function FloatingField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="auth-field">{children}<label className="auth-label">{label}</label></div>
      <p className="mt-1 text-xs text-red-300">{error}</p>
    </div>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const schema = useMemo(() => (mode === 'login' ? loginSchema : registerSchema), [mode]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues:
      mode === 'login'
        ? { email: '', password: '' }
        : { name: '', email: '', password: '', ageGroup: '18-25' }
  });

  const ageGroupValue = watch('ageGroup' as const);

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      if (mode === 'register') {
        const registerValues = values as RegisterInput;
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerValues)
        });
        const data = await parseJsonSafely(response);

        if (!response.ok) {
          return toast.error(typeof data?.error === 'string' ? data.error : 'Ошибка регистрации');
        }

        toast.success('Аккаунт создан');
        reset({
          name: '',
          email: registerValues.email,
          password: registerValues.password,
          ageGroup: registerValues.ageGroup
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
    <Card className="auth-shell mx-auto w-full max-w-md border-white/10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.45)]">
      <CardHeader>
        <p className="auth-note text-sm">{mode === 'login' ? 'Возвращение в кабинет' : 'Новый доступ к платформе'}</p>
        <CardTitle className="text-2xl text-white">{mode === 'login' ? 'Вход в FinSkills Pro' : 'Создать аккаунт'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {mode === 'register' && (
            <FloatingField label="Имя" error={errors.name?.message as string}>
              <Input placeholder=" " autoComplete="name" className="auth-input h-14 border-0 bg-transparent px-4 text-white" {...register('name' as const)} />
            </FloatingField>
          )}

          <FloatingField label="Email" error={errors.email?.message as string}>
            <Input placeholder=" " type="email" autoComplete="email" className="auth-input h-14 border-0 bg-transparent px-4 text-white" {...register('email')} />
          </FloatingField>

          <FloatingField label="Пароль" error={errors.password?.message as string}>
            <Input
              type="password"
              placeholder=" "
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="auth-input h-14 border-0 bg-transparent px-4 text-white"
              {...register('password')}
            />
          </FloatingField>

          {mode === 'register' && (
            <div>
              <div className="auth-field">
                <Controller
                  control={control}
                  name={'ageGroup' as const}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? '18-25'}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className={cn('auth-select h-14 border-0 bg-transparent px-4 text-white', (ageGroupValue ?? '18-25') && 'has-value')}
                    >
                      <option value="12-17">12–17</option>
                      <option value="18-25">18–25</option>
                      <option value="26+">26+</option>
                    </Select>
                  )}
                />
                <label className="auth-label">Возрастная группа</label>
              </div>
              <p className="mt-1 text-xs text-red-300">{errors.ageGroup?.message as string}</p>
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

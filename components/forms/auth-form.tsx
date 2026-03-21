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

async function parseJsonSafely(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

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
        : { name: '', email: '', password: '', ageGroup: '18-25' }
  });

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
                  <Select
                    value={field.value ?? '18-25'}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  >
                    <option value="12-17">12–17</option>
                    <option value="18-25">18–25</option>
                    <option value="26+">26+</option>
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

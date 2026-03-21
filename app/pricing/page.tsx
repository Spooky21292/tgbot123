import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivatePlanForm } from '@/components/pricing/activate-plan-form';

export const metadata: Metadata = { title: 'Тарифы', description: 'Тарифы FinSkills Pro' };

const plans = [
  { id: 'start', name: 'Starter', price: '0 ₽', period: '/мес', description: 'Подходит для спокойного знакомства с платформой.', features: ['Открытые статьи и вводные материалы', 'Знакомство с интерфейсом', 'Базовые сценарии Telegram-ассистента'] },
  { id: 'learning', name: 'Learning', price: '499 ₽', period: '/мес', description: 'Полный доступ к обучению и библиотеке записей.', features: ['Все курсы и уроки', 'Тесты, прогресс и рекомендации', 'Все вебинары и доступ к записям'] },
  { id: 'family', name: 'Family', price: '999 ₽', period: '/мес', description: 'Для семьи с единым доступом к материалам.', features: ['До 3 пользователей в семье', 'Семейные сценарии и рекомендации', 'Архив вебинаров и семейный доступ к записям'] }
];

export default async function PricingPage({ searchParams }: { searchParams?: { plan?: string } }) {
  const session = await getServerSession(authOptions);

  return (
    <Container className="py-10 sm:py-12">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Тарифы</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Выберите тариф и перейдите к оплате. После активации доступ появится в кабинете автоматически.
        </p>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} id={plan.id} className="flex flex-col rounded-[28px] bg-white/90 dark:bg-card">
            <CardHeader className="px-6 py-8 sm:p-10 sm:pb-6">
              <div className="grid w-full grid-cols-1 items-center justify-center text-left">
                <div>
                  <h2 className="text-lg font-medium tracking-tighter text-gray-600 dark:text-slate-300 lg:text-3xl">{plan.name}</h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">{plan.description}</p>
                </div>
                <div className="mt-6">
                  <p>
                    <span className="text-5xl font-light tracking-tight text-black dark:text-white">{plan.price}</span>
                    <span className="text-base font-medium text-gray-500 dark:text-slate-400"> {plan.period} </span>
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col px-6 pb-8 sm:px-8">
              <div className="mb-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                    <Check className="mt-1 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              {session?.user && searchParams?.plan === plan.id && plan.id !== 'start' ? (
                <ActivatePlanForm planId={plan.id} />
              ) : (
                <Button className="mt-auto w-full rounded-full" asChild>
                  <Link href={plan.id === 'start' ? '/courses' : `/pricing?plan=${plan.id}`}>
                    {plan.id === 'start' ? 'Открыть каталог' : 'Выбрать тариф'}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}

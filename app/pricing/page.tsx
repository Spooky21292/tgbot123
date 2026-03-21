import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Тарифы', description: 'Тарифы FinSkills Pro' };

const plans = [
  { name: 'Start', price: '0 ₽', features: ['Открытые статьи и вводные материалы', 'Знакомство с платформой и интерфейсом', 'Базовые сценарии Telegram-ассистента'] },
  { name: 'Learning', price: '990 ₽/мес', features: ['Все курсы и уроки', 'Тесты, прогресс и рекомендации', 'Участие в открытых вебинарах'] },
  { name: 'Family', price: '1 790 ₽/мес', features: ['До 3 пользователей в семье', 'Семейные сценарии и рекомендации', 'Архив вебинаров и сертификаты'] }
];

export default function PricingPage() {
  return (
    <Container className="py-12">
      <h1 className="text-4xl font-semibold">Тарифы</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Подберите формат обучения под свой ритм: самостоятельный старт, полная учебная траектория или семейный доступ.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="rounded-[30px] border-slate-200/80">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-3xl font-semibold text-primary">{plan.price}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm leading-6">
                  <Check className="h-4 w-4 text-accent" />
                  {feature}
                </div>
              ))}
              <Button className="mt-4 w-full">Выбрать</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}

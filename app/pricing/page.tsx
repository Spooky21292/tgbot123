import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Тарифы', description: 'Тарифы FinSkills Pro' };

const plans = [
  { name: 'Start', price: '0 ₽', features: ['Открытые статьи и вводные материалы', 'Знакомство с платформой и интерфейсом', 'Базовые сценарии Telegram-ассистента'] },
  { name: 'Learning', price: '990 ₽/мес', features: ['Все курсы и уроки', 'Тесты, прогресс и рекомендации', 'Все вебинары и доступ к записям'] },
  { name: 'Family', price: '1 790 ₽/мес', features: ['До 3 пользователей в семье', 'Семейные сценарии и рекомендации', 'Архив вебинаров и семейный доступ к записям'] }
];

export default function PricingPage() {
  return (
    <Container className="py-10 sm:py-12">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Тарифы</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Выберите формат доступа под свой ритм: аккуратный старт, полная учебная траектория или семейный план.
        </p>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{plan.price}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span>{feature}</span>
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

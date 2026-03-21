import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Тарифы', description: 'Тарифы FinSkills Pro' };

const plans = [
  { name: 'Start', price: '0 ₽', features: ['Доступ к демо-урокам', 'Блог и FAQ', 'Mock Telegram-бот'] },
  { name: 'Learning', price: '990 ₽/мес', features: ['Все курсы', 'Тесты и прогресс', 'Участие в вебинарах'] },
  { name: 'Family', price: '1 790 ₽/мес', features: ['До 3 пользователей', 'Семейные рекомендации', 'Сертификаты и архив вебинаров'] }
];

export default function PricingPage() { return <Container className="py-12"><h1 className="text-4xl font-semibold">Тарифы</h1><p className="mt-3 max-w-2xl text-muted-foreground">Сравнение тарифов для MVP. Подходит для демонстрации бизнес-модели проекта.</p><div className="mt-8 grid gap-6 lg:grid-cols-3">{plans.map((plan) => <Card key={plan.name}><CardHeader><CardTitle>{plan.name}</CardTitle><p className="text-3xl font-semibold text-primary">{plan.price}</p></CardHeader><CardContent className="space-y-3">{plan.features.map((feature) => <div key={feature} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-accent" />{feature}</div>)}<Button className="mt-4 w-full">Выбрать</Button></CardContent></Card>)}</div></Container>; }

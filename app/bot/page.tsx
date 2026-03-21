import type { Metadata } from 'next';
import { Bot, Bell, MessageCircleQuestion, BarChart3, Sparkles } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Telegram-бот', description: 'Образовательный Telegram-ассистент FinSkills Pro' };

const icons = { Bell, MessageCircleQuestion, BarChart3, Sparkles } as const;

export default async function BotPage() {
  const features = await db.botFeature.findMany();
  return <Container className="py-12"><div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]"><div><h1 className="text-4xl font-semibold">Telegram-бот-ассистент</h1><p className="mt-4 text-lg text-muted-foreground">Бот помогает удерживать фокус на обучении: напоминает о целях, отвечает на вопросы и присылает образовательные обзоры без торговых сигналов и обещаний прибыли.</p><div className="mt-6 flex gap-4"><Button>Подключить бота</Button><Button variant="secondary">Demo webhook section</Button></div><div className="mt-10 grid gap-4">{features.map((feature) => { const Icon = icons[feature.icon as keyof typeof icons] ?? Bot; return <Card key={feature.id}><CardHeader><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary"><Icon className="h-6 w-6 text-primary" /></div><CardTitle>{feature.title}</CardTitle></CardHeader><CardContent className="text-muted-foreground">{feature.description}</CardContent></Card>; })}</div></div><Card className="h-fit"><CardHeader><CardTitle>Mock UI</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><div className="rounded-2xl bg-secondary p-4">👋 Привет! Сегодня у вас запланирован урок по бюджету.</div><div className="rounded-2xl border p-4">📌 Подсказка: сначала цель, потом инструмент. Сравните риск, срок и ликвидность.</div><div className="rounded-2xl bg-secondary p-4">📊 Короткая сводка: инфляция влияет на покупательную способность, поэтому важно иметь резерв и план расходов.</div></CardContent></Card></div></Container>;
}

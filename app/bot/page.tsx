import type { Metadata } from 'next';
import { Bot, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Telegram-бот', description: 'Telegram-ассистент FinSkills Pro' };

const icons = { Sparkles, TrendingUp } as const;

export default async function BotPage() {
  const features = await db.botFeature.findMany();

  return (
    <Container className="py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Telegram-бот с ежедневными идеями по акциям и облигациям</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Бот ежедневно собирает открытую информацию из интернета, выделяет одну идею по акции или облигации и показывает её как вероятностный сценарий для изучения. Это не гарантия результата, не персональная инвестиционная рекомендация и не обещание прибыли.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><a href="/pricing?plan=bot">Подключить бота</a></Button>
            <Button variant="secondary">Посмотреть сценарии</Button>
          </div>
          <div className="mt-8 grid gap-4">
            {features.map((feature) => {
              const Icon = icons[feature.icon as keyof typeof icons] ?? Bot;
              return (
                <Card key={feature.id}>
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40 text-primary">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <CardTitle className="pt-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-7 text-muted-foreground">{feature.description}</CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Как это работает</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <div className="rounded-xl border border-border/80 bg-background p-4">📌 В сообщении приходит инструмент, краткая логика сценария, риск-факторы и напоминание, что решение всегда остаётся за пользователем.</div>
            <div className="rounded-xl border border-border/80 bg-muted/30 p-4">📊 Бот присылает вероятностный сигнал по акции или облигации, чтобы вы могли разобрать идею, риски и сценарий самостоятельно.</div>
            <div className="rounded-xl border border-border/80 bg-background p-4">🛡️ Даже при высокой исторической точности сигнал не является гарантированным и может не сработать на реальном рынке.</div>
            <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-slate-950 px-4 py-3 text-sm text-slate-100 dark:bg-slate-100 dark:text-slate-950">
              <ShieldCheck className="mt-0.5 h-4 w-4" />
              Используйте идеи бота только как образовательный ориентир и повод перепроверить сценарий самостоятельно.
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

import type { Metadata } from 'next';
import { Bot, Bell, MessageCircleQuestion, BarChart3, Sparkles, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Telegram-бот', description: 'Образовательный Telegram-ассистент FinSkills Pro' };

const icons = { Bell, MessageCircleQuestion, BarChart3, Sparkles } as const;

export default async function BotPage() {
  const features = await db.botFeature.findMany();

  return (
    <Container className="py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Telegram-ассистент для спокойного учебного ритма</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Бот напоминает о незавершённых уроках, помогает закреплять ключевые идеи и поддерживает регулярность без давления и лишнего шума.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button>Подключить бота</Button>
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
            <CardTitle>Пример сценария</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <div className="rounded-xl border border-border/80 bg-muted/30 p-4">👋 У вас открыт следующий урок: «Бюджет месяца». На прохождение нужно около 16 минут.</div>
            <div className="rounded-xl border border-border/80 bg-background p-4">📌 Сегодняшний фокус: сначала проверьте обязательные расходы, потом распределите деньги по целям и резерву.</div>
            <div className="rounded-xl border border-border/80 bg-muted/30 p-4">📊 Короткая образовательная сводка: резерв и регулярный пересмотр бюджета важнее, чем хаотичные решения.</div>
            <div className="rounded-xl border border-border/80 bg-background p-4">🛡️ Бот никогда не просит коды, пароли или данные карты и не даёт торговых команд.</div>
            <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-slate-950 px-4 py-3 text-sm text-slate-100 dark:bg-slate-100 dark:text-slate-950">
              <ShieldCheck className="mt-0.5 h-4 w-4" />
              Только образовательный сценарий и поддержка темпа обучения.
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

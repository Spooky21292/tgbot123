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
    <Container className="py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <h1 className="text-4xl font-semibold">Telegram-ассистент для регулярного обучения</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">Бот помогает не выпадать из ритма: напоминает о целях, возвращает к незавершённым урокам, объясняет термины простым языком и присылает короткие образовательные обзоры без сигналов и обещаний дохода.</p>
          <div className="mt-6 flex gap-4">
            <Button>Подключить бота</Button>
            <Button variant="secondary">Посмотреть сценарии</Button>
          </div>
          <div className="mt-10 grid gap-4">
            {features.map((feature) => {
              const Icon = icons[feature.icon as keyof typeof icons] ?? Bot;
              return (
                <Card key={feature.id} className="rounded-[28px] border-slate-200/80">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-7 text-muted-foreground">{feature.description}</CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="h-fit rounded-[32px] border-slate-200/80">
          <CardHeader>
            <CardTitle>Как это выглядит в продукте</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7">
            <div className="rounded-[24px] bg-secondary p-4">👋 Привет! У вас открыт следующий урок: «Бюджет месяца». На прохождение нужно около 16 минут.</div>
            <div className="rounded-[24px] border border-slate-200/80 p-4">📌 Сегодняшний фокус: сначала проверьте обязательные расходы, потом распределите деньги по целям и резерву.</div>
            <div className="rounded-[24px] bg-secondary p-4">📊 Короткая образовательная сводка: инфляция влияет на покупательную способность, поэтому резерв и регулярный пересмотр бюджета важнее, чем хаотичные решения.</div>
            <div className="rounded-[24px] border border-slate-200/80 p-4">🛡️ Безопасность: бот никогда не просит коды, пароли или данные карты и не даёт команд «купить / продать».</div>
            <div className="flex items-center gap-3 rounded-[24px] bg-slate-950 p-4 text-white"><ShieldCheck className="h-5 w-5 text-emerald-400" /> Только образовательный сценарий и поддержка ритма обучения.</div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

import { ArrowRightLeft, RefreshCcw, Wallet } from 'lucide-react';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getTradingDashboard } from '@/lib/demo-trading';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetDemoAccountButton } from '@/components/trade/reset-demo-account-button';

export default async function TradePage({ searchParams }: { searchParams?: { search?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');

  try {
    const data = await getTradingDashboard(session.user.id, searchParams?.search);

    return (
      <Container className="py-10 sm:py-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge>Демо-счёт</Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Учебный торговый симулятор</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Только виртуальный баланс, рыночные данные и образовательная практика. Никаких депозитов, вывода средств и реального исполнения.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ResetDemoAccountButton />
            <Button variant="secondary" asChild>
              <Link href="/pricing">Доступ к платформе</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ['Свободный баланс', `$${data.account.balance.toFixed(2)}`],
            ['Инвестировано', `$${data.metrics.investedAmount.toFixed(2)}`],
            ['Рыночная стоимость', `$${data.metrics.portfolioValue.toFixed(2)}`],
            ['Нереализованный PnL', `${data.metrics.unrealizedPnl >= 0 ? '+' : ''}$${data.metrics.unrealizedPnl.toFixed(2)}`],
            ['Доходность', `${data.metrics.totalReturn >= 0 ? '+' : ''}${data.metrics.totalReturn.toFixed(2)}%`]
          ].map(([label, value]) => (
            <Card key={label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Портфель</CardTitle>
              <CardDescription>Открытые позиции и текущая оценка по рынку.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.positions.length ? data.positions.map(({ position, quote, marketValue, unrealizedPnl }) => (
                <div key={position.id} className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{position.asset.symbol}</p>
                    <p className="text-sm text-muted-foreground">{position.asset.name}</p>
                  </div>
                  <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2 md:min-w-[340px]">
                    <span>Объём: {position.quantity.toFixed(4)}</span>
                    <span>Средняя: ${position.averagePrice.toFixed(2)}</span>
                    <span>Текущая: ${quote.price.toFixed(2)}</span>
                    <span className={unrealizedPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      PnL: {unrealizedPnl >= 0 ? '+' : ''}${unrealizedPnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-foreground">${marketValue.toFixed(2)}</p>
                    <Button variant="secondary" asChild>
                      <Link href={`/trade/${encodeURIComponent(position.asset.symbol)}`}>Открыть</Link>
                    </Button>
                  </div>
                </div>
              )) : <p className="text-sm leading-6 text-muted-foreground">Пока нет открытых позиций. Выберите актив из watchlist и сделайте первую демо-сделку.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ArrowRightLeft className="h-4 w-4 text-primary" /> Watchlist</CardTitle>
              <CardDescription>Небольшой набор активов для спокойной учебной практики.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="mb-4">
                <input
                  name="search"
                  defaultValue={searchParams?.search}
                  placeholder="Поиск по активам"
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground outline-none"
                />
              </form>
              <div className="space-y-3">
                {data.watchlist.map(({ asset, quote }) => (
                  <Link key={asset.id} href={`/trade/${encodeURIComponent(asset.symbol)}`} className="flex items-center justify-between rounded-xl border border-border/80 px-4 py-3 transition-colors hover:bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">{asset.symbol}</p>
                      <p className="text-sm text-muted-foreground">{asset.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">${quote.price.toFixed(asset.symbol === 'EUR/USD' ? 4 : 2)}</p>
                      <p className={quote.changePercent >= 0 ? 'text-sm text-emerald-600 dark:text-emerald-400' : 'text-sm text-rose-600 dark:text-rose-400'}>
                        {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Подсказка</CardTitle>
              <CardDescription>Это учебный модуль, а не брокерский интерфейс.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>• Баланс виртуальный и начинается со $100,000.</p>
              <p>• Рыночные данные приходят через серверный market-data слой и могут временно быть недоступны.</p>
              <p>• Сначала изучайте риск, размер позиции и дисциплину — только потом смотрите на доходность.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>История сделок</CardTitle>
                  <CardDescription>Последние покупки и продажи на демо-счёте.</CardDescription>
                </div>
                <RefreshCcw className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.trades.length ? data.trades.map((trade) => (
                <div key={trade.id} className="flex flex-col gap-2 rounded-xl border border-border/80 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{trade.asset.symbol} · {trade.side}</p>
                    <p className="text-muted-foreground">{new Date(trade.createdAt).toLocaleString('ru-RU')}</p>
                  </div>
                  <div className="grid gap-1 text-muted-foreground sm:grid-cols-3 md:min-w-[360px]">
                    <span>Qty: {trade.quantity.toFixed(4)}</span>
                    <span>Цена: ${trade.price.toFixed(2)}</span>
                    <span>Итого: ${trade.total.toFixed(2)}</span>
                  </div>
                </div>
              )) : <p className="text-sm leading-6 text-muted-foreground">История сделок появится после первой учебной операции.</p>}
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  } catch (error) {
    return (
      <Container className="py-10 sm:py-12">
        <Card>
          <CardHeader>
            <Badge>Демо-счёт</Badge>
            <CardTitle>Торговый модуль ещё не инициализирован</CardTitle>
            <CardDescription>
              Скорее всего Prisma Client ещё не обновлён под новые модели demo trading.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>Выполните `npm run db:generate`, затем `npm run db:push` и `npm run db:seed`, после чего откройте страницу снова.</p>
            <p>Техническая причина: {error instanceof Error ? error.message : 'неизвестная ошибка'}.</p>
          </CardContent>
        </Card>
      </Container>
    );
  }
}

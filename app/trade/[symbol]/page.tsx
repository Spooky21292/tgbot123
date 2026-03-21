import { TrendingUp } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getAssetTradingView, getDemoTradingErrorMessage } from '@/lib/demo-trading';
import { getCurrencySymbol, getMarketCandles } from '@/lib/market-data';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BondIncomeCard } from '@/components/trade/bond-income-card';
import { LiveAssetPrice } from '@/components/trade/live-asset-price';
import { PriceChart } from '@/components/trade/price-chart';
import { OrderPanel } from '@/components/trade/order-panel';

export default async function AssetTradePage({ params }: { params: { symbol: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');

  try {
    const symbol = decodeURIComponent(params.symbol);
    const view = await getAssetTradingView(session.user.id, symbol);
    if (!view) notFound();
    const candles = await getMarketCandles(view.asset.symbol);
    const currencySymbol = getCurrencySymbol(view.asset.symbol);

    return (
      <Container className="py-10 sm:py-12">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Демо-трейд', href: '/trade' }, { label: view.asset.symbol }]} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge>Демо-счёт</Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">{view.asset.symbol}</h1>
            <p className="mt-2 text-base text-muted-foreground">{view.asset.name}</p>
          </div>
          <LiveAssetPrice symbol={view.asset.symbol} initialQuote={view.quote} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <PriceChart symbol={view.asset.symbol} candles={candles} initialQuote={view.quote} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Позиция по активу</CardTitle>
                <CardDescription>Средняя цена входа, объём и текущий результат на демо-счёте.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Количество</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{view.position?.quantity?.toFixed(4) ?? '0.0000'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Средняя цена</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{view.position?.averagePrice ? `${view.position.averagePrice.toFixed(2)} ${currencySymbol}` : `0.00 ${currencySymbol}`}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Рыночная стоимость</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{view.marketValue.toFixed(2)} {currencySymbol}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Нереализованный PnL</p>
                  <p className={view.unrealizedPnl >= 0 ? 'mt-2 text-xl font-semibold text-emerald-600 dark:text-emerald-400' : 'mt-2 text-xl font-semibold text-rose-600 dark:text-rose-400'}>
                    {view.unrealizedPnl >= 0 ? '+' : ''}{view.unrealizedPnl.toFixed(2)} {currencySymbol}
                  </p>
                </div>
              </CardContent>
            </Card>

            {view.asset.type === 'bond' ? <BondIncomeCard symbol={view.asset.symbol} ownedQuantity={view.position?.quantity ?? 0} /> : null}

            <Card>
              <CardHeader>
                <CardTitle>Последние сделки по активу</CardTitle>
                <CardDescription>История операций только в рамках демо-симулятора.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {view.trades.length ? view.trades.map((trade) => (
                  <div key={trade.id} className="flex flex-col gap-2 rounded-xl border border-border/80 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
                    <p className="font-medium text-foreground">{trade.side}</p>
                    <div className="grid gap-1 text-muted-foreground sm:grid-cols-3 md:min-w-[360px]">
                      <span>Qty: {trade.quantity.toFixed(4)}</span>
                      <span>Цена: {trade.price.toFixed(2)} {currencySymbol}</span>
                      <span>Итого: {trade.total.toFixed(2)} {currencySymbol}</span>
                    </div>
                    <p className="text-muted-foreground">{new Date(trade.createdAt).toLocaleString('ru-RU')}</p>
                  </div>
                )) : <p className="text-sm leading-6 text-muted-foreground">Сделок по этому активу ещё нет.</p>}
              </CardContent>
            </Card>
          </div>

          <OrderPanel symbol={view.asset.symbol} price={view.quote.price} availableBalance={view.account.balance} ownedQuantity={view.position?.quantity ?? 0} />
        </div>
      </Container>
    );
  } catch (error) {
    return (
      <Container className="py-10 sm:py-12">
        <Card>
          <CardHeader>
            <Badge>Демо-счёт</Badge>
            <CardTitle>Торговый модуль временно недоступен</CardTitle>
            <CardDescription>Проблема связана либо с инициализацией Prisma, либо с устаревшей пользовательской сессией.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>{getDemoTradingErrorMessage(error)}</p>
            <p>Если вы недавно пересоздавали базу данных, обновите сессию: выйдите из аккаунта и войдите снова.</p>
          </CardContent>
        </Card>
      </Container>
    );
  }
}

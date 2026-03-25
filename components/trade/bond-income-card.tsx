import { getBondIncomePreview, getCurrencySymbol } from '@/lib/market-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function formatMoney(value: number, symbol: string) {
  return `${value.toFixed(2)} ${getCurrencySymbol(symbol)}`;
}

export function BondIncomeCard({ symbol, ownedQuantity }: { symbol: string; ownedQuantity: number }) {
  const oneBond = getBondIncomePreview(symbol, 1);
  const owned = getBondIncomePreview(symbol, Math.max(ownedQuantity, 1));

  if (!oneBond || !owned) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Доход по облигации</CardTitle>
        <CardDescription>
          Оценка купонного дохода по ставке {oneBond.annualCouponPercent}% годовых от номинала {oneBond.nominal} ₽.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">За месяц</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{formatMoney(oneBond.monthly, symbol)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">За полгода</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{formatMoney(oneBond.semiAnnual, symbol)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">За год</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{formatMoney(oneBond.annual, symbol)}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-muted/25 p-4 text-sm text-muted-foreground">
          По вашей позиции ({owned.quantity.toFixed(4)} шт.) это примерно {formatMoney(owned.monthly, symbol)} за месяц, {formatMoney(owned.semiAnnual, symbol)} за полгода и {formatMoney(owned.annual, symbol)} за год без учёта налога и изменения рыночной цены.
        </div>
      </CardContent>
    </Card>
  );
}

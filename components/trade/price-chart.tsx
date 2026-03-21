import { cn } from '@/lib/utils';
import type { MarketCandle } from '@/lib/market-data';

export function PriceChart({ candles, className }: { candles: MarketCandle[]; className?: string }) {
  if (!candles.length) {
    return <div className={cn('flex h-72 items-center justify-center rounded-2xl border border-border/80 bg-card text-sm text-muted-foreground', className)}>История цен временно недоступна.</div>;
  }

  const width = 720;
  const height = 280;
  const padding = 24;
  const closes = candles.map((item) => item.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = Math.max(max - min, 1);
  const points = candles.map((item, index) => {
    const x = padding + (index / Math.max(candles.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((item.close - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={cn('rounded-2xl border border-border/80 bg-card p-4', className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        <defs>
          <linearGradient id="trade-chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = padding + (line / 3) * (height - padding * 2);
          return <line key={line} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#cbd5e1" strokeDasharray="4 4" />;
        })}
        <polyline fill="none" stroke="#2563eb" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points} />
        <polygon fill="url(#trade-chart-fill)" points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`} />
      </svg>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{new Date(candles[0].time).toLocaleDateString('ru-RU')}</span>
        <span>{new Date(candles[candles.length - 1].time).toLocaleDateString('ru-RU')}</span>
      </div>
    </div>
  );
}

import { NextResponse } from 'next/server';
import { getMarketCandles } from '@/lib/market-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    if (!symbol) {
      return NextResponse.json({ ok: false, error: 'Укажите symbol' }, { status: 400 });
    }
    const interval = searchParams.get('interval') as '1min' | '15min' | '1h' | '1day' | null;
    const points = Number(searchParams.get('points') ?? 0);
    const candles = await getMarketCandles(symbol, {
      interval: interval && ['1min', '15min', '1h', '1day'].includes(interval) ? interval : undefined,
      points: Number.isFinite(points) && points > 0 ? points : undefined
    });
    return NextResponse.json({ ok: true, data: candles });
  } catch {
    return NextResponse.json({ ok: false, error: 'Не удалось получить историю цен' }, { status: 500 });
  }
}

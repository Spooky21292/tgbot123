import { NextResponse } from 'next/server';
import { getMarketCandles } from '@/lib/market-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    if (!symbol) {
      return NextResponse.json({ ok: false, error: 'Укажите symbol' }, { status: 400 });
    }
    const candles = await getMarketCandles(symbol);
    return NextResponse.json({ ok: true, data: candles });
  } catch {
    return NextResponse.json({ ok: false, error: 'Не удалось получить историю цен' }, { status: 500 });
  }
}

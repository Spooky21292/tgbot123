export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getMarketQuote } from '@/lib/market-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    if (!symbol) {
      return NextResponse.json({ ok: false, error: 'Укажите symbol' }, { status: 400 });
    }
    const quote = await getMarketQuote(symbol);
    return NextResponse.json({ ok: true, data: quote }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ ok: false, error: 'Не удалось получить котировку' }, { status: 500 });
  }
}

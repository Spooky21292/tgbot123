import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { executeDemoTrade, getDemoTradingErrorMessage, isDemoTradingReady } from '@/lib/demo-trading';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!isDemoTradingReady()) {
      return NextResponse.json({ ok: false, error: 'Демо-трейдинг ещё не инициализирован. Выполните prisma generate/db push/db seed.' }, { status: 503 });
    }
    const body = await request.json().catch(() => null);
    const symbol = String(body?.symbol ?? '');
    const side = String(body?.side ?? '');
    const quantity = Number(body?.quantity ?? 0);
    const result = await executeDemoTrade({ userId: session.user.id, symbol, side, quantity });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true, data: result.data });
  } catch (error) {
    if (error instanceof Error && error.message === 'DEMO_TRADING_USER_NOT_FOUND') {
      return NextResponse.json({ ok: false, error: getDemoTradingErrorMessage(error) }, { status: 401 });
    }

    return NextResponse.json({ ok: false, error: 'Не удалось выполнить демо-сделку' }, { status: 500 });
  }
}

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { isDemoTradingReady, resetDemoAccount } from '@/lib/demo-trading';

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
    if (!body?.confirm) {
      return NextResponse.json({ ok: false, error: 'Подтвердите сброс демо-счёта' }, { status: 400 });
    }
    const account = await resetDemoAccount(session.user.id);
    return NextResponse.json({ ok: true, data: account });
  } catch {
    return NextResponse.json({ ok: false, error: 'Не удалось сбросить демо-счёт' }, { status: 500 });
  }
}

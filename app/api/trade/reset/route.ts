import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { resetDemoAccount } from '@/lib/demo-trading';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
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

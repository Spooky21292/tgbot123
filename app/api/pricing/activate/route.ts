import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { planId, promoCode } = await request.json().catch(() => ({}));
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (user?.familyOwnerId) {
    return NextResponse.json({ error: 'Сначала выйдите из семейного доступа, чтобы купить свой тариф' }, { status: 400 });
  }
  if (!['bot', 'learning', 'family'].includes(planId)) {
    return NextResponse.json({ error: 'Неизвестный тариф' }, { status: 400 });
  }
  if (promoCode !== 'TESTPROMO') {
    return NextResponse.json({ error: 'Нужен тестовый код TESTPROMO' }, { status: 400 });
  }
  if (user?.activePlan && user?.planExpiresAt && new Date(user.planExpiresAt).getTime() > Date.now()) {
    return NextResponse.json({ error: 'У вас уже есть активный тариф. Дождитесь его завершения перед сменой плана.' }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
  await db.user.update({
    where: { id: session.user.id },
    data: { activePlan: planId, planExpiresAt: expiresAt, promoCodeUsed: promoCode, familyOwnerId: null }
  });

  return NextResponse.json({ ok: true, expiresAt });
}

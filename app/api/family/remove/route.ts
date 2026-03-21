import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { isFamilyPlan } from '@/lib/access';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const owner = await db.user.findUnique({ where: { id: session.user.id }, include: { familyMembers: true } });
  if (!owner || !isFamilyPlan(owner)) return NextResponse.json({ error: 'Семейный тариф не активен' }, { status: 403 });

  const { memberId } = await request.json().catch(() => ({}));
  if (!memberId) return NextResponse.json({ error: 'Не указан участник' }, { status: 400 });

  const member = owner.familyMembers.find((item) => item.id === memberId);
  if (!member) return NextResponse.json({ error: 'Участник не найден в вашей семье' }, { status: 404 });

  await db.user.update({ where: { id: memberId }, data: { familyOwnerId: null } });
  return NextResponse.json({ ok: true });
}

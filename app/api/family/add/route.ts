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
  if (owner.familyMembers.length >= 3) return NextResponse.json({ error: 'Можно добавить только 3 человек' }, { status: 400 });

  const { email } = await request.json().catch(() => ({}));
  if (!email) return NextResponse.json({ error: 'Укажите email' }, { status: 400 });

  const member = await db.user.findUnique({ where: { email } });
  if (!member) return NextResponse.json({ error: 'Пользователь с таким email не найден' }, { status: 404 });
  if (member.id === owner.id) return NextResponse.json({ error: 'Нельзя добавить себя' }, { status: 400 });

  await db.user.update({ where: { id: member.id }, data: { familyOwnerId: owner.id } });
  return NextResponse.json({ ok: true });
}

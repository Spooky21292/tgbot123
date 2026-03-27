import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { familyOwnerId: true } });
  if (!user?.familyOwnerId) return NextResponse.json({ error: 'Вы не состоите в семейном тарифе' }, { status: 400 });

  await db.user.update({ where: { id: session.user.id }, data: { familyOwnerId: null } });
  return NextResponse.json({ ok: true });
}

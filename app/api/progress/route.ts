import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { lessonId } = await request.json();
  await db.userProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { completed: true, completedAt: new Date() },
    create: { userId: session.user.id, lessonId, completed: true, completedAt: new Date() }
  });
  return NextResponse.json({ ok: true });
}

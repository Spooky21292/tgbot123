import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const payload = await request.json();
  const lesson = await db.lesson.create({
    data: {
      courseId: payload.courseId,
      title: payload.title,
      description: payload.description,
      videoUrl: payload.videoUrl,
      content: payload.content,
      order: Number(payload.order),
      durationMinutes: Number(payload.durationMinutes)
    }
  });
  return NextResponse.json(lesson);
}

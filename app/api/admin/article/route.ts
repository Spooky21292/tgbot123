import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { articleSchema } from '@/lib/validations';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const payload = articleSchema.safeParse(await request.json());
  if (!payload.success) return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  return NextResponse.json(await db.article.create({ data: payload.data }));
}

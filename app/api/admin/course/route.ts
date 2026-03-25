import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { courseSchema } from '@/lib/validations';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const payload = courseSchema.safeParse(await request.json());
  if (!payload.success) return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  const course = await db.course.create({ data: payload.data });
  return NextResponse.json(course);
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const json = await request.json();
  const { id, ...values } = json;
  const payload = courseSchema.safeParse(values);
  if (!payload.success) return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  const course = await db.course.update({ where: { id }, data: payload.data });
  return NextResponse.json(course);
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await request.json();
  await db.course.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

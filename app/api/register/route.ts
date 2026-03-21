import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { registerSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const payload = registerSchema.safeParse(await request.json());
  if (!payload.success) return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  const exists = await db.user.findUnique({ where: { email: payload.data.email } });
  if (exists) return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 409 });
  const passwordHash = await bcrypt.hash(payload.data.password, 10);
  await db.user.create({ data: { ...payload.data, passwordHash } });
  return NextResponse.json({ ok: true });
}

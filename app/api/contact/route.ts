import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const payload = contactSchema.safeParse(await request.json());
  if (!payload.success) return NextResponse.json({ error: 'Проверьте заполнение формы' }, { status: 400 });
  await db.contactRequest.create({ data: payload.data });
  return NextResponse.json({ ok: true });
}

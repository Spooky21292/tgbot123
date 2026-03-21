import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getDemoStartingBalance } from '@/lib/demo-trading';
import { registerSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const payload = registerSchema.safeParse(json);

    if (!payload.success) {
      return NextResponse.json(
        { ok: false, error: 'Проверьте заполнение формы', details: payload.error.flatten() },
        { status: 400 }
      );
    }

    const exists = await db.user.findUnique({ where: { email: payload.data.email } });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(payload.data.password, 10);
    const initialBalance = getDemoStartingBalance();

    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: payload.data.name,
          email: payload.data.email,
          ageGroup: payload.data.ageGroup,
          passwordHash,
          role: 'user'
        }
      });

      await tx.demoAccount.create({
        data: {
          userId: user.id,
          balance: initialBalance,
          initialBalance,
          currency: 'USD'
        }
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('register_error', error);
    return NextResponse.json(
      { ok: false, error: 'Не удалось создать аккаунт. Попробуйте ещё раз.' },
      { status: 500 }
    );
  }
}

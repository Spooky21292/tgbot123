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
  const quiz = await db.quiz.create({
    data: {
      lessonId: payload.lessonId,
      title: payload.title,
      questions: {
        create: (payload.questions || []).map((question: any) => ({
          question: question.question,
          optionA: question.optionA,
          optionB: question.optionB,
          optionC: question.optionC,
          optionD: question.optionD,
          correctAnswer: question.correctAnswer
        }))
      }
    },
    include: { questions: true }
  });
  return NextResponse.json(quiz);
}

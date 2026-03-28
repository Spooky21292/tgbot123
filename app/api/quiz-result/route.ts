import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getQuizFeedback } from '@/lib/utils';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { quizId, answers } = await request.json();
  const quiz = await db.quiz.findUnique({ where: { id: quizId }, include: { questions: true } });
  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  const correct = quiz.questions.filter((question) => answers?.[question.id] === question.correctAnswer).length;
  const score = Math.round((correct / quiz.questions.length) * 100);
  await db.quizResult.create({ data: { userId: session.user.id, quizId, score } });
  return NextResponse.json({ score, feedback: getQuizFeedback(score) });
}

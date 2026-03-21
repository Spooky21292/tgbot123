"use client";

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QuizForm({ quiz, lessonId }: { quiz: any; lessonId: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => startTransition(async () => {
    const response = await fetch('/api/quiz-result', { method: 'POST', body: JSON.stringify({ quizId: quiz.id, answers }) });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || 'Ошибка при отправке теста');
    setResult(data);
    toast.success('Результат сохранён');
  });

  const completeLesson = () => startTransition(async () => {
    const response = await fetch('/api/progress', { method: 'POST', body: JSON.stringify({ lessonId }) });
    if (!response.ok) return toast.error('Не удалось обновить прогресс');
    toast.success('Урок отмечен как пройденный');
  });

  return (
    <div className="space-y-6">
      <Button variant="secondary" onClick={completeLesson} disabled={pending}>Отметить как пройдено</Button>
      <Card>
        <CardHeader><CardTitle>{quiz.title}</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {quiz.questions.map((question: any, index: number) => (
            <div key={question.id} className="space-y-3 rounded-2xl border p-4">
              <p className="font-medium">{index + 1}. {question.question}</p>
              {['A', 'B', 'C', 'D'].map((option) => {
                const text = question[`option${option}` as const];
                return <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 hover:bg-muted"><input type="radio" name={question.id} checked={answers[question.id] === option} onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))} />{text}</label>;
              })}
            </div>
          ))}
          <Button onClick={submit} disabled={pending}>Завершить тест</Button>
          {result && <div className="rounded-2xl bg-secondary p-4"><p className="font-semibold">Результат: {result.score}%</p><p className="text-sm text-muted-foreground">{result.feedback}</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}

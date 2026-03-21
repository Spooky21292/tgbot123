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
    <div className="space-y-4">
      <Button variant="secondary" onClick={completeLesson} disabled={pending}>Отметить урок как пройденный</Button>
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {quiz.questions.map((question: any, index: number) => (
            <div key={question.id} className="space-y-3 border-t border-border/70 pt-6 first:border-t-0 first:pt-0">
              <p className="font-medium leading-7 text-foreground">{index + 1}. {question.question}</p>
              <div className="space-y-2">
                {['A', 'B', 'C', 'D'].map((option) => {
                  const text = question[`option${option}` as const];
                  return (
                    <label key={option} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 px-4 py-3 text-sm leading-6 transition-colors hover:bg-muted/50">
                      <input
                        type="radio"
                        name={question.id}
                        checked={answers[question.id] === option}
                        onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}
                        className="mt-1"
                      />
                      <span>{text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <Button onClick={submit} disabled={pending}>Завершить тест</Button>
          {result && (
            <div className="rounded-xl border border-border/80 bg-muted/40 p-4">
              <p className="font-semibold text-foreground">Результат: {result.score}%</p>
              <p className="mt-1 text-sm text-muted-foreground">{result.feedback}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

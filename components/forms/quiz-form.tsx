"use client";

import { useState, useTransition } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function QuizForm({ quiz, lessonId, initialCompleted = false }: { quiz: any; lessonId: string; initialCompleted?: boolean }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);
  const [completed, setCompleted] = useState(initialCompleted);
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
    setCompleted(true);
    window.dispatchEvent(new Event('lesson-completed'));
    toast.success('Урок отмечен как пройденный');
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/80 bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Статус урока</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {completed ? 'Урок уже отмечен как пройденный.' : 'Отметьте урок после просмотра и чтения конспекта.'}
            </p>
          </div>
          <label className={cn('checkBox transition', completed && 'opacity-100')}>
            <input type="checkbox" checked={completed} onChange={() => !completed && completeLesson()} />
            <div className="transition" />
          </label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {quiz.questions.map((question: any, index: number) => (
            <div key={question.id} className="space-y-3 border-t border-border/70 pt-6 first:border-t-0 first:pt-0">
              <p className="font-medium leading-7 text-foreground">{index + 1}. {question.question}</p>
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((option: any) => {
                  const text = question[`option${option}` as const];
                  const checked = answers[question.id] === option;
                  return (
                    <label key={option} className={cn('flex cursor-pointer items-start gap-3 rounded-2xl border border-border/80 px-4 py-3 text-sm leading-6 transition-colors', checked ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950' : 'hover:bg-muted/50')}>
                      <span className="checkBox transition mt-0.5 scale-[0.82]">
                        <input
                          type="radio"
                          name={question.id}
                          checked={checked}
                          onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}
                        />
                        <div className="transition" />
                      </span>
                      <span>{text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <Button onClick={submit} disabled={pending}>Завершить тест</Button>
          {result && (
            <div className="rounded-2xl border border-border/80 bg-muted/40 p-4">
              <p className="flex items-center gap-2 font-semibold text-foreground"><CheckCircle2 className="h-4 w-4" /> Результат: {result.score}%</p>
              <p className="mt-1 text-sm text-muted-foreground">{result.feedback}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

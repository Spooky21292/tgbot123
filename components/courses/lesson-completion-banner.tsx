"use client";

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export function LessonCompletionBanner({ initialCompleted }: { initialCompleted: boolean }) {
  const [completed, setCompleted] = useState(initialCompleted);

  useEffect(() => {
    const handler = () => setCompleted(true);
    window.addEventListener('lesson-completed', handler);
    return () => window.removeEventListener('lesson-completed', handler);
  }, []);

  if (!completed) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-blue-200/80 bg-blue-50/80 px-4 py-3 text-sm font-medium text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
      <CheckCircle2 className="h-4 w-4" />
      Урок уже отмечен как пройденный.
    </div>
  );
}

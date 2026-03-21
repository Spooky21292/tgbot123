import type { ReactNode } from 'react';
import { AlertTriangle, Lightbulb, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

function BlockCallout({ title, icon, tone, children }: { title: string; icon: ReactNode; tone: 'tip' | 'warning' | 'important'; children: ReactNode }) {
  const toneClass = {
    tip: 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100',
    warning: 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
    important: 'border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100'
  }[tone];

  return (
    <div className={cn('rounded-[24px] border p-5', toneClass)}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <p className="text-sm leading-7">{children}</p>
    </div>
  );
}

export function LessonContent({ content }: { content: string }) {
  const blocks = content.split('\n\n').map((block) => block.trim()).filter(Boolean);

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.startsWith('# ')) {
          return <h2 key={index} className="text-3xl font-semibold text-slate-950 dark:text-white">{block.replace('# ', '')}</h2>;
        }

        if (block.startsWith('## ')) {
          return <h3 key={index} className="pt-2 text-2xl font-semibold text-slate-900 dark:text-white">{block.replace('## ', '')}</h3>;
        }

        if (block.startsWith('### ')) {
          return <h4 key={index} className="text-lg font-semibold text-slate-900 dark:text-white">{block.replace('### ', '')}</h4>;
        }

        if (block.startsWith('💡 Совет:')) {
          return <BlockCallout key={index} title="💡 Совет" icon={<Lightbulb className="h-4 w-4" />} tone="tip">{block.replace('💡 Совет:', '').trim()}</BlockCallout>;
        }

        if (block.startsWith('⚠️ Ошибка:')) {
          return <BlockCallout key={index} title="⚠️ Ошибка" icon={<AlertTriangle className="h-4 w-4" />} tone="warning">{block.replace('⚠️ Ошибка:', '').trim()}</BlockCallout>;
        }

        if (block.startsWith('📌 Важно:')) {
          return <BlockCallout key={index} title="📌 Важно" icon={<Pin className="h-4 w-4" />} tone="important">{block.replace('📌 Важно:', '').trim()}</BlockCallout>;
        }

        if (block.startsWith('- ')) {
          const items = block.split('\n').map((item) => item.replace(/^- /, '').trim()).filter(Boolean);
          return (
            <div key={index} className="rounded-[24px] border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <ul className="space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                {items.map((item) => (
                  <li key={item} className="flex gap-3"><span className="mt-2 h-2 w-2 rounded-full bg-primary" /> <span>{item}</span></li>
                ))}
              </ul>
            </div>
          );
        }

        return <p key={index} className="text-base leading-8 text-slate-700 dark:text-slate-300">{block}</p>;
      })}
    </div>
  );
}

import type { ReactNode } from 'react';
import { AlertTriangle, Lightbulb, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

function BlockCallout({ title, icon, tone, children }: { title: string; icon: ReactNode; tone: 'tip' | 'warning' | 'important'; children: ReactNode }) {
  const toneClass = {
    tip: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200',
    warning: 'border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100',
    important: 'border-blue-200 bg-blue-50/80 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100'
  }[tone];

  return (
    <div className={cn('rounded-2xl border p-5', toneClass)}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <p className="text-sm leading-7">{children}</p>
    </div>
  );
}

export function LessonContent({ content }: { content: string }) {
  const blocks = content.split('\n\n').map((block: any) => block.trim()).filter(Boolean);

  return (
    <div className="prose-finance">
      {blocks.map((block: any, index: any) => {
        if (block.startsWith('# ')) {
          return <h1 key={index}>{block.replace('# ', '')}</h1>;
        }

        if (block.startsWith('## ')) {
          return <h2 key={index}>{block.replace('## ', '')}</h2>;
        }

        if (block.startsWith('### ')) {
          return <h3 key={index}>{block.replace('### ', '')}</h3>;
        }

        if (block.startsWith('💡 Совет:')) {
          return <BlockCallout key={index} title="Совет" icon={<Lightbulb className="h-4 w-4" />} tone="tip">{block.replace('💡 Совет:', '').trim()}</BlockCallout>;
        }

        if (block.startsWith('⚠️ Ошибка:')) {
          return <BlockCallout key={index} title="На что обратить внимание" icon={<AlertTriangle className="h-4 w-4" />} tone="warning">{block.replace('⚠️ Ошибка:', '').trim()}</BlockCallout>;
        }

        if (block.startsWith('📌 Важно:')) {
          return <BlockCallout key={index} title="Важно" icon={<Pin className="h-4 w-4" />} tone="important">{block.replace('📌 Важно:', '').trim()}</BlockCallout>;
        }

        if (block.startsWith('- ')) {
          const items = block.split('\n').map((item: any) => item.replace(/^- /, '').trim()).filter(Boolean);
          return (
            <div key={index} className="rounded-2xl border border-border/80 bg-muted/30 p-5">
              <ul className="space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                {items.map((item: any) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-3 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        return <p key={index}>{block}</p>;
      })}
    </div>
  );
}

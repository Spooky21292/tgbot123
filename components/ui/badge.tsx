import { cn } from '@/lib/utils';

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn('inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium tracking-[0.08em] text-muted-foreground', className)}>{children}</span>;
}

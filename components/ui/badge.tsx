import type * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'border border-border bg-background text-muted-foreground',
  secondary: 'border border-transparent bg-muted text-foreground',
  outline: 'border border-border bg-transparent text-foreground'
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.08em]',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

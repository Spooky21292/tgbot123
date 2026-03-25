import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonBase = 'relative inline-flex min-w-[120px] items-center justify-center whitespace-nowrap rounded-[7px] border-0 px-[17px] py-3 text-sm font-medium transition-all duration-700 ease-[cubic-bezier(0.15,0.83,0.66,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 before:absolute before:bottom-0 before:left-[15%] before:h-px before:w-[70%] before:bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_50%,rgba(255,255,255,0)_100%)] before:opacity-20 before:transition-all before:duration-700';

const buttonVariants = cva(buttonBase, {
  variants: {
    variant: {
      default: 'bg-[radial-gradient(ellipse_at_bottom,rgba(71,81,92,1)_0%,rgba(11,21,30,1)_45%)] text-white/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)] hover:-translate-y-[3px] hover:scale-[1.03] hover:text-white hover:before:opacity-100',
      secondary: 'bg-[radial-gradient(ellipse_at_bottom,rgba(99,116,141,0.95)_0%,rgba(30,41,59,1)_52%)] text-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] hover:-translate-y-[3px] hover:scale-[1.03] hover:text-white',
      outline: 'border border-border bg-card text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] hover:-translate-y-[2px] hover:border-primary/50 hover:text-foreground before:opacity-0',
      ghost: 'bg-transparent text-muted-foreground hover:-translate-y-[2px] hover:text-foreground before:opacity-0'
    },
    size: {
      default: 'h-11',
      sm: 'h-10 min-w-[104px] px-4 py-2.5 text-sm',
      lg: 'h-12 min-w-[132px] px-5 py-3 text-sm'
    }
  },
  defaultVariants: { variant: 'default', size: 'default' }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };

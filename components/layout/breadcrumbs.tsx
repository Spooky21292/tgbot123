import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      {items.map((item: any, index: any) => (
        <span key={item.label} className="flex items-center gap-2">
          {item.href ? <Link href={item.href} className="hover:text-primary">{item.label}</Link> : <span className="text-foreground">{item.label}</span>}
          {index < items.length - 1 ? <ChevronRight className="h-4 w-4" /> : null}
        </span>
      ))}
    </nav>
  );
}

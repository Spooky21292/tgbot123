import Link from 'next/link';
import { Container } from './container';

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-background">
      <Container className="flex flex-col gap-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-foreground">FinSkills Pro</p>
          <p className="mt-1">Спокойное обучение финансовой грамотности для реальной жизни.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/courses" className="transition-colors hover:text-foreground">Курсы</Link>
          <Link href="/trade" className="transition-colors hover:text-foreground">Демо-трейд</Link>
          <Link href="/blog" className="transition-colors hover:text-foreground">Блог</Link>
          <Link href="/webinars" className="transition-colors hover:text-foreground">Вебинары</Link>
        </div>
      </Container>
    </footer>
  );
}

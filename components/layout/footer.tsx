import Link from 'next/link';
import { Container } from './container';

const contacts = ['@Spooky9999', '@Lisa200708', '@LLirik_if', '@semen27778'];

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-background">
      <Container className="flex flex-col gap-6 py-8 text-sm text-muted-foreground lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-medium text-foreground">FinSkills Pro</p>
          <p className="mt-1 max-w-md">Спокойное обучение финансовой грамотности для реальной жизни.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/courses" className="transition-colors hover:text-foreground">Курсы</Link>
          <Link href="/trade" className="transition-colors hover:text-foreground">Демо-трейд</Link>
          <Link href="/blog" className="transition-colors hover:text-foreground">Блог</Link>
          <Link href="/webinars" className="transition-colors hover:text-foreground">Вебинары</Link>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-foreground">Контакты</p>
          <p>Telegram: {contacts.join(' · ')}</p>
        </div>
      </Container>
    </footer>
  );
}

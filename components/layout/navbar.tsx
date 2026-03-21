"use client";

import Link from 'next/link';
import { Menu, GraduationCap } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Container } from './container';
import { ThemeToggle } from './theme-toggle';

const links = [
  ['Курсы', '/courses'],
  ['Блог', '/blog'],
  ['Бот', '/bot'],
  ['Вебинары', '/webinars'],
  ['Тарифы', '/pricing'],
  ['Контакты', '/contact']
];

export function Navbar() {
  const { data: session } = useSession();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-semibold text-slate-900 dark:text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><GraduationCap className="h-5 w-5" /></span>
          <span>FinSkills Pro</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map(([label, href]) => <Link key={href} href={href} className="text-sm text-slate-600 transition hover:text-primary dark:text-slate-300">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session?.user ? (
            <>
              <Button variant="secondary" size="sm" asChild><Link href={session.user.role === 'admin' ? '/admin' : '/dashboard'}>{session.user.role === 'admin' ? 'Админка' : 'Кабинет'}</Link></Button>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>Выйти</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link href="/auth/login">Войти</Link></Button>
              <Button size="sm" asChild><Link href="/auth/register">Регистрация</Link></Button>
            </>
          )}
          <Button variant="ghost" size="sm" className="md:hidden"><Menu className="h-5 w-5" /></Button>
        </div>
      </Container>
    </header>
  );
}

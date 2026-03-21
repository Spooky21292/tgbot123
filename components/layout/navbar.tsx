"use client";

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Container } from './container';
import { ThemeToggle } from './theme-toggle';

const links = [
  ['Курсы', '/courses'],
  ['Демо-трейд', '/trade'],
  ['Блог', '/blog'],
  ['Вебинары', '/webinars']
];

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-primary">
            <GraduationCap className="h-4.5 w-4.5" />
          </span>
          <span>FinSkills Pro</span>
          <span className="loading-wave" aria-hidden="true">
            <span className="loading-bar" />
            <span className="loading-bar" />
            <span className="loading-bar" />
            <span className="loading-bar" />
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session?.user ? (
            <>
              <Button variant="secondary" size="sm" asChild>
                <Link href={session.user.role === 'admin' ? '/admin' : '/dashboard'}>
                  {session.user.role === 'admin' ? 'Админ' : 'Кабинет'}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Войти</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Начать</Link>
              </Button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}

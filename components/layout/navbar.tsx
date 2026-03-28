"use client";

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Container } from './container';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const { data: session } = useSession();
  const links = [
    ['Курсы', session?.user ? '/courses' : '/auth/register'],
    ['Демо-трейд', session?.user ? '/trade' : '/auth/register'],
    ['Блог', session?.user ? '/blog' : '/auth/register'],
    ['Вебинары', session?.user ? '/webinars' : '/auth/register'],
    ['Telegram Бот', session?.user ? '/bot' : '/auth/register']
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur">
      <Container className="flex min-h-16 w-full max-w-full items-center justify-between gap-2 py-2 md:gap-6 md:py-0">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-sm font-semibold tracking-tight text-foreground sm:gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary sm:h-9 sm:w-9">
            <GraduationCap className="h-4 w-4" />
          </span>
          <span className="truncate">FinUm</span>
          <span className="loading-wave hidden sm:flex" aria-hidden="true">
            <span className="loading-bar" />
            <span className="loading-bar" />
            <span className="loading-bar" />
            <span className="loading-bar" />
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map(([label, href]: any) => (
            <Link key={`${label}-${href}`} href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />

          <div className="hidden items-center gap-2 md:flex">
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

          <Button size="sm" className="md:hidden" asChild>
            <Link href={session?.user ? '/dashboard' : '/auth/login'}>{session?.user ? 'Кабинет' : 'Войти'}</Link>
          </Button>
        </div>
      </Container>

      <div className="border-t border-border/70 md:hidden">
        <Container className="w-full max-w-full overflow-x-auto py-2">
          <nav className="flex min-w-0 items-center gap-2">
            {links.map(([label, href]: any) => (
              <Link
                key={`mobile-${label}-${href}`}
                href={href}
                className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
    </header>
  );
}

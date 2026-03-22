import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { AuthForm } from '@/components/forms/auth-form';

export const metadata: Metadata = { title: 'Вход', description: 'Вход в личный кабинет FinSkills Pro' };
export default function LoginPage() { return <Container className="py-16"><AuthForm mode="login" /><p className="mt-4 text-center text-sm text-muted-foreground">Нет аккаунта? <Link href="/auth/register" className="text-primary">Зарегистрируйтесь</Link></p></Container>; }

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { AuthForm } from '@/components/forms/auth-form';

export const metadata: Metadata = { title: 'Регистрация', description: 'Создание аккаунта FinSkills Pro' };
export default function RegisterPage() { return <Container className="py-16"><AuthForm mode="register" /><p className="mt-4 text-center text-sm text-muted-foreground">Уже есть аккаунт? <Link href="/auth/login" className="text-primary">Войдите</Link></p></Container>; }

import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactForm } from '@/components/forms/contact-form';

export const metadata: Metadata = { title: 'Контакты', description: 'Форма обратной связи FinSkills Pro' };

export default function ContactPage() {
  return <Container className="py-12"><Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Контакты' }]} /><div className="grid gap-8 lg:grid-cols-2"><div><h1 className="text-4xl font-semibold">Связаться с нами</h1><p className="mt-4 text-muted-foreground">Оставьте заявку — ответим по запуску, материалам и презентации проекта.</p></div><Card><CardHeader><CardTitle>Форма обратной связи</CardTitle></CardHeader><CardContent><ContactForm /></CardContent></Card></div></Container>;
}

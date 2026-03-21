import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactForm } from '@/components/forms/contact-form';

const contacts = [
  { label: '@Spooky9999', href: 'https://t.me/Spooky9999' },
  { label: '@Lisa200708', href: 'https://t.me/Lisa200708' },
  { label: '@LLirik_if', href: 'https://t.me/LLirik_if' },
  { label: '@semen27778', href: 'https://t.me/semen27778' }
];

export const metadata: Metadata = { title: 'Контакты', description: 'Форма обратной связи FinSkills Pro' };

export default function ContactPage() {
  return (
    <Container className="py-10 sm:py-12">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Контакты' }]} />
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Связаться с нами</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Если вам нужен запуск платформы, демо-доступ или материалы о проекте, оставьте сообщение. Ответим без лишней формальности.
          </p>
          <div className="mt-6 rounded-2xl border border-border/80 bg-card p-5 text-sm">
            <p className="font-medium text-foreground">Telegram-контакты</p>
            <div className="mt-3 flex flex-wrap gap-3 text-muted-foreground">
              {contacts.map((contact) => (
                <a key={contact.href} href={contact.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">
                  {contact.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Форма обратной связи</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

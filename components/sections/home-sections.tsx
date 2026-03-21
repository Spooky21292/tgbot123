import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';

const benefits = [
  {
    title: 'Ясная структура',
    text: 'Каждый курс выстроен как спокойная траектория: от базовых понятий к практическим решениям.'
  },
  {
    title: 'Короткие форматы',
    text: 'Уроки легко пройти между учёбой, работой и повседневными делами без перегруза.'
  },
  {
    title: 'Практический фокус',
    text: 'После каждого блока остаётся понятное действие: проверить расходы, собрать резерв или закрепить привычку.'
  }
];

export function HomeSections({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel
}: {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <>
      <section className="py-20 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <Badge>Почему платформа работает</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Всё устроено так, чтобы обучение ощущалось спокойным и полезным.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {benefits.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <div className="rounded-2xl border border-border/80 bg-card px-6 py-10 text-center sm:px-10 sm:py-12">
            <Badge>Начать спокойно</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Выберите курс и сделайте первый шаг уже сегодня.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Без перегруза, без лишних обещаний, с ясной структурой и нормальным темпом обучения.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild>
                <Link href={primaryHref}>{primaryLabel}</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

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
      <section className="py-12 sm:py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <Badge className="text-xs sm:text-sm">Почему платформа работает</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Всё устроено так, чтобы обучение ощущалось спокойным и полезным.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3">
            {benefits.map((item: any) => (
              <Card key={item.title} className="max-w-full overflow-hidden">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16 md:py-24">
        <Container>
          <div className="rounded-2xl border border-border/80 bg-card px-4 py-8 text-center sm:px-8 sm:py-10 md:px-10 md:py-12">
            <Badge className="text-xs sm:text-sm">Начать спокойно</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Выберите курс и сделайте первый шаг уже сегодня.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Без перегруза, без лишних обещаний, с ясной структурой и нормальным темпом обучения.
            </p>
            <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
              <Button className="w-full sm:w-auto" asChild>
                <Link href={primaryHref}>{primaryLabel}</Link>
              </Button>
              <Button variant="secondary" className="w-full sm:w-auto" asChild>
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

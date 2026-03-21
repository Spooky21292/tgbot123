import Link from 'next/link';
import { ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { ageGroupLabel, courseLevelLabel } from '@/lib/utils';

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

export function HomeSections({ data }: { data: any }) {
  const featuredCourse = data.courses[0];

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

      {featuredCourse ? (
        <section className="border-y border-border/70 bg-card py-20 sm:py-24">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              <div>
                <Badge>Главный курс</Badge>
                <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Курс, с которого удобно начать и который задаёт правильный ритм обучения.
                </h2>
                <div className="mt-8 rounded-2xl border border-border/80 bg-background p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{ageGroupLabel(featuredCourse.ageGroup)}</Badge>
                    <Badge>{courseLevelLabel(featuredCourse.level)}</Badge>
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {featuredCourse.title}
                  </h3>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                    {featuredCourse.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <PlayCircle className="h-4 w-4" />
                    {featuredCourse.lessons.length} уроков с практикой, конспектом и тестами
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href={`/courses/${featuredCourse.slug}`}>
                        Открыть курс
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href="/courses">Весь каталог</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Что внутри</CardTitle>
                  <CardDescription>
                    Платформа остаётся сдержанной и полезной: только нужные форматы без лишнего визуального шума.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                  {[
                    'Возрастные траектории с понятной подачей и аккуратной сложностью.',
                    'Короткие уроки, которые легко включить в обычный график.',
                    'Тесты и практические шаги, чтобы знания превращались в привычки.'
                  ].map((item) => (
                    <div key={item} className="flex gap-3 border-t border-border/70 pt-4 first:border-t-0 first:pt-0">
                      <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                      <p>{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>
      ) : null}

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
                <Link href="/auth/register">Создать аккаунт</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/courses">Посмотреть каталог</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

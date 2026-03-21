import Link from 'next/link';
import { ArrowRight, Bot, CalendarDays, CheckCircle2, GraduationCap, PlayCircle, School2, ShieldCheck, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { ageGroupLabel, courseLevelLabel } from '@/lib/utils';

const platformComponents = [
  {
    title: 'Курсы с понятной траекторией',
    text: 'Каждый курс разбит на короткие, но содержательные уроки с примерами, заданиями и тестами.',
    Icon: School2
  },
  {
    title: 'Telegram-ассистент',
    text: 'Напоминает о занятиях, помогает закреплять привычки и подсказывает, на чём сосредоточиться дальше.',
    Icon: Bot
  },
  {
    title: 'Живые вебинары',
    text: 'Регулярные разборы со специалистами: семейный бюджет, инфляция, безопасные финансовые решения.',
    Icon: CalendarDays
  }
];

const trustMetrics = [
  ['92%', 'пользователей завершают первый урок в день регистрации'],
  ['12+', 'практических шаблонов и чек-листов в курсах'],
  ['3 формата', 'обучение через видео, квизы и живые встречи']
];

export function HomeSections({ data }: { data: any }) {
  const audiences = [
    ['12–17', 'Первые деньги, карманный бюджет, карты, безопасность, первые подработки.'],
    ['18–25', 'Зарплата, привычки, цели, финансовая самостоятельность и контроль расходов.'],
    ['26+', 'Сбережения, семейный бюджет, устойчивость к инфляции и взвешенные решения.']
  ];

  const benefits = [
    'Обучение без давления и агрессивных обещаний дохода',
    'Пошаговые решения для реальных жизненных ситуаций',
    'Контент, адаптированный под возраст и уровень подготовки',
    'Тесты и рекомендации после каждого важного этапа'
  ];

  const faq = [
    ['Сколько времени нужно на обучение?', 'Большинство уроков рассчитаны на 12–20 минут. Это удобно для школы, вуза, работы и семейного графика.'],
    ['Есть ли практические задания?', 'Да. Каждый урок включает микро-задачи, вопросы для самопроверки и действия, которые можно применить в тот же день.'],
    ['Подходит ли платформа тем, кто боится темы денег?', 'Да. Материал объясняется спокойным языком: от базовых привычек и бюджета до инфляции и основ инвестирования.']
  ];

  return (
    <>
      <section className="border-b py-8">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {trustMetrics.map(([value, text]) => (
              <Card key={value} className="rounded-[28px] border-slate-200/80 bg-white/80 backdrop-blur dark:bg-slate-900/60">
                <CardContent className="pt-6">
                  <p className="text-3xl font-semibold text-primary">{value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <Badge>Для кого платформа</Badge>
              <h2 className="mt-4 text-3xl font-semibold">Три траектории, один стандарт качества</h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {audiences.map(([title, text]) => (
              <Card key={title} className="rounded-[28px] border-slate-200/80">
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-20 dark:bg-slate-900/40">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <Badge>Почему это важно</Badge>
              <h2 className="mt-4 text-3xl font-semibold">Финансовая грамотность — это навык спокойной и сильной жизни.</h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Когда человек понимает, как работают деньги, он меньше действует на эмоциях, увереннее планирует будущее и реже допускает дорогостоящие ошибки.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((item) => (
                <Card key={item} className="rounded-[28px] border-slate-200/80">
                  <CardContent className="flex items-start gap-3 pt-6">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-accent" />
                    <p className="text-sm leading-6">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Badge>Как работает платформа</Badge>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {platformComponents.map(({ title, text, Icon }) => (
              <Card key={title} className="rounded-[28px] border-slate-200/80">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-20 dark:bg-slate-900/40">
        <Container>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Badge>Курсы</Badge>
              <h2 className="mt-4 text-3xl font-semibold">Курсы, которые ощущаются как продукт, а не как набор заметок</h2>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/courses">Смотреть каталог</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {data.courses.map((course: any) => (
              <Card key={course.id} className="rounded-[30px] border-slate-200/80">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <Badge>{ageGroupLabel(course.ageGroup)}</Badge>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{courseLevelLabel(course.level)}</span>
                  </div>
                  <CardTitle className="mt-4 text-2xl">{course.title}</CardTitle>
                  <CardDescription className="text-sm leading-6">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <PlayCircle className="h-4 w-4" />
                    {course.lessons.length} уроков
                  </div>
                  <Button asChild>
                    <Link href={`/courses/${course.slug}`}>Открыть курс</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-[32px] border-slate-200/80 bg-slate-950 text-white">
              <CardContent className="pt-8">
                <Badge className="bg-white/10 text-white">Флагманская программа</Badge>
                <h3 className="mt-5 text-3xl font-semibold">Большой курс для 12–17: деньги, бюджет, безопасность и первые решения</h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">Мы добавили насыщенную подростковую программу с длинными уроками, примерами из реальной жизни, заданиями, темой мошенничества, карт, первого дохода и безопасного знакомства с инвестированием.</p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2"><GraduationCap className="h-4 w-4" /> 10 уроков</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2"><ShieldCheck className="h-4 w-4" /> Мошенничество и безопасность</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2"><ArrowRight className="h-4 w-4" /> Практические задания</span>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-6">
              {data.botFeatures.map((feature: any) => (
                <Card key={feature.id} className="rounded-[28px] border-slate-200/80">
                  <CardHeader>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-slate-950 py-20 text-white">
        <Container>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <Badge className="bg-white/10 text-white">Отзывы</Badge>
              <h2 className="mt-4 text-3xl font-semibold">Что ценят пользователи и родители</h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              '«Наконец-то курс, где подростку объясняют деньги без скуки и страшных терминов.»',
              '«После двух недель сын сам предложил вести общий список целей и накоплений.»',
              '«Интерфейс выглядит как настоящий сервис, а не как школьный проект.»'
            ].map((quote, i) => (
              <Card key={i} className="rounded-[28px] border-white/10 bg-white/5 text-white">
                <CardContent className="pt-6">
                  <Star className="mb-4 h-5 w-5 text-yellow-400" />
                  <p className="leading-7 text-slate-200">{quote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <Badge>FAQ</Badge>
              <h2 className="mt-4 text-3xl font-semibold">Частые вопросы</h2>
            </div>
            <div className="space-y-4">
              {faq.map(([q, a]) => (
                <Card key={q} className="rounded-[28px] border-slate-200/80">
                  <CardHeader>
                    <CardTitle className="text-lg">{q}</CardTitle>
                    <CardDescription className="leading-6">{a}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

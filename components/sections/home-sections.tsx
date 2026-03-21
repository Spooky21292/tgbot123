import Link from 'next/link';
import { Bot, CalendarDays, CheckCircle2, PlayCircle, School2, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { ageGroupLabel } from '@/lib/utils';

const platformComponents = [
  { title: 'Курсы', text: 'Видео, конспекты, квизы и последовательное обучение.', Icon: School2 },
  { title: 'Telegram-бот-ассистент', text: 'Напоминания, краткие сводки и ответы на частые вопросы.', Icon: Bot },
  { title: 'Онлайн-уроки со специалистом', text: 'Живые вебинары и встречи со специалистами.', Icon: CalendarDays }
];

export function HomeSections({ data }: { data: any }) {
  const audiences = [
    ['Подростки', 'Первые шаги в деньгах, цели, карманный бюджет'],
    ['Молодые люди', 'Зарплата, расходы, накопления, первые налоговые вопросы'],
    ['Взрослые', 'Сбережения, семейный бюджет, устойчивость к инфляции']
  ];
  const benefits = ['Практические шаблоны и чеклисты', 'Тесты после каждого урока', 'Вебинары со специалистами', 'Русскоязычный интерфейс и понятная подача'];
  const faq = [
    ['Подойдёт ли платформа новичку?', 'Да, курсы начинаются с базовых понятий и ведут к практике постепенно.'],
    ['Есть ли обещания прибыли?', 'Нет, платформа обучает анализу, привычкам и грамотным решениям без обещаний дохода.'],
    ['Можно ли запустить локально?', 'Да, проект использует Next.js + Prisma + SQLite для локального MVP.']
  ];

  return (
    <>
      <section className="py-20"><Container><div className="grid gap-6 md:grid-cols-3">{audiences.map(([title, text]) => <Card key={title}><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{text}</CardDescription></CardHeader></Card>)}</div></Container></section>
      <section className="bg-slate-50 py-20 dark:bg-slate-900/40"><Container><div className="grid gap-8 lg:grid-cols-2"><div><Badge>Почему это важно</Badge><h2 className="mt-4 text-3xl font-semibold">Финансовая грамотность повышает качество жизни и уверенность в решениях.</h2><p className="mt-4 text-slate-600 dark:text-slate-300">Понимание бюджета, инфляции, налогов и накоплений помогает избегать импульсивных действий и строить устойчивые привычки.</p></div><div className="grid gap-4 sm:grid-cols-2">{benefits.map((item) => <Card key={item}><CardContent className="flex items-start gap-3 pt-6"><CheckCircle2 className="mt-1 h-5 w-5 text-accent" /><p>{item}</p></CardContent></Card>)}</div></div></Container></section>
      <section className="py-20"><Container><Badge>Как работает платформа</Badge><div className="mt-8 grid gap-6 md:grid-cols-3">{platformComponents.map(({ title, text, Icon }) => <Card key={title}><CardHeader><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary"><Icon className="h-6 w-6 text-primary"/></div><CardTitle>{title}</CardTitle><CardDescription>{text}</CardDescription></CardHeader></Card>)}</div></Container></section>
      <section className="bg-slate-50 py-20 dark:bg-slate-900/40"><Container><div className="flex items-center justify-between gap-4"><div><Badge>Курсы</Badge><h2 className="mt-4 text-3xl font-semibold">Подборка программ по возрасту и уровню</h2></div><Button variant="secondary" asChild><Link href="/courses">Все курсы</Link></Button></div><div className="mt-8 grid gap-6 lg:grid-cols-3">{data.courses.map((course: any) => <Card key={course.id}><CardHeader><Badge>{ageGroupLabel(course.ageGroup)}</Badge><CardTitle className="mt-4">{course.title}</CardTitle><CardDescription>{course.description}</CardDescription></CardHeader><CardContent><div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"><PlayCircle className="h-4 w-4"/>{course.lessons.length} уроков</div><Button asChild><Link href={`/courses/${course.slug}`}>Открыть курс</Link></Button></CardContent></Card>)}</div></Container></section>
      <section className="py-20"><Container><div className="grid gap-6 lg:grid-cols-3">{data.botFeatures.map((feature: any) => <Card key={feature.id}><CardHeader><CardTitle>{feature.title}</CardTitle><CardDescription>{feature.description}</CardDescription></CardHeader></Card>)}</div></Container></section>
      <section className="bg-slate-950 py-20 text-white"><Container><div className="grid gap-6 md:grid-cols-3">{['«После курса я впервые смогла вести бюджет без стресса»','«Подросткам понравился формат с тестами и короткими видео»','«Вебинары помогли разложить по полочкам тему инфляции»'].map((quote, i) => <Card key={i} className="border-white/10 bg-white/5 text-white"><CardContent className="pt-6"><Star className="mb-4 h-5 w-5 text-yellow-400"/><p>{quote}</p></CardContent></Card>)}</div></Container></section>
      <section className="py-20"><Container><div className="grid gap-8 lg:grid-cols-2"><div><Badge>FAQ</Badge><h2 className="mt-4 text-3xl font-semibold">Частые вопросы</h2></div><div className="space-y-4">{faq.map(([q,a]) => <Card key={q}><CardHeader><CardTitle className="text-lg">{q}</CardTitle><CardDescription>{a}</CardDescription></CardHeader></Card>)}</div></div></Container></section>
      <section className="pb-20"><Container><div className="rounded-[32px] bg-primary p-8 text-primary-foreground"><h2 className="text-3xl font-semibold">Готовы показать MVP проекта?</h2><p className="mt-3 max-w-2xl text-blue-100">FinSkills Pro можно локально запустить, наполнить своими материалами и использовать как презентационный продукт.</p><div className="mt-6 flex gap-4"><Button variant="secondary" asChild><Link href="/auth/register">Создать аккаунт</Link></Button><Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" asChild><Link href="/pricing">Посмотреть тарифы</Link></Button></div></div></Container></section>
    </>
  );
}

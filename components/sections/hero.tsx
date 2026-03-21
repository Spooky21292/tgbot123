import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';

const highlights = [
  {
    title: 'Персонализация',
    text: 'Контент адаптируется под возраст и жизненную ситуацию.',
    Icon: Sparkles
  },
  {
    title: 'Безопасный подход',
    text: 'Образовательные обзоры вместо сигналов “купить/продать”.',
    Icon: ShieldCheck
  }
];

export function HeroSection() {
  return (
    <section className="bg-hero-gradient py-24 text-white">
      <Container className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Badge className="bg-white/10 text-white">Для 12–17, 18–25 и 26+</Badge>
          <h1 className="mt-6 text-5xl font-semibold leading-tight sm:text-6xl">FinSkills Pro — современная онлайн-школа по деньгам, бюджету и осознанным решениям.</h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-200">Видео, тесты, вебинары и Telegram-ассистент помогают выстроить финансовые привычки без давления и нереалистичных обещаний.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild><Link href="/auth/register">Начать обучение <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button size="lg" variant="secondary" asChild><Link href="/courses">Посмотреть курсы</Link></Button>
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 backdrop-blur">
          <div className="grid gap-4">
            {highlights.map(({ title, text, Icon }) => (
              <div key={title} className="rounded-3xl bg-slate-950/40 p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><Icon className="h-5 w-5" /></div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-slate-200">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

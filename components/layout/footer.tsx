import Link from 'next/link';
import { Container } from './container';

export function Footer() {
  return (
    <footer className="border-t bg-slate-950 py-12 text-slate-200">
      <Container className="grid gap-8 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold">FinSkills Pro</h3>
          <p className="mt-3 text-sm text-slate-400">Образовательная платформа по финансовой грамотности без обещаний быстрой прибыли.</p>
        </div>
        <div>
          <h4 className="font-medium">Разделы</h4>
          <div className="mt-3 space-y-2 text-sm text-slate-400">
            <Link href="/courses" className="block hover:text-white">Курсы</Link>
            <Link href="/blog" className="block hover:text-white">Блог</Link>
            <Link href="/webinars" className="block hover:text-white">Вебинары</Link>
          </div>
        </div>
        <div>
          <h4 className="font-medium">Платформа</h4>
          <div className="mt-3 space-y-2 text-sm text-slate-400">
            <Link href="/bot" className="block hover:text-white">Telegram-бот</Link>
            <Link href="/pricing" className="block hover:text-white">Тарифы</Link>
            <Link href="/contact" className="block hover:text-white">Контакты</Link>
          </div>
        </div>
        <div>
          <h4 className="font-medium">Контакты</h4>
          <p className="mt-3 text-sm text-slate-400">hello@finskills.pro<br/>+7 (900) 123-45-67</p>
        </div>
      </Container>
    </footer>
  );
}

import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center"><h1 className="text-5xl font-semibold">404</h1><p className="mt-4 max-w-md text-muted-foreground">Страница не найдена. Возможно, ссылка устарела или материал был перемещён.</p><Button className="mt-6" asChild><Link href="/">Вернуться на главную</Link></Button></Container>;
}

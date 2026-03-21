import { getServerSession } from 'next-auth';
import { HeroSection } from '@/components/sections/hero';
import { HomeSections } from '@/components/sections/home-sections';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const primaryHref = session?.user ? (session.user.role === 'admin' ? '/admin' : '/dashboard') : '/auth/register';
  const primaryLabel = session?.user ? 'Продолжить обучение' : 'Начать обучение';
  const secondaryHref = '/courses';
  const secondaryLabel = session?.user ? 'Мои рекомендации' : 'Посмотреть курсы';

  return (
    <>
      <HeroSection primaryHref={primaryHref} primaryLabel={primaryLabel} secondaryHref={secondaryHref} secondaryLabel={secondaryLabel} />
      <HomeSections primaryHref={primaryHref} primaryLabel={session?.user ? 'Перейти в кабинет' : 'Создать аккаунт'} secondaryHref={secondaryHref} secondaryLabel={secondaryLabel} />
    </>
  );
}

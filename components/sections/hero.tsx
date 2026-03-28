import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';

const stats = [
  ['3 формата', 'уроки, тесты и вебинары'],
  ['12–20 минут', 'на один учебный блок'],
  ['1 спокойная система', 'без перегруза и шума']
];

export function HeroSection({
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
    <section className="overflow-x-clip border-b border-border/70 bg-background py-12 sm:py-16 md:py-24">
      <Container className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge className="max-w-full text-xs sm:text-sm">Финансовая грамотность для 14–17, 18–25 и 26+</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:mt-6 sm:text-4xl md:text-6xl">
            Спокойная и понятная платформа, чтобы навести порядок в деньгах и решениях.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
            FinUm помогает учиться без давления: короткие уроки, ясные объяснения, практические шаги и аккуратный ритм обучения.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 border-t border-border/70 pt-6 sm:mt-10 sm:pt-8 md:mt-12 sm:grid-cols-3">
          {stats.map(([value, text]: any) => (
            <div key={value} className="space-y-1">
              <p className="text-sm font-medium text-foreground">{value}</p>
              <p className="text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

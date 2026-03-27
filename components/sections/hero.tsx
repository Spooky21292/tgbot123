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
    <section className="border-b border-border/70 bg-background py-20 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          <Badge>Финансовая грамотность для 14–17, 18–25 и 26+</Badge>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Спокойная и понятная платформа, чтобы навести порядок в деньгах и решениях.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            FinSkills Pro помогает учиться без давления: короткие уроки, ясные объяснения, практические шаги и аккуратный ритм обучения.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-4 border-t border-border/70 pt-8 sm:grid-cols-3">
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

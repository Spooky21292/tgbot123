import { Container } from '@/components/layout/container';

export default function Loading() {
  return <Container className="py-20"><div className="grid gap-6 md:grid-cols-3">{Array.from({ length: 6 }).map((_: any, i: any) => <div key={i} className="h-40 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />)}</div></Container>;
}

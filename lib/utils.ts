import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function getQuizFeedback(score: number) {
  if (score >= 85) return 'Отлично';
  if (score >= 60) return 'Хорошо';
  return 'Нужно повторить';
}

export function ageGroupLabel(ageGroup: string) {
  return {
    teen: '12–17 лет',
    young: '18–30 лет',
    adult: '30–45 лет'
  }[ageGroup] ?? ageGroup;
}

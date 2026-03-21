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
    age_12_17: '12–17',
    age_18_25: '18–25',
    age_26_plus: '26+'
  }[ageGroup] ?? ageGroup;
}

export function courseLevelLabel(level: string) {
  return {
    beginner: 'Старт',
    intermediate: 'Практика',
    advanced: 'Продвинутый'
  }[level] ?? level;
}

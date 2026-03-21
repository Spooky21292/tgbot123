import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://finskills-pro.local'),
  title: {
    default: 'FinSkills Pro',
    template: '%s | FinSkills Pro'
  },
  description: 'Онлайн-платформа по финансовой грамотности: курсы, тесты, вебинары и Telegram-ассистент.',
  openGraph: {
    title: 'FinSkills Pro',
    description: 'Платформа по финансовой грамотности для пользователей 12–17, 18–25 и 26+.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-160px)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

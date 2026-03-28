import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://finum.local'),
  title: {
    default: 'FinUm',
    template: '%s | FinUm'
  },
  description: 'FinUm — современная платформа по финансовой грамотности, инвестиционной базе и личному финансовому планированию.',
  openGraph: {
    title: 'FinUm',
    description: 'FinUm помогает выстроить личную финансовую систему: бюджет, накопления, безопасность и долгосрочные цели.',
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

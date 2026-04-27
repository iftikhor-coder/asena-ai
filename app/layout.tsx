import type { Metadata } from 'next';
import { Syne, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '700', '800'],
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ASENA AI — Aqlli Yordamchi',
  description:
    'ASENA AI — Groq bilan ishlaydigann ko\'p tilli AI yordamchi. Har qanday tilda gapiring!',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'ASENA AI',
    description: 'Har qanday tilda gapira oladigan AI yordamchi',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`${syne.variable} ${jakarta.variable} font-jakarta antialiased`}>
        {children}
      </body>
    </html>
  );
}

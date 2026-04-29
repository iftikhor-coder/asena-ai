import type { Metadata } from 'next';
import { Oxanium, DM_Sans } from 'next/font/google';
import './globals.css';

const oxanium = Oxanium({
  subsets: ['latin'],
  variable: '--font-oxanium',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'ASENA AI',
  description: "Aqlli yordamchingiz. Har qanday tilda savol bering — men sizga yordam berishga tayyorman.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%238b5cf6'/><stop offset='100%25' stop-color='%2306b6d4'/></linearGradient></defs><rect width='24' height='24' rx='6' fill='url(%23g)'/><path d='M12 3L14.2 9.3H20.8L15.5 13.1L17.5 19.3L12 15.5L6.5 19.3L8.5 13.1L3.2 9.3H9.8L12 3Z' fill='white' opacity='0.95'/></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`${oxanium.variable} ${dmSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

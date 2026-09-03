import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/toast';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Пирокот — пиротехника для ярких праздников',
  description: 'Карточки пиротехнических товаров: фото, видео, характеристики, цена и наличие.',
  openGraph: {
    title: 'Пирокот',
    description: 'Праздник начинается здесь',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Пирокот',
    description: 'Праздник начинается здесь',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}

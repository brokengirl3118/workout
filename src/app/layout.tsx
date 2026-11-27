import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import ClickFlowerBurst from '@/components/ClickFlowerBurst';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'flower',
  description: 'FLOWER — Fitness, nutrition, and daily wellness.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.className} data-theme="dark">
      <body className="antialiased selection:bg-sky-500/30">
        <ClickFlowerBurst />
        {children}
      </body>
    </html>
  );
}
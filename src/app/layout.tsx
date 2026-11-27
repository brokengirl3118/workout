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
  title: 'FitLife 0–90 | Fitness & Health',
  description: 'Guided workouts and daily body care for ages 0 to 90.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.className}>
      <body className="bg-[#060609] text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        <ClickFlowerBurst />
        {children}
      </body>
    </html>
  );
}
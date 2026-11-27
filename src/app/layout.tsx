import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FitLife 0–90 | Wellness & Fitness Studio',
  description: 'Smooth, guided fitness, body maintenance, and wellness for ages 0 to 90.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.className}>
      <body className="antialiased selection:bg-sky-200 selection:text-sky-950">
        {children}
      </body>
    </html>
  );
}
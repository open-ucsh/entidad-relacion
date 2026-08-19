import type { Metadata } from 'next';
import { Ubuntu } from 'next/font/google';
import type { ReactNode } from 'react';

import { BRANDING } from '@/config/branding';

import './globals.css';

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-ubuntu',
  display: 'swap',
});

export const metadata: Metadata = {
  title: BRANDING.applicationName,
  description: 'Editor visual para crear y editar diagramas Entidad-Relación.',
  icons: {
    icon: BRANDING.favicon,
    shortcut: BRANDING.favicon,
    apple: BRANDING.favicon,
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={`${ubuntu.variable} h-full`}>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}

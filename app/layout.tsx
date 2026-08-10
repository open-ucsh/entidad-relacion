import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { BRANDING } from '@/config/branding';

import './globals.css';

export const metadata: Metadata = {
  title: BRANDING.applicationName,
  description: 'Editor visual para crear y editar diagramas Entidad-Relación.',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}

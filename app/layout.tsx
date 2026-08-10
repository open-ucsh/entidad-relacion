import type { Metadata } from 'next';

import { BRANDING } from '@/config/branding';

import './globals.css';

export const metadata: Metadata = {
  title: BRANDING.applicationName,
  description: 'Editor visual para crear y editar diagramas Entidad-Relación.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}

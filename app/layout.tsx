import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Entity Editor',
  description: 'Base project with Next.js, TypeScript and Tailwind CSS v4',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

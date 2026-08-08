import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'ER Designer',
  description: 'Visual editor for creating and editing Entity-Relationship diagrams.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}

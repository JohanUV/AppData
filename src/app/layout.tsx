import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DataPath',
  description: 'Aprende Data Engineering desde cero',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}

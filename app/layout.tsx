import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sprint Dashboard | The Life of Piet',
  description: 'Track your startup sprint progress',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

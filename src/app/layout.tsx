import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIPATUJU - PPDS FK UNHAS',
  description: 'Sistem Informasi Pelayanan Administrasi Tugas Akhir & Publikasi Jurnal PPDS FK Universitas Hasanuddin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#f8fafc] text-[#0f172a] antialiased">
        {children}
      </body>
    </html>
  );
}

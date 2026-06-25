import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BijakDana — Catat. Rencanakan. Bertumbuh.',
  description: 'Aplikasi keuangan personal untuk anak muda Indonesia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Auto redirect ke login jika belum login
              (function() {
                const path = window.location.pathname;
                if (path === '/login' || path === '/register') return;
                const session = localStorage.getItem('sb-ltspkcwnxredbszyxktd-auth-token');
                if (!session) {
                  window.location.href = '/login';
                }
              })();
            `
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
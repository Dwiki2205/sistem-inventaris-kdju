import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientProviders from '../components/ClientProviders'
import AppShellWrapper from '../components/AppShellWrapper'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Sistem Inventaris KDJU',
  description: 'Sistem manajemen inventaris untuk KDJU',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientProviders>
          <AppShellWrapper>
            {children}
          </AppShellWrapper>
        </ClientProviders>
      </body>
    </html>
  )
}
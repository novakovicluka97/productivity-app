import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ToastProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/components/QueryProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700', '800', '900'], variable: '--font-poppins' })

export const metadata: Metadata = {
  title: 'MaxMode',
  description: 'A full-featured productivity platform for managing sessions and breaks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

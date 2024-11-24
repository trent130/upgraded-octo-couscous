import './globals.css'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Your App Name',
  description: 'A secure authentication system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Navigation />
          <main className="container mx-auto mt-4">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}

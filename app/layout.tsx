import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import AppContent from './components/AppContent'
import ErrorBoundary from './components/ErrorBoundary'
import { ReduxProvider } from './store/ReduxProvider'
import ThemeRegistry from './ThemeRegistry'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Italiano - Italian Learning App',
  description: 'Learn Italian with interactive exercises',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ErrorBoundary>
          <ReduxProvider>
            <ThemeRegistry>
              <AppContent>{children}</AppContent>
            </ThemeRegistry>
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

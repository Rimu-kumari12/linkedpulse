import type { Metadata } from 'next'
import { DM_Mono, Syne } from 'next/font/google'
import './globals.css'

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
})

const syne = Syne({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'LinkedPulse — LinkedIn Automation Dashboard',
  description: 'Monitor LinkedIn posts, detect keywords, and auto-comment with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmMono.variable} ${syne.variable}`}>
      <body>{children}</body>
    </html>
  )
}

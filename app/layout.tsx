import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://futureoftelarus.com'

export const metadata: Metadata = {
  title: 'Telarus × Antimatter AI — ATOM Deployment Proposal',
  icons: { icon: '/icon.png', apple: '/icon.png' },
  description:
    'A comprehensive upgrade of IQA, Competitive Matrices, and Quote Intelligence through Antimatter AI\'s ATOM agentic platform. Transform Trusted Advisor discovery through agentic AI.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Telarus × Antimatter AI — ATOM Deployment Proposal',
    description:
      'Deploy agentic AI into IQA, Competitive Matrices, and Quote Intelligence. Real-time discovery, same-session recommendations, and AI-powered deal optimization.',
    siteName: 'Antimatter AI',
    url: SITE_URL,
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1280,
        height: 800,
        alt: 'Antimatter AI — Building Enterprise AI that Makes Sense',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Telarus × Antimatter AI — ATOM Deployment Proposal',
    description: 'Deploy agentic AI for IQA + Competitive Matrices + Quote Intelligence.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable} suppressHydrationWarning>
      <body className={font.className}>
        {children}
      </body>
    </html>
  )
}

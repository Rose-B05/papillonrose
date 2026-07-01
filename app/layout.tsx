import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/cart-context'
import { produits } from '@/data/produits'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
})

const nbRef = produits.length

export const metadata: Metadata = {
  title: {
    default: 'Papillon Rose — Location mobilier & décoration événements en Île-de-France',
    template: '%s | Papillon Rose',
  },
  description:
    `Location de mobilier et décoration pour mariages, réceptions et événements en Île-de-France. ${nbRef} références, devis sous 24h, livraison 94/93/95/77/91.`,
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#F8F5F0',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Papillon Rose',
  description: 'Location de mobilier et décoration pour événements en Île-de-France',
  url: 'https://papillon-rose.vercel.app',
  email: 'papillonrosebertha@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Créteil',
    addressRegion: 'Île-de-France',
    addressCountry: 'FR',
  },
  areaServed: ['94', '93', '95', '77', '91'],
  priceRange: '€€',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} bg-[#F8F5F0]`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <CartProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </CartProvider>
      </body>
    </html>
  )
}

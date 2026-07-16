import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/cart-context'
import { FavoritesProvider } from '@/components/favorites-context'
import { ThemeProvider } from '@/lib/theme-context'
import { getActiveProductsCount } from '@/data/produits'
import { getRobotsMeta } from '@/lib/site-mode'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
})

const nbRef = getActiveProductsCount()

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

export async function generateMetadata(): Promise<Metadata> {
  const robots = await getRobotsMeta()

  const ogImage = `${SITE_URL}/papillon-rose-logo.png`

  return {
    metadataBase: new URL(SITE_URL),
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
    openGraph: {
      title: 'Papillon Rose — Location mobilier & décoration événements en Île-de-France',
      description:
        `Location de mobilier et décoration pour mariages, réceptions et événements en Île-de-France. ${nbRef} références, devis sous 24h, livraison 94/93/95/77/91.`,
      url: SITE_URL,
      siteName: 'Papillon Rose',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Papillon Rose — Location mobilier & décoration événements',
          type: 'image/png',
        },
      ],
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Papillon Rose — Location mobilier & décoration événements en Île-de-France',
      description:
        `Location de mobilier et décoration pour mariages, réceptions et événements en Île-de-France. ${nbRef} références, devis sous 24h, livraison 94/93/95/77/91.`,
      images: [ogImage],
    },
    robots: {
      index: robots.index,
      follow: robots.follow,
      nocache: !robots.index,
      googleBot: {
        index: robots.index,
        follow: robots.follow,
      },
    },
  }
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
  url: SITE_URL,
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
      className={`${inter.variable} ${playfair.variable} bg-[#F8F5F0] dark:bg-neutral-900`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <GoogleAnalytics gaId="G-R10JKQ1YJ3" />
        <CartProvider>
          <FavoritesProvider>
            <ThemeProvider>
              <Header />
              {children}
              <Footer />
              {process.env.NODE_ENV === 'production' && <Analytics />}
            </ThemeProvider>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  )
}

# Papillon Rose — Export complet du projet

Site Next.js (App Router) de location de mobilier & décoration d'événements.

## Structure
```
.gitignore
PROJECT_EXPORT.md
app/globals.css
app/layout.tsx
app/page.tsx
components.json
components/papillon-rose-site.tsx
lib/utils.ts
next.config.mjs
package.json
pnpm-lock.yaml
postcss.config.mjs
public/apple-icon.png
public/icon-dark-32x32.png
public/icon-light-32x32.png
public/icon.svg
public/papillon-rose-logo.png
public/placeholder-logo.png
public/placeholder-logo.svg
public/placeholder-user.jpg
public/placeholder.jpg
public/placeholder.svg
public/products/prod001.png
public/products/prod002.png
public/products/prod003.png
public/products/prod004.png
public/products/prod005.png
public/products/prod006.png
public/products/prod007.png
public/products/prod008.png
public/products/prod009.png
public/products/prod010.png
public/products/prod011.png
public/products/prod012.png
public/products/prod013.png
public/products/prod014.png
public/products/prod015.png
public/products/prod016.png
tsconfig.json
```

> Note : les images du catalogue sont dans `public/products/` et le logo dans `public/papillon-rose-logo.png` (non inclus dans cet export texte, ce sont des fichiers binaires).

---

## `package.json`

```json
{
  "name": "my-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  },
  "dependencies": {
    "@base-ui/react": "^1.5.0",
    "@vercel/analytics": "1.6.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.16.0",
    "next": "16.2.6",
    "react": "^19",
    "react-dom": "^19",
    "shadcn": "^4.8.0",
    "tailwind-merge": "^3.3.1",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.2.0",
    "@types/node": "^24",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "pngjs": "^7.0.0",
    "postcss": "^8.5",
    "tailwindcss": "^4.2.0",
    "typescript": "5.7.3"
  },
  "pnpm": {
    "overrides": {
      "hono": "4.12.25"
    }
  }
}```

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "target": "ES6",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

## `next.config.mjs`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

## `postcss.config.mjs`

```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
```

## `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

## `lib/utils.ts`

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## `components/ui/button.tsx`

```tsx
import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        outline:
          'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-8',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

## `app/globals.css`

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-heading: var(--font-playfair), serif;
  --font-serif: var(--font-playfair), serif;
  --font-sans: var(--font-inter), 'Inter Fallback', sans-serif;
  --font-mono: var(--font-inter), sans-serif;
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-foreground: var(--foreground);
  --color-background: var(--background);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  color-scheme: light;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  color-scheme: dark;
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    color-scheme: dark;
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.205 0 0);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.205 0 0);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.922 0 0);
    --primary-foreground: oklch(0.205 0 0);
    --secondary: oklch(0.269 0 0);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.269 0 0);
    --muted-foreground: oklch(0.708 0 0);
    --accent: oklch(0.269 0 0);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.556 0 0);
    --chart-1: oklch(0.87 0 0);
    --chart-2: oklch(0.556 0 0);
    --chart-3: oklch(0.439 0 0);
    --chart-4: oklch(0.371 0 0);
    --chart-5: oklch(0.269 0 0);
    --sidebar: oklch(0.205 0 0);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.488 0.243 264.376);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.269 0 0);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.556 0 0);
  }
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

## `app/layout.tsx`

```tsx
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Papillon Rose — Location mobilier & décoration d\'événements',
  description:
    'Papillon Rose : location de mobilier et décoration pour mariages, réceptions et événements. Plus de 200 références, devis sous 24h.',
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
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
```

## `app/page.tsx`

```tsx
import PapillonRoseSite from "@/components/papillon-rose-site"

export default function Page() {
  return <PapillonRoseSite />
}
```

## `components/papillon-rose-site.tsx`

```tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  ShoppingBag,
  Heart,
  X,
  Plus,
  Minus,
  Menu,
  SlidersHorizontal,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const LOGO = "/papillon-rose-logo.png"

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "home" | "catalogue" | "favorites" | "contact"
interface Product {
  id: string
  nom: string
  categorie: string
  stock: number
  dimensions: string
  prix: number
  image: string
  description: string
  couleur: string
}
interface QuoteItem {
  product: Product
  qty: number
}
interface Slide {
  title: string
  em: string
  sub: string
  img: string
  cat?: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Tous",
  "Mobilier",
  "Figurines & Jeux",
  "Bougeoirs & Lanternes",
  "Verreries",
  "Cadres",
  "Présentoirs",
  "Urnes",
  "Art de la Table",
  "Vases",
  "Décoration",
  "Fleurs & Feuillages",
]

const SLIDES: Slide[] = [
  {
    title: "Catalogue de",
    em: "Location",
    sub: "MOBILIER & DÉCORATION D'ÉVÉNEMENT",
    img: "/products/prod005.png",
  },
  {
    title: "Mobilier",
    em: "d'Exception",
    sub: "CHEVALETS · CHAISES · ARCHES",
    img: "/products/prod001.png",
    cat: "Mobilier",
  },
  {
    title: "Décor &",
    em: "Atmosphère",
    sub: "BALLONS · TULLE · COMPOSITIONS",
    img: "/products/prod003.png",
    cat: "Décoration",
  },
]

const PRODUCTS: Product[] = [
  // ── Real catalogue photos ──
  {
    id: "mob-001",
    nom: "Chevalet Fer Forgé Noir",
    categorie: "Mobilier",
    stock: 1,
    dimensions: "175 × 54 cm",
    prix: 30,
    image: "/products/prod001.png",
    description:
      "Élégant chevalet en fer forgé noir mat aux volutes raffinées. Idéal pour présenter votre plan de table, menu ou tableau de bienvenue lors de vos événements les plus précieux.",
    couleur: "Noir",
  },
  {
    id: "mob-002",
    nom: "Arche Triangle Bois Naturel",
    categorie: "Mobilier",
    stock: 1,
    dimensions: "H 230 × 200 cm",
    prix: 40,
    image: "/products/prod005.png",
    description:
      "Arche triangulaire en bois brut aux allures bohèmes. Parfaite pour encadrer la cérémonie ou créer un fond de scène végétal unique pour vos photos.",
    couleur: "Bois naturel",
  },
  {
    id: "mob-004",
    nom: "Chaises Médaillon Blanches (paire)",
    categorie: "Mobilier",
    stock: 24,
    dimensions: "45 × 45 × H 95 cm",
    prix: 12,
    image: "/products/prod004.png",
    description:
      "Paire de chaises médaillon en bois patiné blanc, assise et dossier capitonnés en lin. Charme romantique et confort pour vos réceptions.",
    couleur: "Blanc",
  },
  {
    id: "dec-003",
    nom: "Arche Grillagée Blanche",
    categorie: "Décoration",
    stock: 2,
    dimensions: "200 × 200 cm",
    prix: 35,
    image: "/products/prod002.png",
    description:
      "Panneau grillagé sur pied en métal blanc. Support idéal pour fleurs, feuillages, photos ou plan de table suspendu.",
    couleur: "Blanc",
  },
  {
    id: "dec-004",
    nom: "Pompon Tulle Rose Poudré",
    categorie: "Décoration",
    stock: 30,
    dimensions: "Ø 30 cm",
    prix: 6,
    image: "/products/prod003.png",
    description:
      "Pompon en tulle rose poudré pour habiller chaises, arches ou dossiers de chaise haute. Touche tendre et féérique pour baby showers et baptêmes.",
    couleur: "Rose poudré",
  },
  {
    id: "dec-005",
    nom: "Masques Tiki Décoratifs (trio)",
    categorie: "Décoration",
    stock: 3,
    dimensions: "H 60 × 18 cm",
    prix: 28,
    image: "/products/prod006.png",
    description:
      "Trio de masques Tiki sculptés et peints à la main. Décor exotique parfait pour soirées tropicales, anniversaires à thème et fêtes polynésiennes.",
    couleur: "Multicolore",
  },
  {
    id: "fig-002",
    nom: "Figurines Animaux & Jungle",
    categorie: "Figurines & Jeux",
    stock: 1,
    dimensions: "Set de 14 pièces",
    prix: 22,
    image: "/products/prod007.png",
    description:
      "Collection de figurines d'animaux de la jungle et personnages emblématiques. Idéale pour scénographier une table d'anniversaire enfant sur le thème de la savane.",
    couleur: "Multicolore",
  },
  {
    id: "fig-003",
    nom: "Figurines Super-Héros",
    categorie: "Figurines & Jeux",
    stock: 4,
    dimensions: "Set de 4 · H 5 cm",
    prix: 10,
    image: "/products/prod008.png",
    description:
      "Lot de mini figurines super-héros métallisées. Parfait pour personnaliser un gâteau ou animer une fête d'enfants pleine d'énergie.",
    couleur: "Multicolore",
  },
  {
    id: "dec-006",
    nom: "Sculptures Africaines Bois",
    categorie: "Décoration",
    stock: 3,
    dimensions: "H 35 à 45 cm",
    prix: 25,
    image: "/products/prod009.png",
    description:
      "Trio de sculptures en bois d'ébène sculptées à la main. Pièces d'art ethniques pour une décoration élégante et dépaysante.",
    couleur: "Bois foncé",
  },
  {
    id: "dec-007",
    nom: "Oiseaux Tropicaux sur Pied (paire)",
    categorie: "Décoration",
    stock: 2,
    dimensions: "H 65 cm",
    prix: 18,
    image: "/products/prod010.png",
    description:
      "Duo d'oiseaux exotiques en métal peint à la main — un perroquet ara et un toucan — montés sur pieds. Décor coloré et dépaysant pour soirées tropicales et événements à thème.",
    couleur: "Multicolore",
  },
  {
    id: "bou-004",
    nom: "Bougeoir Pied Argenté",
    categorie: "Bougeoirs & Lanternes",
    stock: 6,
    dimensions: "H 28 × Ø 14 cm",
    prix: 9,
    image: "/products/prod011.png",
    description:
      "Bougeoir sur pied en métal argenté au galbe travaillé. Présente une bougie pilier avec élégance sur vos tables et buffets.",
    couleur: "Argenté",
  },
  {
    id: "mob-006",
    nom: "Pouf Velours Noir Pieds Dorés",
    categorie: "Mobilier",
    stock: 3,
    dimensions: "Ø 45 × H 35 cm",
    prix: 22,
    image: "/products/prod012.png",
    description:
      "Pouf rond en velours noir aux fines pieds dorés en épingle. Assise d'appoint chic ou sellette décorative pour vos espaces lounge.",
    couleur: "Noir & Or",
  },
  {
    id: "bou-005",
    nom: "Bougeoirs Feuille Laiton (paire)",
    categorie: "Bougeoirs & Lanternes",
    stock: 4,
    dimensions: "H 22 × 8 cm",
    prix: 11,
    image: "/products/prod013.png",
    description:
      "Paire de bougeoirs en laiton patiné en forme de feuille nervurée. Touche vintage et raffinée pour une décoration de table végétale.",
    couleur: "Laiton",
  },
  {
    id: "bou-006",
    nom: "Bougeoirs Piliers Dorés (trio)",
    categorie: "Bougeoirs & Lanternes",
    stock: 6,
    dimensions: "H 18 / 24 / 30 cm",
    prix: 16,
    image: "/products/prod014.png",
    description:
      "Trio de bougeoirs piliers en laiton doré de hauteurs graduées. Composez un centre de table lumineux et sophistiqué.",
    couleur: "Or",
  },
  {
    id: "pre-002",
    nom: "Plateau Miroir Doré",
    categorie: "Présentoirs",
    stock: 5,
    dimensions: "40 × 22 × H 8 cm",
    prix: 12,
    image: "/products/prod015.png",
    description:
      "Plateau rectangulaire à structure laiton doré et fond miroir. Idéal pour présenter parfums, bougies ou la verrerie du bar.",
    couleur: "Or & Miroir",
  },
  {
    id: "dec-008",
    nom: "Boîtes Géométriques Verre & Laiton (paire)",
    categorie: "Décoration",
    stock: 4,
    dimensions: "H 12 × 10 cm",
    prix: 14,
    image: "/products/prod016.png",
    description:
      "Paire de boîtes géométriques en verre et laiton doré. Parfaites comme porte-alliances, écrins à bijoux ou mini terrariums décoratifs.",
    couleur: "Or & Verre",
  },
  // ── Catalogue complémentaire ──
  {
    id: "mob-003",
    nom: "Table Ronde 180 cm",
    categorie: "Mobilier",
    stock: 5,
    dimensions: "Ø 180 × H 75 cm",
    prix: 80,
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop&auto=format",
    description:
      "Table ronde pouvant accueillir 10 à 12 convives. Idéale pour réceptions et mariages.",
    couleur: "Blanc",
  },
  {
    id: "mob-005",
    nom: "Canapé Velours Émeraude",
    categorie: "Mobilier",
    stock: 2,
    dimensions: "180 × 80 × H 85 cm",
    prix: 150,
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop&auto=format",
    description:
      "Canapé 2 places en velours vert émeraude aux pieds dorés. Espace lounge luxueux pour cocktails.",
    couleur: "Émeraude",
  },
  {
    id: "bou-001",
    nom: "Lanterne Marocaine Dorée",
    categorie: "Bougeoirs & Lanternes",
    stock: 8,
    dimensions: "H 45 × Ø 20 cm",
    prix: 12,
    image:
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop&auto=format",
    description:
      "Lanterne en métal ajouré doré de style oriental. Crée une ambiance lumineuse et envoûtante.",
    couleur: "Or",
  },
  {
    id: "bou-002",
    nom: "Bougeoir Cristal Haut",
    categorie: "Bougeoirs & Lanternes",
    stock: 12,
    dimensions: "H 30 × Ø 8 cm",
    prix: 8,
    image:
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=600&fit=crop&auto=format",
    description:
      "Chandelier en cristal soufflé d'une finesse rare. Mille reflets sur vos tables.",
    couleur: "Cristal",
  },
  {
    id: "bou-003",
    nom: "Photophore Doré",
    categorie: "Bougeoirs & Lanternes",
    stock: 30,
    dimensions: "H 10 × Ø 8 cm",
    prix: 5,
    image:
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=600&fit=crop&auto=format",
    description: "Photophore en verre texturé doré pour bougies chauffe-plat.",
    couleur: "Or",
  },
  {
    id: "ver-001",
    nom: "Vase Cylindrique Transparent",
    categorie: "Verreries",
    stock: 15,
    dimensions: "H 40 × Ø 15 cm",
    prix: 10,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&auto=format",
    description:
      "Vase cylindrique en verre soufflé. Polyvalent pour compositions florales ou bougies flottantes.",
    couleur: "Transparent",
  },
  {
    id: "ver-002",
    nom: "Carafe Vintage Biseautée",
    categorie: "Verreries",
    stock: 10,
    dimensions: "H 30 × Ø 12 cm",
    prix: 15,
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=600&fit=crop&auto=format",
    description:
      "Carafe en cristal biseauté de style vintage. Pour l'eau, limonades ou cocktails signature.",
    couleur: "Transparent",
  },
  {
    id: "cad-001",
    nom: "Cadre Doré Baroque",
    categorie: "Cadres",
    stock: 4,
    dimensions: "50 × 70 cm",
    prix: 20,
    image:
      "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=600&h=600&fit=crop&auto=format",
    description:
      "Cadre baroque en résine dorée. Idéal pour plans de table ou menus calligraphiés.",
    couleur: "Or",
  },
  {
    id: "cad-002",
    nom: "Tableau Ardoise Plan de Table",
    categorie: "Cadres",
    stock: 2,
    dimensions: "80 × 120 cm",
    prix: 35,
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=600&fit=crop&auto=format",
    description:
      "Grand tableau ardoise sur pied, inscriptions à la craie liquide.",
    couleur: "Noir",
  },
  {
    id: "pre-001",
    nom: "Présentoir Gâteau 3 Étages",
    categorie: "Présentoirs",
    stock: 3,
    dimensions: "H 60 cm · plateaux Ø 20/30/40 cm",
    prix: 45,
    image:
      "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&h=600&fit=crop&auto=format",
    description:
      "Présentoir à gâteau en métal blanc 3 étages avec plateaux miroir.",
    couleur: "Blanc & Or",
  },
  {
    id: "urn-001",
    nom: "Urne à Enveloppes Bois",
    categorie: "Urnes",
    stock: 3,
    dimensions: "H 30 × 20 × 20 cm",
    prix: 25,
    image:
      "https://images.unsplash.com/photo-1525678964484-56bac6d64a22?w=600&h=600&fit=crop&auto=format",
    description:
      "Urne en bois massif avec fente pour enveloppes. Sobre et élégante.",
    couleur: "Bois naturel",
  },
  {
    id: "art-001",
    nom: "Assiette Porcelaine Blanche",
    categorie: "Art de la Table",
    stock: 100,
    dimensions: "Ø 27 cm",
    prix: 3,
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop&auto=format",
    description:
      "Assiette plate en porcelaine blanche fine, bord légèrement guilloché.",
    couleur: "Blanc",
  },
  {
    id: "art-002",
    nom: "Chemin de Table Lin Naturel",
    categorie: "Art de la Table",
    stock: 20,
    dimensions: "30 × 300 cm",
    prix: 15,
    image:
      "https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?w=600&h=600&fit=crop&auto=format",
    description:
      "Chemin de table en lin lavé naturel, bords effilochés. Touche rustique et poétique.",
    couleur: "Beige",
  },
  {
    id: "vas-001",
    nom: "Vase Pampa Céramique Blanc",
    categorie: "Vases",
    stock: 6,
    dimensions: "H 45 × Ø 22 cm",
    prix: 20,
    image:
      "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&h=600&fit=crop&auto=format",
    description:
      "Grand vase en céramique blanche à l'émail mat. Pour pampa, branches ou fleurs séchées.",
    couleur: "Blanc",
  },
  {
    id: "vas-002",
    nom: "Vase Amphore Terracotta",
    categorie: "Vases",
    stock: 4,
    dimensions: "H 55 × Ø 30 cm",
    prix: 25,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=600&fit=crop&auto=format",
    description:
      "Vase amphore en terracotta naturelle. Idéal pour une décoration bohème ou méditerranéenne.",
    couleur: "Terracotta",
  },
  {
    id: "dec-001",
    nom: "Guirlande Lumineuse 10 m",
    categorie: "Décoration",
    stock: 15,
    dimensions: "10 m · 100 LED blanc chaud",
    prix: 20,
    image:
      "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=600&h=600&fit=crop&auto=format",
    description:
      "Guirlande 10 mètres avec 100 LED blanc chaud. Intérieur ou extérieur.",
    couleur: "Blanc chaud",
  },
  {
    id: "fle-001",
    nom: "Branche Eucalyptus Artificielle",
    categorie: "Fleurs & Feuillages",
    stock: 25,
    dimensions: "90 cm",
    prix: 15,
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=600&fit=crop&auto=format",
    description:
      "Branche d'eucalyptus artificielle haute fidélité. Pour compositions, arches ou centres de table.",
    couleur: "Vert argenté",
  },
  {
    id: "fle-002",
    nom: "Roses Artificielles Blanches ×12",
    categorie: "Fleurs & Feuillages",
    stock: 10,
    dimensions: "Tige 50 cm · Tête Ø 6 cm",
    prix: 18,
    image:
      "https://images.unsplash.com/photo-1490750967868-88df5691cc8e?w=600&h=600&fit=crop&auto=format",
    description:
      "Lot de 12 roses artificielles blanches premium. Réutilisables à l'infini.",
    couleur: "Blanc",
  },
  {
    id: "fig-001",
    nom: "Jenga Géant",
    categorie: "Figurines & Jeux",
    stock: 2,
    dimensions: "Empilé 50 cm · Max 150 cm",
    prix: 25,
    image:
      "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&h=600&fit=crop&auto=format",
    description:
      "Jenga géant en bois massif pour animer cocktails et réceptions.",
    couleur: "Bois naturel",
  },
]

const CATEGORY_IMAGES: Record<string, string> = {
  Mobilier: "/products/prod004.png",
  "Figurines & Jeux": "/products/prod007.png",
  "Bougeoirs & Lanternes": "/products/prod014.png",
  Verreries:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=375&fit=crop&auto=format",
  Cadres:
    "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=500&h=375&fit=crop&auto=format",
  Présentoirs: "/products/prod015.png",
  Urnes:
    "https://images.unsplash.com/photo-1525678964484-56bac6d64a22?w=500&h=375&fit=crop&auto=format",
  "Art de la Table":
    "https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?w=500&h=375&fit=crop&auto=format",
  Vases:
    "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&h=375&fit=crop&auto=format",
  Décoration: "/products/prod006.png",
  "Fleurs & Feuillages":
    "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=500&h=375&fit=crop&auto=format",
}

const DP = { fontFamily: "var(--font-playfair), serif" } as const
const GOLD = "#C8A97E"

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({
  product,
  isFav,
  onFav,
  onView,
  onAdd,
}: {
  product: Product
  isFav: boolean
  onFav: () => void
  onView: () => void
  onAdd: () => void
}) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
      <div
        className="relative m-2.5 overflow-hidden rounded-2xl bg-[#F8F5F0] cursor-pointer"
        style={{ aspectRatio: "1 / 1" }}
        onClick={onView}
      >
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.nom}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">
              Indisponible
            </span>
          </div>
        )}
        {product.stock <= 2 && product.stock > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-amber-400 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
            Dernière{product.stock > 1 ? "s" : ""}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFav()
          }}
          aria-label="Ajouter aux favoris"
          className={`absolute top-2.5 right-2.5 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center transition-colors ${
            isFav ? "text-[#C8A97E]" : "text-gray-300 hover:text-[#C8A97E]"
          }`}
        >
          <Heart size={13} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="px-3.5 pb-4 pt-0.5 flex flex-col flex-1">
        <p className="text-[10px] font-medium text-[#C8A97E] uppercase tracking-wider truncate">
          {product.categorie}
        </p>
        <h3
          style={DP}
          className="text-[13px] font-semibold text-[#2E2E2E] mt-0.5 leading-snug line-clamp-2 cursor-pointer hover:text-[#C8A97E] transition-colors"
          onClick={onView}
        >
          {product.nom}
        </h3>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
          {product.dimensions}
        </p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span style={DP} className="text-base font-bold text-[#2E2E2E]">
            {product.prix}{" "}
            <span className="text-sm font-normal text-gray-400">€</span>
          </span>
          <button
            onClick={onAdd}
            disabled={product.stock === 0}
            aria-label="Ajouter au devis"
            className="w-8 h-8 rounded-full bg-[#C8A97E] text-white flex items-center justify-center hover:bg-[#B8926E] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <Plus size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CategoryPills ─────────────────────────────────────────────────────────────
function CategoryPills({
  active,
  onChange,
}: {
  active: string
  onChange: (c: string) => void
}) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" } as React.CSSProperties}
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            active === cat
              ? "bg-[#C8A97E] text-white shadow-sm"
              : "bg-[#F0EBE3] text-[#2E2E2E]/60 hover:bg-[#C8A97E]/20 hover:text-[#C8A97E]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({
  onNav,
  onCatalogue,
}: {
  onNav: (p: Page) => void
  onCatalogue: (cat?: string) => void
}) {
  return (
    <footer className="bg-[#2E2E2E] text-white pt-14 pb-8 mt-16 rounded-t-[2.5rem]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        <div className="col-span-2 md:col-span-1">
          <p className="text-[#C8A97E] text-[10px] tracking-[0.35em] uppercase font-light">
            Location décoration
          </p>
          <p style={DP} className="text-white text-2xl font-semibold mt-1 mb-4">
            Papillon Rose
          </p>
          <p className="text-white/45 text-sm leading-relaxed">
            Location de mobilier et décoration pour événements, mariages et
            réceptions.
          </p>
        </div>
        <div>
          <p className="text-[#C8A97E] text-[10px] tracking-[0.3em] uppercase mb-5">
            Navigation
          </p>
          <ul className="space-y-3 text-sm text-white/55">
            {(["home", "catalogue", "favorites", "contact"] as Page[]).map(
              (p) => (
                <li key={p}>
                  <button
                    onClick={() => onNav(p)}
                    className="hover:text-[#C8A97E] transition-colors"
                  >
                    {p === "home"
                      ? "Accueil"
                      : p === "catalogue"
                        ? "Catalogue"
                        : p === "favorites"
                          ? "Favoris"
                          : "Contact"}
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
        <div>
          <p className="text-[#C8A97E] text-[10px] tracking-[0.3em] uppercase mb-5">
            Catégories
          </p>
          <ul className="space-y-3 text-sm text-white/55">
            {CATEGORIES.slice(1, 7).map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => onCatalogue(cat)}
                  className="hover:text-[#C8A97E] transition-colors"
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[#C8A97E] text-[10px] tracking-[0.3em] uppercase mb-5">
            Contact
          </p>
          <ul className="space-y-3.5 text-sm text-white/55">
            <li className="flex items-center gap-2.5">
              <Phone size={13} className="text-[#C8A97E]" />
              06 12 34 56 78
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={13} className="text-[#C8A97E]" />
              contact@papillonrose.fr
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={13} className="text-[#C8A97E] mt-0.5" />
              <span>
                Île-de-France
                <br />
                Livraison nationale
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-6 border-t border-white/10">
        <p className="text-white/25 text-xs text-center">
          © 2025 Papillon Rose — Location décoration événements · Tous droits
          réservés
        </p>
      </div>
    </footer>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function PapillonRoseSite() {
  const [page, setPage] = useState<Page>("home")
  const [category, setCategory] = useState("Tous")
  const [search, setSearch] = useState("")
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const [quote, setQuote] = useState<QuoteItem[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showQuote, setShowQuote] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [priceMax, setPriceMax] = useState(200)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const filtered = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (category === "Tous" || p.categorie === category) &&
          (!search ||
            p.nom.toLowerCase().includes(search.toLowerCase()) ||
            p.categorie.toLowerCase().includes(search.toLowerCase())) &&
          p.prix <= priceMax &&
          (!inStockOnly || p.stock > 0),
      ),
    [category, search, priceMax, inStockOnly],
  )

  const addToQuote = (p: Product) => {
    setQuote((prev) => {
      const ex = prev.find((i) => i.product.id === p.id)
      return ex
        ? prev.map((i) =>
            i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i,
          )
        : [...prev, { product: p, qty: 1 }]
    })
    setShowQuote(true)
  }

  const updateQty = (id: string, delta: number) => {
    setQuote((prev) =>
      prev
        .map((i) =>
          i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i,
        )
        .filter((i) => i.qty > 0),
    )
  }

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const quoteTotal = quote.reduce((s, i) => s + i.product.prix * i.qty, 0)
  const quoteCount = quote.reduce((s, i) => s + i.qty, 0)
  const navTo = (p: Page) => {
    setPage(p)
    setShowMenu(false)
    window.scrollTo(0, 0)
  }
  const goToCatalogue = (cat?: string) => {
    setPage("catalogue")
    if (cat) setCategory(cat)
    window.scrollTo(0, 0)
  }
  const resetFilters = () => {
    setSearch("")
    setCategory("Tous")
    setPriceMax(200)
    setInStockOnly(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans text-[#2E2E2E]">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between h-16">
          <button onClick={() => navTo("home")} aria-label="Accueil Papillon Rose">
            <img
              src={LOGO || "/placeholder.svg"}
              alt="Papillon Rose"
              className="h-10 w-auto"
            />
          </button>

          <div className="hidden md:flex items-center gap-8">
            {(["home", "catalogue", "favorites", "contact"] as Page[]).map(
              (p) => (
                <button
                  key={p}
                  onClick={() =>
                    p === "catalogue" ? goToCatalogue() : navTo(p)
                  }
                  className={`text-sm transition-colors ${
                    page === p
                      ? "text-[#C8A97E] font-medium"
                      : "text-[#2E2E2E]/55 hover:text-[#C8A97E]"
                  }`}
                >
                  {p === "home"
                    ? "Accueil"
                    : p === "catalogue"
                      ? "Catalogue"
                      : p === "favorites"
                        ? "Favoris"
                        : "Contact"}
                </button>
              ),
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navTo("favorites")}
              aria-label="Favoris"
              className="relative p-2 hover:text-[#C8A97E] transition-colors"
            >
              <Heart
                size={19}
                fill={favorites.size > 0 ? GOLD : "none"}
                className={
                  favorites.size > 0 ? "text-[#C8A97E]" : "text-[#2E2E2E]/60"
                }
              />
              {favorites.size > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C8A97E] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {favorites.size}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowQuote(true)}
              className="relative flex items-center gap-2 bg-[#2E2E2E] text-white px-4 py-2 rounded-full text-sm hover:bg-[#C8A97E] transition-colors"
            >
              <ShoppingBag size={15} />
              <span className="hidden md:inline font-medium">Devis</span>
              {quoteCount > 0 && (
                <span className="w-5 h-5 bg-[#C8A97E] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {quoteCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowMenu(true)}
              aria-label="Menu"
              className="md:hidden p-2 text-[#2E2E2E]/70"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {showMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-white rounded-l-3xl shadow-2xl p-8 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-10">
              <img
                src={LOGO || "/placeholder.svg"}
                alt="Papillon Rose"
                className="h-9 w-auto"
              />
              <button
                onClick={() => setShowMenu(false)}
                aria-label="Fermer le menu"
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-5">
              {(["home", "catalogue", "favorites", "contact"] as Page[]).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() =>
                      p === "catalogue" ? goToCatalogue() : navTo(p)
                    }
                    className="text-left text-[#2E2E2E]/70 hover:text-[#C8A97E] transition-colors text-lg"
                    style={DP}
                  >
                    {p === "home"
                      ? "Accueil"
                      : p === "catalogue"
                        ? "Catalogue"
                        : p === "favorites"
                          ? "Favoris"
                          : "Contact"}
                  </button>
                ),
              )}
            </div>
            <div className="mt-auto text-sm text-[#2E2E2E]/35 space-y-1">
              <p>contact@papillonrose.fr</p>
              <p>06 12 34 56 78</p>
            </div>
          </div>
        </div>
      )}

      <div className="pt-16">
        {/* ─── HOME ─── */}
        {page === "home" && (
          <div>
            {/* Hero Carousel */}
            <section
              className="relative mx-3 md:mx-6 mt-4 overflow-hidden rounded-3xl"
              style={{ minHeight: "78vh" }}
            >
              {SLIDES.map((s, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    i === slide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={s.img || "/placeholder.svg"}
                    alt={s.em}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              ))}

              <div
                className="relative z-10 h-full flex flex-col justify-end pb-14 px-8 md:px-14"
                style={{ minHeight: "78vh" }}
              >
                <p className="text-[#C8A97E] text-xs tracking-[0.5em] uppercase mb-3 font-medium">
                  {SLIDES[slide].sub}
                </p>
                <h1
                  style={DP}
                  className="text-white text-5xl md:text-7xl font-semibold leading-[1.1] mb-6"
                >
                  {SLIDES[slide].title}
                  <br />
                  <em className="font-normal italic">{SLIDES[slide].em}</em>
                </h1>
                <button
                  onClick={() => goToCatalogue(SLIDES[slide].cat)}
                  className="w-fit flex items-center gap-2.5 bg-white text-[#2E2E2E] px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-[#C8A97E] hover:text-white transition-colors shadow-lg"
                >
                  Voir la sélection <ArrowRight size={15} />
                </button>
              </div>

              <button
                onClick={() =>
                  setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length)
                }
                aria-label="Slide précédente"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setSlide((s) => (s + 1) % SLIDES.length)}
                aria-label="Slide suivante"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
              >
                <ChevronRight size={18} />
              </button>

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    aria-label={`Aller à la slide ${i + 1}`}
                    className={`rounded-full transition-all ${
                      i === slide
                        ? "w-6 h-2 bg-white"
                        : "w-2 h-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </section>

            {/* Stats strip */}
            <section className="max-w-3xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { val: "+200", label: "références" },
                { val: "11", label: "catégories" },
                { val: "Stock", label: "mis à jour" },
                { val: "Devis", label: "en 24h" },
              ].map((s) => (
                <div key={s.val} className="text-center">
                  <p style={DP} className="text-2xl font-bold text-[#C8A97E]">
                    {s.val}
                  </p>
                  <p className="text-xs text-[#2E2E2E]/45 uppercase tracking-wider mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </section>

            {/* Featured products */}
            <section className="max-w-7xl mx-auto px-5 md:px-10">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                    Sélection du moment
                  </p>
                  <h2
                    style={DP}
                    className="text-2xl md:text-3xl font-semibold text-[#2E2E2E]"
                  >
                    Articles en vedette
                  </h2>
                </div>
                <button
                  onClick={() => goToCatalogue()}
                  className="hidden md:flex items-center gap-1.5 text-sm text-[#C8A97E] font-medium hover:gap-2.5 transition-all"
                >
                  Tout voir <ArrowRight size={14} />
                </button>
              </div>

              <div className="mb-6">
                <CategoryPills active={category} onChange={setCategory} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {PRODUCTS.filter(
                  (p) => category === "Tous" || p.categorie === category,
                )
                  .slice(0, 10)
                  .map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isFav={favorites.has(p.id)}
                      onFav={() => toggleFav(p.id)}
                      onView={() => setModalProduct(p)}
                      onAdd={() => addToQuote(p)}
                    />
                  ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => goToCatalogue()}
                  className="inline-flex items-center gap-2 bg-[#2E2E2E] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#C8A97E] transition-colors"
                >
                  Voir tout le catalogue <ArrowRight size={15} />
                </button>
              </div>
            </section>

            {/* Category showcase */}
            <section className="max-w-7xl mx-auto px-5 md:px-10 mt-16">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                    Explorer par thème
                  </p>
                  <h2
                    style={DP}
                    className="text-2xl md:text-3xl font-semibold text-[#2E2E2E]"
                  >
                    Nos Catégories
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {CATEGORIES.slice(1).map((cat) => {
                  const count = PRODUCTS.filter(
                    (p) => p.categorie === cat,
                  ).length
                  return (
                    <button
                      key={cat}
                      onClick={() => goToCatalogue(cat)}
                      className="group relative overflow-hidden rounded-3xl bg-[#EDE8DF]"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <img
                        src={CATEGORY_IMAGES[cat] || "/placeholder.svg"}
                        alt={cat}
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2E2E2E]/80 via-[#2E2E2E]/10 to-transparent rounded-3xl" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                        <p
                          style={DP}
                          className="text-white text-sm font-semibold leading-tight"
                        >
                          {cat}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[#C8A97E] text-[11px]">
                            {count} article{count > 1 ? "s" : ""}
                          </span>
                          <ArrowRight
                            size={11}
                            className="text-[#C8A97E] group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-5 md:px-10 mt-16">
              <div className="relative overflow-hidden rounded-3xl bg-[#2E2E2E] px-10 py-16 text-center">
                <div className="absolute inset-0">
                  <img
                    src="/products/prod005.png"
                    alt=""
                    aria-hidden
                    className="w-full h-full object-cover opacity-15 rounded-3xl"
                  />
                </div>
                <div className="relative z-10 max-w-xl mx-auto">
                  <p className="text-[#C8A97E] text-[10px] tracking-[0.5em] uppercase mb-4 font-medium">
                    Votre événement, notre passion
                  </p>
                  <h2
                    style={DP}
                    className="text-3xl md:text-4xl text-white font-semibold mb-5 leading-snug"
                  >
                    Un projet en tête&nbsp;?
                  </h2>
                  <p className="text-white/55 text-base mb-8 leading-relaxed">
                    Constituez votre sélection et envoyez-nous votre demande de
                    devis.
                    <br />
                    Réponse sous 24h.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => goToCatalogue()}
                      className="bg-[#C8A97E] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#B8926E] transition-colors"
                    >
                      Parcourir le catalogue
                    </button>
                    <button
                      onClick={() => navTo("contact")}
                      className="border border-white/30 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors"
                    >
                      Nous contacter
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <Footer onNav={navTo} onCatalogue={goToCatalogue} />
          </div>
        )}

        {/* ─── CATALOGUE ─── */}
        {page === "catalogue" && (
          <div className="max-w-7xl mx-auto px-5 md:px-10 py-8">
            <div className="mb-7">
              <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                Explorer
              </p>
              <h1
                style={DP}
                className="text-3xl md:text-4xl font-semibold text-[#2E2E2E]"
              >
                Catalogue de Location
              </h1>
            </div>

            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Rechercher un article…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl text-sm outline-none border border-black/[0.07] focus:border-[#C8A97E]/50 transition-colors placeholder:text-gray-400 shadow-sm"
                />
              </div>
              <label className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl text-sm cursor-pointer border border-black/[0.07] shadow-sm hover:border-[#C8A97E]/40 transition-colors select-none whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-[#C8A97E] w-3.5 h-3.5"
                />
                <SlidersHorizontal size={14} className="text-[#C8A97E]" />
                En stock
              </label>
            </div>

            <div className="flex items-center gap-4 mb-5 bg-white rounded-2xl px-5 py-3.5 border border-black/[0.07] shadow-sm">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Prix max
              </span>
              <input
                type="range"
                min={0}
                max={200}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="flex-1 accent-[#C8A97E] h-1"
              />
              <span
                style={DP}
                className="text-[#C8A97E] font-bold text-base w-16 text-right"
              >
                {priceMax} €
              </span>
            </div>

            <div className="mb-7">
              <CategoryPills active={category} onChange={setCategory} />
            </div>

            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-400">
                <span className="text-[#2E2E2E] font-semibold">
                  {filtered.length}
                </span>{" "}
                résultat{filtered.length > 1 ? "s" : ""}
                {category !== "Tous" && (
                  <span>
                    {" "}
                    — <span className="text-[#C8A97E]">{category}</span>
                  </span>
                )}
              </p>
              {(search ||
                category !== "Tous" ||
                priceMax < 200 ||
                inStockOnly) && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-gray-400 hover:text-[#C8A97E] transition-colors underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isFav={favorites.has(p.id)}
                    onFav={() => toggleFav(p.id)}
                    onView={() => setModalProduct(p)}
                    onAdd={() => addToQuote(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-gray-400 text-base mb-5">
                  Aucun produit ne correspond à votre sélection.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-[#C8A97E] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#B8926E] transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            <Footer onNav={navTo} onCatalogue={goToCatalogue} />
          </div>
        )}

        {/* ─── FAVORITES ─── */}
        {page === "favorites" && (
          <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 min-h-[60vh]">
            <div className="mb-8">
              <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                Mes préférences
              </p>
              <h1
                style={DP}
                className="text-3xl md:text-4xl font-semibold text-[#2E2E2E]"
              >
                Favoris
              </h1>
            </div>
            {favorites.size === 0 ? (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Heart size={32} className="text-[#C8A97E]/40" />
                </div>
                <p className="text-gray-400 text-base mb-6">
                  Vous n&apos;avez pas encore de favoris.
                </p>
                <button
                  onClick={() => goToCatalogue()}
                  className="bg-[#C8A97E] text-white px-10 py-3.5 rounded-full text-sm font-medium hover:bg-[#B8926E] transition-colors"
                >
                  Parcourir le catalogue
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {PRODUCTS.filter((p) => favorites.has(p.id)).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isFav
                    onFav={() => toggleFav(p.id)}
                    onView={() => setModalProduct(p)}
                    onAdd={() => addToQuote(p)}
                  />
                ))}
              </div>
            )}
            <Footer onNav={navTo} onCatalogue={goToCatalogue} />
          </div>
        )}

        {/* ─── CONTACT ─── */}
        {page === "contact" && (
          <div>
            <div className="max-w-4xl mx-auto px-5 md:px-10 py-12">
              <div className="text-center mb-14">
                <p className="text-[#C8A97E] text-[10px] tracking-[0.5em] uppercase font-medium mb-3">
                  Parlons de votre projet
                </p>
                <h1
                  style={DP}
                  className="text-4xl md:text-5xl font-semibold text-[#2E2E2E]"
                >
                  Contactez-nous
                </h1>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <div className="space-y-7">
                    {[
                      {
                        Icon: Phone,
                        label: "Téléphone",
                        val: "06 12 34 56 78",
                      },
                      {
                        Icon: Mail,
                        label: "Email",
                        val: "contact@papillonrose.fr",
                      },
                      {
                        Icon: MapPin,
                        label: "Zone",
                        val: "Île-de-France\nLivraison nationale",
                      },
                    ].map(({ Icon, label, val }) => (
                      <div key={label} className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-[#C8A97E]/12 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Icon size={17} className="text-[#C8A97E]" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
                            {label}
                          </p>
                          <p className="font-medium text-sm whitespace-pre-line text-[#2E2E2E]">
                            {val}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 p-6 bg-[#2E2E2E] rounded-3xl text-white">
                    <p style={DP} className="text-lg font-semibold mb-3">
                      Horaires
                    </p>
                    <div className="space-y-2 text-sm text-white/60">
                      <div className="flex justify-between">
                        <span>Lundi – Vendredi</span>
                        <span className="text-white/90">9h – 18h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Samedi</span>
                        <span className="text-white/90">10h – 16h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dimanche</span>
                        <span className="text-white/35">Fermé</span>
                      </div>
                    </div>
                  </div>
                </div>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  {[
                    {
                      label: "Nom complet",
                      type: "text",
                      placeholder: "Marie Dupont",
                    },
                    {
                      label: "Adresse email",
                      type: "email",
                      placeholder: "marie@exemple.fr",
                    },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#C8A97E]/60 transition-colors shadow-sm"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                      Date de l&apos;événement
                    </label>
                    <input
                      type="date"
                      className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#C8A97E]/60 transition-colors shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                      Votre message
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Décrivez votre projet, nombre d'invités, lieu…"
                      className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#C8A97E]/60 transition-colors resize-none shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#C8A97E] text-white py-4 rounded-2xl text-sm font-semibold hover:bg-[#B8926E] transition-colors shadow-md"
                  >
                    Envoyer ma demande
                  </button>
                </form>
              </div>
            </div>
            <Footer onNav={navTo} onCatalogue={goToCatalogue} />
          </div>
        )}
      </div>

      {/* ── Product Modal ── */}
      {modalProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setModalProduct(null)}
        >
          <div
            className="bg-white w-full md:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl rounded-t-3xl md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2">
              <div
                className="relative bg-[#F8F5F0] rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden"
                style={{ aspectRatio: "1 / 1" }}
              >
                <img
                  src={modalProduct.image || "/placeholder.svg"}
                  alt={modalProduct.nom}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setModalProduct(null)}
                  aria-label="Fermer"
                  className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-7 flex flex-col">
                <span className="text-[#C8A97E] text-[10px] tracking-[0.35em] uppercase font-medium mb-2">
                  {modalProduct.categorie}
                </span>
                <h2
                  style={DP}
                  className="text-2xl font-semibold text-[#2E2E2E] mb-3 leading-snug"
                >
                  {modalProduct.nom}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  {modalProduct.description}
                </p>

                <div className="space-y-2.5 bg-[#F8F5F0] rounded-2xl p-4 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 text-[11px] uppercase tracking-wider">
                      Dimensions
                    </span>
                    <span className="font-medium text-[#2E2E2E] text-right max-w-[55%] text-sm">
                      {modalProduct.dimensions}
                    </span>
                  </div>
                  {modalProduct.couleur && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 text-[11px] uppercase tracking-wider">
                        Couleur
                      </span>
                      <span className="font-medium text-[#2E2E2E]">
                        {modalProduct.couleur}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 text-[11px] uppercase tracking-wider">
                      Stock
                    </span>
                    <span
                      className={`font-semibold ${
                        modalProduct.stock === 0
                          ? "text-red-400"
                          : modalProduct.stock <= 2
                            ? "text-amber-500"
                            : "text-green-500"
                      }`}
                    >
                      {modalProduct.stock === 0
                        ? "Indisponible"
                        : `${modalProduct.stock} disponible${
                            modalProduct.stock > 1 ? "s" : ""
                          }`}
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  <p
                    style={DP}
                    className="text-3xl font-bold text-[#2E2E2E] mb-5"
                  >
                    {modalProduct.prix} €
                    <span className="text-sm font-normal text-gray-400 ml-1">
                      / unité
                    </span>
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        addToQuote(modalProduct)
                        setModalProduct(null)
                      }}
                      disabled={modalProduct.stock === 0}
                      className="flex-1 bg-[#2E2E2E] text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#C8A97E] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Ajouter au devis
                    </button>
                    <button
                      onClick={() => toggleFav(modalProduct.id)}
                      aria-label="Ajouter aux favoris"
                      className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-colors ${
                        favorites.has(modalProduct.id)
                          ? "border-[#C8A97E] bg-[#C8A97E]/10 text-[#C8A97E]"
                          : "border-gray-200 hover:border-[#C8A97E] hover:text-[#C8A97E]"
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={
                          favorites.has(modalProduct.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quote sidebar ── */}
      {showQuote && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
          onClick={() => setShowQuote(false)}
        >
          <div
            className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl rounded-l-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.07]">
              <div>
                <h3
                  style={DP}
                  className="text-xl font-semibold text-[#2E2E2E]"
                >
                  Demande de devis
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {quoteCount} article{quoteCount > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setShowQuote(false)}
                aria-label="Fermer"
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {quote.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag size={24} className="text-[#C8A97E]/50" />
                </div>
                <p className="text-gray-400 mb-5 text-sm">
                  Votre sélection est vide.
                </p>
                <button
                  onClick={() => {
                    setShowQuote(false)
                    goToCatalogue()
                  }}
                  className="bg-[#C8A97E] text-white px-7 py-2.5 rounded-full text-sm font-medium hover:bg-[#B8926E] transition-colors"
                >
                  Parcourir le catalogue
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                  {quote.map(({ product: p, qty }) => (
                    <div
                      key={p.id}
                      className="flex gap-3.5 items-start bg-[#F8F5F0] rounded-2xl p-3"
                    >
                      <img
                        src={p.image || "/placeholder.svg"}
                        alt={p.nom}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-[#2E2E2E] leading-tight line-clamp-2">
                          {p.nom}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {p.prix} € / u.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(p.id, -1)}
                            aria-label="Diminuer"
                            className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-[#C8A97E] hover:text-white transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQty(p.id, 1)}
                            aria-label="Augmenter"
                            className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-[#C8A97E] hover:text-white transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-sm text-[#2E2E2E]">
                          {p.prix * qty} €
                        </p>
                        <button
                          onClick={() => updateQty(p.id, -qty)}
                          aria-label="Supprimer"
                          className="text-gray-300 hover:text-red-400 transition-colors mt-1.5"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-black/[0.07] px-5 py-5">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider">
                      Total estimé
                    </span>
                    <span
                      style={DP}
                      className="text-2xl font-bold text-[#2E2E2E]"
                    >
                      {quoteTotal} €
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowQuote(false)
                      navTo("contact")
                    }}
                    className="w-full bg-[#C8A97E] text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#B8926E] transition-colors mb-2.5"
                  >
                    Envoyer ma demande
                  </button>
                  <button
                    onClick={() => {
                      setShowQuote(false)
                      goToCatalogue()
                    }}
                    className="w-full bg-[#F0EBE3] text-[#2E2E2E]/70 py-3 rounded-2xl text-sm font-medium hover:bg-[#E8E0D5] transition-colors"
                  >
                    Continuer mes choix
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```


export const SITE = {
  name: 'Borel Computer',
  tagline: "L'excellence technologique pour gamers et professionnels",
  description:
    'Boutique informatique haut de gamme : PC gaming, composants, périphériques et configurations sur mesure.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
} as const

// Devise par défaut de la boutique
export const CURRENCY = 'USD'
export const CURRENCY_LOCALE = 'en-US'

export const TAX_RATE = 0.2 // taxes appliquées au sous-total
export const FREE_SHIPPING_THRESHOLD = 100
export const STANDARD_SHIPPING = 9.9
export const EXPRESS_SHIPPING_SURCHARGE = 15

export const CATEGORIES = [
  {
    slug: 'ordinateurs',
    label: 'Ordinateurs',
    subcategories: ['Desktop Gaming', 'Laptops', 'Pré-configurés', 'Workstation'],
  },
  {
    slug: 'composants',
    label: 'Composants',
    subcategories: ['CPU', 'GPU', 'RAM', 'Stockage', 'Alimentation', 'Refroidissement'],
  },
  {
    slug: 'peripheriques',
    label: 'Périphériques',
    subcategories: ['Claviers', 'Souris', 'Écrans', 'Casques', 'Accessoires'],
  },
  { slug: 'logiciels', label: 'Logiciels', subcategories: ['OS', 'Sécurité', 'Création'] },
  { slug: 'refurbished', label: 'Refurbished', subcategories: ['Stock limité'] },
] as const

export const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/products', label: 'Catalogue' },
  { href: '/configurator', label: 'Configurateur' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'À propos' },
] as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

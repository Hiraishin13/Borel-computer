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

// Configurateur PC — frais d'assemblage, test et garantie
export const ASSEMBLY_SKU = 'SVC-ASSEMBLAGE'
export const ASSEMBLY_FEE = 99

// Usages des PC pré-configurés
export const PC_USAGES = [
  { slug: 'gaming', label: 'Gaming' },
  { slug: 'semi-gaming', label: 'Semi-Gaming' },
  { slug: 'multimedia', label: 'Multimédia' },
  { slug: 'creation', label: 'Création / Studio' },
  { slug: 'bureautique', label: 'Bureautique' },
] as const

export type PcUsage = (typeof PC_USAGES)[number]['slug']

export function usageLabel(slug: string): string {
  return PC_USAGES.find((u) => u.slug === slug)?.label ?? slug
}

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
  { href: '/configurations', label: 'Nos PC' },
  { href: '/configurator', label: 'Configurateur' },
  { href: '/blog', label: 'Blog' },
] as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

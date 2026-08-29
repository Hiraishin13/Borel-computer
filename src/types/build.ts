export interface BuildPart {
  slot: string
  productId: string
  color?: string
  name: string
  brand?: string
  slug: string
  image: string
  price: number
  stock: number
}

export interface Build {
  id: string
  name: string
  slug: string
  usage: string
  description: string
  heroImage?: string
  parts: BuildPart[]
  markupPct: number
  componentsTotal: number
  assemblyFee: number
  price: number
  published: boolean
  featured: boolean
  inStock: boolean
  createdAt: string
}

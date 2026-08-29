/**
 * Seed the database with an admin user, an assembly service, demo products
 * and a full PC-component catalogue for the configurator.
 * Run with: npm run seed  (loads .env.local)
 */
import { config } from 'dotenv'
import bcrypt from 'bcryptjs'

config({ path: '.env.local' })

import { connectDB } from '../src/lib/mongodb'
import { User } from '../src/models/User'
import { Product } from '../src/models/Product'
import { Build } from '../src/models/Build'
import { Promo } from '../src/models/Promo'
import { slugify } from '../src/lib/utils'
import { ASSEMBLY_SKU, ASSEMBLY_FEE } from '../src/lib/constants'

const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=80`

const IMG: Record<string, string[]> = {
  CPU: [U('1555617981-dac3880eac6e'), U('1591799264318-7e6ef8ddb7ea'), U('1518770660439-4636190af475')],
  'Carte mère': [U('1518770660439-4636190af475'), U('1562976540-1502c2145186'), U('1591488320449-011701bb6704')],
  GPU: [U('1591488320449-011701bb6704'), U('1587202372616-b43abea06c2a'), U('1600348759986-f5f8f0f9f56b')],
  RAM: [U('1541029071515-84cc54f84dc5'), U('1587202372616-b43abea06c2a')],
  Stockage: [U('1597872200969-2b65d56bd16b'), U('1618410320928-25228d811631')],
  Refroidissement: [U('1587202372775-e229f172b9d7'), U('1624705002806-5d72df19c3ad')],
  Alimentation: [U('1587202372634-32705e3bf49c'), U('1587202372775-e229f172b9d7')],
  'Boîtier': [U('1624705002806-5d72df19c3ad'), U('1600348759986-f5f8f0f9f56b'), U('1587202372775-e229f172b9d7')],
  default: [U('1587202372775-e229f172b9d7')],
}

type Seed = {
  sku: string
  name: string
  brand: string
  subcategory: string
  price: number
  discountPrice?: number
  stock?: number
  rating?: number
  reviews?: number
  featured?: boolean
  specifications: Record<string, string>
  colors?: string[]
}

const components: Seed[] = [
  // --- CPU ---
  { sku: 'CPU-R5-7600X', name: 'AMD Ryzen 5 7600X', brand: 'AMD', subcategory: 'CPU', price: 249, stock: 30, rating: 4.6, reviews: 51, specifications: { Socket: 'AM5', 'Cœurs': '6 / 12 threads', 'Fréquence boost': '5.3 GHz', TDP: '105 W' } },
  { sku: 'CPU-R7-7800X3D', name: 'AMD Ryzen 7 7800X3D', brand: 'AMD', subcategory: 'CPU', price: 419, stock: 22, rating: 4.9, reviews: 140, featured: true, specifications: { Socket: 'AM5', 'Cœurs': '8 / 16 threads', 'Fréquence boost': '5.0 GHz', 'Cache 3D': '96 Mo', TDP: '120 W' } },
  { sku: 'CPU-R9-7900X', name: 'AMD Ryzen 9 7900X', brand: 'AMD', subcategory: 'CPU', price: 479, stock: 14, rating: 4.7, reviews: 63, specifications: { Socket: 'AM5', 'Cœurs': '12 / 24 threads', 'Fréquence boost': '5.6 GHz', TDP: '170 W' } },
  { sku: 'CPU-I5-14600K', name: 'Intel Core i5-14600K', brand: 'Intel', subcategory: 'CPU', price: 319, stock: 26, rating: 4.6, reviews: 44, specifications: { Socket: 'LGA1700', 'Cœurs': '14 (6P+8E)', 'Fréquence boost': '5.3 GHz', TDP: '125 W' } },
  { sku: 'CPU-I7-14700K', name: 'Intel Core i7-14700K', brand: 'Intel', subcategory: 'CPU', price: 429, stock: 19, rating: 4.7, reviews: 72, featured: true, specifications: { Socket: 'LGA1700', 'Cœurs': '20 (8P+12E)', 'Fréquence boost': '5.6 GHz', TDP: '125 W' } },
  { sku: 'CPU-I9-14900K', name: 'Intel Core i9-14900K', brand: 'Intel', subcategory: 'CPU', price: 589, stock: 9, rating: 4.6, reviews: 38, specifications: { Socket: 'LGA1700', 'Cœurs': '24 (8P+16E)', 'Fréquence boost': '6.0 GHz', TDP: '125 W' } },

  // --- Carte mère ---
  { sku: 'MB-MSI-B650P', name: 'MSI PRO B650-P WIFI', brand: 'MSI', subcategory: 'Carte mère', price: 199, stock: 18, rating: 4.5, reviews: 29, specifications: { Socket: 'AM5', Chipset: 'B650', 'Mémoire': 'DDR5 (4 slots)', Format: 'ATX', 'Wi-Fi': 'Wi-Fi 6E' } },
  { sku: 'MB-ASUS-B650EF', name: 'ASUS ROG STRIX B650E-F GAMING', brand: 'ASUS', subcategory: 'Carte mère', price: 289, stock: 12, rating: 4.7, reviews: 41, specifications: { Socket: 'AM5', Chipset: 'B650E', 'Mémoire': 'DDR5 (4 slots)', Format: 'ATX', 'PCIe': '5.0' } },
  { sku: 'MB-GB-B760E', name: 'Gigabyte B760 AORUS ELITE AX', brand: 'Gigabyte', subcategory: 'Carte mère', price: 189, stock: 20, rating: 4.5, reviews: 33, specifications: { Socket: 'LGA1700', Chipset: 'B760', 'Mémoire': 'DDR5 (4 slots)', Format: 'ATX', 'Wi-Fi': 'Wi-Fi 6E' } },
  { sku: 'MB-ASUS-Z790A', name: 'ASUS ROG STRIX Z790-A GAMING', brand: 'ASUS', subcategory: 'Carte mère', price: 329, stock: 10, rating: 4.8, reviews: 27, specifications: { Socket: 'LGA1700', Chipset: 'Z790', 'Mémoire': 'DDR5 (4 slots)', Format: 'ATX', 'PCIe': '5.0' } },

  // --- GPU ---
  { sku: 'GPU-RTX4060TI', name: 'NVIDIA GeForce RTX 4060 Ti', brand: 'NVIDIA', subcategory: 'GPU', price: 449, stock: 24, rating: 4.3, reviews: 88, specifications: { 'Mémoire': '8 Go GDDR6', TDP: '165 W', Interface: 'PCIe 4.0', Sorties: '3× DP 1.4a, 1× HDMI 2.1' } },
  { sku: 'GPU-RTX4070S', name: 'NVIDIA GeForce RTX 4070 SUPER', brand: 'NVIDIA', subcategory: 'GPU', price: 659, discountPrice: 619, stock: 16, rating: 4.8, reviews: 132, featured: true, specifications: { 'Mémoire': '12 Go GDDR6X', TDP: '220 W', Interface: 'PCIe 4.0' } },
  { sku: 'GPU-RTX4080S', name: 'NVIDIA GeForce RTX 4080 SUPER', brand: 'NVIDIA', subcategory: 'GPU', price: 1109, stock: 7, rating: 4.9, reviews: 54, specifications: { 'Mémoire': '16 Go GDDR6X', TDP: '320 W', Interface: 'PCIe 4.0' } },
  { sku: 'GPU-RX7800XT', name: 'AMD Radeon RX 7800 XT', brand: 'AMD', subcategory: 'GPU', price: 529, stock: 15, rating: 4.6, reviews: 76, specifications: { 'Mémoire': '16 Go GDDR6', TDP: '263 W', Interface: 'PCIe 4.0' } },
  { sku: 'GPU-RX7900XTX', name: 'AMD Radeon RX 7900 XTX', brand: 'AMD', subcategory: 'GPU', price: 999, stock: 6, rating: 4.7, reviews: 49, specifications: { 'Mémoire': '24 Go GDDR6', TDP: '355 W', Interface: 'PCIe 4.0' } },

  // --- RAM ---
  { sku: 'RAM-COR-16-6000', name: 'Corsair Vengeance 16 Go (2×8) DDR5 6000', brand: 'Corsair', subcategory: 'RAM', price: 69, stock: 40, rating: 4.6, reviews: 61, specifications: { Type: 'DDR5', 'Capacité': '16 Go (2×8)', Vitesse: '6000 MT/s', Latence: 'CL36' }, colors: ['Noir', 'Blanc'] },
  { sku: 'RAM-COR-32-6000', name: 'Corsair Vengeance 32 Go (2×16) DDR5 6000', brand: 'Corsair', subcategory: 'RAM', price: 129, stock: 34, rating: 4.7, reviews: 90, featured: true, specifications: { Type: 'DDR5', 'Capacité': '32 Go (2×16)', Vitesse: '6000 MT/s', Latence: 'CL30' }, colors: ['Noir', 'Blanc'] },
  { sku: 'RAM-GSK-32-6400', name: 'G.Skill Trident Z5 RGB 32 Go DDR5 6400', brand: 'G.Skill', subcategory: 'RAM', price: 149, stock: 21, rating: 4.8, reviews: 47, specifications: { Type: 'DDR5', 'Capacité': '32 Go (2×16)', Vitesse: '6400 MT/s', Latence: 'CL32' }, colors: ['Noir', 'Blanc', 'Argent'] },
  { sku: 'RAM-KIN-64-5600', name: 'Kingston Fury Beast 64 Go DDR5 5600', brand: 'Kingston', subcategory: 'RAM', price: 239, stock: 12, rating: 4.6, reviews: 22, specifications: { Type: 'DDR5', 'Capacité': '64 Go (2×32)', Vitesse: '5600 MT/s', Latence: 'CL40' }, colors: ['Noir'] },

  // --- Stockage ---
  { sku: 'SSD-SAM-990-1T', name: 'Samsung 990 PRO 1 To', brand: 'Samsung', subcategory: 'Stockage', price: 99, stock: 45, rating: 4.8, reviews: 210, specifications: { Type: 'NVMe', 'Capacité': '1 To', Interface: 'PCIe 4.0', Lecture: '7450 Mo/s' } },
  { sku: 'SSD-SAM-990-2T', name: 'Samsung 990 PRO 2 To', brand: 'Samsung', subcategory: 'Stockage', price: 169, stock: 30, rating: 4.8, reviews: 168, featured: true, specifications: { Type: 'NVMe', 'Capacité': '2 To', Interface: 'PCIe 4.0', Lecture: '7450 Mo/s' } },
  { sku: 'SSD-WD-SN850X-1T', name: 'WD Black SN850X 1 To', brand: 'Western Digital', subcategory: 'Stockage', price: 89, stock: 38, rating: 4.7, reviews: 143, specifications: { Type: 'NVMe', 'Capacité': '1 To', Interface: 'PCIe 4.0', Lecture: '7300 Mo/s' } },
  { sku: 'SSD-CRU-T700-2T', name: 'Crucial T700 2 To', brand: 'Crucial', subcategory: 'Stockage', price: 209, stock: 11, rating: 4.6, reviews: 39, specifications: { Type: 'NVMe', 'Capacité': '2 To', Interface: 'PCIe 5.0', Lecture: '12400 Mo/s' } },

  // --- Refroidissement ---
  { sku: 'COOL-BQ-DRP5', name: 'be quiet! Dark Rock Pro 5', brand: 'be quiet!', subcategory: 'Refroidissement', price: 99, stock: 17, rating: 4.7, reviews: 34, specifications: { Type: 'Air', Ventilateurs: '2× 135 mm', 'Dissipation max': '270 W' }, colors: ['Noir'] },
  { sku: 'COOL-COR-H100I', name: 'Corsair iCUE H100i RGB ELITE', brand: 'Corsair', subcategory: 'Refroidissement', price: 129, stock: 20, rating: 4.6, reviews: 58, specifications: { Type: 'AIO', Radiateur: '240 mm', Ventilateurs: '2× 120 mm' }, colors: ['Noir', 'Blanc'] },
  { sku: 'COOL-ARC-LF3-360', name: 'Arctic Liquid Freezer III 360', brand: 'Arctic', subcategory: 'Refroidissement', price: 89, stock: 25, rating: 4.9, reviews: 71, featured: true, specifications: { Type: 'AIO', Radiateur: '360 mm', Ventilateurs: '3× 120 mm' }, colors: ['Noir', 'Blanc'] },
  { sku: 'COOL-NOC-NHD15', name: 'Noctua NH-D15', brand: 'Noctua', subcategory: 'Refroidissement', price: 119, stock: 14, rating: 4.8, reviews: 96, specifications: { Type: 'Air', Ventilateurs: '2× 140 mm', 'Dissipation max': '250 W' }, colors: ['Marron / Beige'] },

  // --- Alimentation ---
  { sku: 'PSU-COR-RM750E', name: 'Corsair RM750e', brand: 'Corsair', subcategory: 'Alimentation', price: 99, stock: 28, rating: 4.6, reviews: 52, specifications: { Puissance: '750 W', Certification: '80+ Gold', 'Modularité': 'Full', ATX: '3.0' } },
  { sku: 'PSU-COR-RM850X', name: 'Corsair RM850x', brand: 'Corsair', subcategory: 'Alimentation', price: 139, stock: 22, rating: 4.8, reviews: 88, featured: true, specifications: { Puissance: '850 W', Certification: '80+ Gold', 'Modularité': 'Full', ATX: '3.1' } },
  { sku: 'PSU-BQ-SP12-1000', name: 'be quiet! Straight Power 12 1000 W', brand: 'be quiet!', subcategory: 'Alimentation', price: 199, stock: 10, rating: 4.8, reviews: 31, specifications: { Puissance: '1000 W', Certification: '80+ Platinum', 'Modularité': 'Full', ATX: '3.1' } },
  { sku: 'PSU-SEA-TX1300', name: 'Seasonic PRIME TX-1300', brand: 'Seasonic', subcategory: 'Alimentation', price: 329, stock: 5, rating: 4.9, reviews: 18, specifications: { Puissance: '1300 W', Certification: '80+ Titanium', 'Modularité': 'Full', ATX: '3.0' } },

  // --- Boîtier ---
  { sku: 'CASE-NZXT-H5F', name: 'NZXT H5 Flow', brand: 'NZXT', subcategory: 'Boîtier', price: 94, stock: 26, rating: 4.5, reviews: 64, specifications: { Format: 'ATX', Type: 'Moyen tour', 'Ventilateurs inclus': '2', 'GPU max': '365 mm' }, colors: ['Noir', 'Blanc'] },
  { sku: 'CASE-LL-O11EVO', name: 'Lian Li O11 Dynamic EVO', brand: 'Lian Li', subcategory: 'Boîtier', price: 169, stock: 15, rating: 4.8, reviews: 92, featured: true, specifications: { Format: 'E-ATX', Type: 'Moyen tour', 'Verre trempé': 'Double', 'GPU max': '423 mm' }, colors: ['Noir', 'Blanc'] },
  { sku: 'CASE-FD-NORTH', name: 'Fractal Design North', brand: 'Fractal Design', subcategory: 'Boîtier', price: 139, stock: 18, rating: 4.7, reviews: 77, specifications: { Format: 'ATX', Type: 'Moyen tour', Façade: 'Noyer / chêne', 'GPU max': '355 mm' }, colors: ['Charbon / Chêne', 'Blanc / Chêne'] },
  { sku: 'CASE-COR-4000D', name: 'Corsair 4000D Airflow', brand: 'Corsair', subcategory: 'Boîtier', price: 104, stock: 30, rating: 4.7, reviews: 156, specifications: { Format: 'ATX', Type: 'Moyen tour', 'Ventilateurs inclus': '2', 'GPU max': '360 mm' }, colors: ['Noir', 'Blanc'] },
]

const catalogExtras: Seed[] = [
  {
    sku: 'PC-BOREL-STRIKE',
    name: 'Borel Strike — RTX 4070 Super',
    brand: 'Borel Computer',
    subcategory: 'Desktop Gaming',
    price: 1899,
    discountPrice: 1749,
    stock: 7,
    rating: 4.8,
    reviews: 15,
    featured: true,
    specifications: { CPU: 'Ryzen 7 7800X3D', GPU: 'RTX 4070 Super', RAM: '32 Go DDR5', Stockage: '2 To NVMe' },
  },
  {
    sku: 'KB-MECH-TKL',
    name: 'Clavier mécanique TKL RGB',
    brand: 'Borel Computer',
    subcategory: 'Claviers',
    price: 129,
    stock: 40,
    rating: 4.5,
    reviews: 63,
    specifications: { Format: 'TKL', Switches: 'Linéaire', Connectique: 'USB-C' },
    colors: ['Noir', 'Blanc'],
  },
]

async function upsert(s: Seed, category: string) {
  const slug = slugify(`${s.brand} ${s.name}`.trim())
  const imgs = IMG[s.subcategory] ?? IMG.default
  await Product.updateOne(
    { sku: s.sku },
    {
      $set: {
        sku: s.sku,
        name: s.name,
        brand: s.brand,
        slug,
        description:
          `${s.name} — ` +
          Object.entries(s.specifications)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ') +
          '.',
        category,
        subcategory: s.subcategory,
        price: s.price,
        ...(s.discountPrice ? { discountPrice: s.discountPrice } : {}),
        cost: Math.round(s.price * (s.subcategory === 'GPU' ? 0.86 : 0.7) * 100) / 100,
        currency: 'USD',
        published: true,
        stock: s.stock ?? 20,
        rating: s.rating ?? 0,
        reviews: s.reviews ?? 0,
        featured: Boolean(s.featured),
        specifications: s.specifications,
        variants: s.colors ? [{ name: 'Couleur', options: s.colors }] : [],
        warranty: '2 ans',
        thumbnail: imgs[0],
        images: imgs,
        tags: [
          s.brand.toLowerCase(),
          s.subcategory.toLowerCase(),
          ...(s.subcategory === 'Stockage' ? ['ssd', 'disque'] : []),
          ...(s.subcategory === 'GPU' ? ['carte graphique', 'gpu'] : []),
          ...(s.subcategory === 'CPU' ? ['processeur'] : []),
          ...(/AIO/i.test(JSON.stringify(s.specifications)) ? ['watercooling', 'aio'] : []),
          ...(/Air/i.test(String(s.specifications.Type)) ? ['ventirad', 'air'] : []),
        ],
      },
    },
    { upsert: true },
  )
}

async function main() {
  await connectDB()

  const adminEmail = 'admin@borelcomputer.com'
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      email: adminEmail,
      password: await bcrypt.hash('admin1234', 12),
      firstName: 'Admin',
      lastName: 'Borel',
      role: 'admin',
    })
    console.log('✓ Admin créé :', adminEmail, '/ admin1234')
  }

  // Service d'assemblage (référencé par le configurateur, passe au checkout).
  await Product.updateOne(
    { sku: ASSEMBLY_SKU },
    {
      $set: {
        sku: ASSEMBLY_SKU,
        name: 'Assemblage, câblage & test 48h',
        brand: 'Borel Computer',
        slug: 'assemblage-cablage-test',
        description:
          'Montage professionnel de votre configuration, gestion des câbles, mise à jour BIOS, stress-test 48h et garantie atelier.',
        category: 'services',
        subcategory: 'Service',
        price: ASSEMBLY_FEE,
        cost: 35,
        currency: 'USD',
        published: true,
        stock: 9999,
        featured: false,
        specifications: { 'Délai': '3 à 5 jours ouvrés', Garantie: 'Atelier 2 ans' },
        variants: [],
        warranty: '2 ans',
        thumbnail: IMG.default[0],
        images: IMG.default,
        tags: ['service'],
      },
    },
    { upsert: true },
  )

  for (const s of components) await upsert(s, 'composants')
  for (const s of catalogExtras) {
    await upsert(s, s.subcategory === 'Claviers' ? 'peripheriques' : 'ordinateurs')
  }

  // --- PC pré-configurés (builds) ---
  const bySku = new Map<string, string>()
  for (const p of await Product.find({}, { sku: 1 }).lean()) bySku.set(p.sku, String(p._id))
  const part = (slot: string, sku: string, color?: string) => ({
    slot,
    productId: bySku.get(sku),
    ...(color ? { color } : {}),
  })

  const builds = [
    {
      name: 'Borel Arena — RTX 4070 Super',
      usage: 'gaming',
      description: 'Gaming 1440p haute fréquence, silencieux et évolutif.',
      markupPct: 8,
      published: true,
      featured: true,
      heroImage: IMG.GPU[0],
      parts: [
        part('CPU', 'CPU-R7-7800X3D'),
        part('Carte mère', 'MB-MSI-B650P'),
        part('GPU', 'GPU-RTX4070S'),
        part('RAM', 'RAM-COR-32-6000', 'Noir'),
        part('Stockage', 'SSD-SAM-990-2T'),
        part('Refroidissement', 'COOL-ARC-LF3-360', 'Noir'),
        part('Alimentation', 'PSU-COR-RM850X'),
        part('Boîtier', 'CASE-COR-4000D', 'Noir'),
      ],
    },
    {
      name: 'Borel Titan — RTX 4080 Super',
      usage: 'gaming',
      description: 'Le haut du panier pour le jeu 4K et la création lourde.',
      markupPct: 7,
      published: true,
      heroImage: IMG.GPU[0],
      parts: [
        part('CPU', 'CPU-I9-14900K'),
        part('Carte mère', 'MB-ASUS-Z790A'),
        part('GPU', 'GPU-RTX4080S'),
        part('RAM', 'RAM-GSK-32-6400', 'Blanc'),
        part('Stockage', 'SSD-CRU-T700-2T'),
        part('Refroidissement', 'COOL-COR-H100I', 'Blanc'),
        part('Alimentation', 'PSU-BQ-SP12-1000'),
        part('Boîtier', 'CASE-LL-O11EVO', 'Blanc'),
      ],
    },
    {
      name: 'Borel Studio — Création',
      usage: 'creation',
      description: 'Montage vidéo, 3D et rendu : beaucoup de cœurs et de RAM.',
      markupPct: 6,
      published: true,
      heroImage: IMG.CPU[0],
      parts: [
        part('CPU', 'CPU-R9-7900X'),
        part('Carte mère', 'MB-ASUS-B650EF'),
        part('GPU', 'GPU-RX7800XT'),
        part('RAM', 'RAM-KIN-64-5600', 'Noir'),
        part('Stockage', 'SSD-SAM-990-2T'),
        part('Refroidissement', 'COOL-NOC-NHD15', 'Marron / Beige'),
        part('Alimentation', 'PSU-COR-RM850X'),
        part('Boîtier', 'CASE-FD-NORTH', 'Charbon / Chêne'),
      ],
    },
    {
      name: 'Borel Play — Semi-Gaming',
      usage: 'semi-gaming',
      description: 'Esport et jeux 1080p sans compromis, prix contenu.',
      markupPct: 10,
      published: true,
      heroImage: IMG.GPU[0],
      parts: [
        part('CPU', 'CPU-R5-7600X'),
        part('Carte mère', 'MB-MSI-B650P'),
        part('GPU', 'GPU-RTX4060TI'),
        part('RAM', 'RAM-COR-16-6000', 'Noir'),
        part('Stockage', 'SSD-WD-SN850X-1T'),
        part('Alimentation', 'PSU-COR-RM750E'),
        part('Boîtier', 'CASE-NZXT-H5F', 'Noir'),
      ],
    },
  ]

  for (const b of builds) {
    await Build.updateOne(
      { slug: slugify(b.name) },
      { $set: { ...b, slug: slugify(b.name) } },
      { upsert: true },
    )
  }

  // --- Codes promo de démo ---
  const promos = [
    {
      code: 'BIENVENUE10',
      type: 'percentage',
      value: 10,
      description: 'Première commande',
      maxUses: 0,
      minPurchase: 150,
      applicableCategories: [],
    },
    {
      code: 'SETUP50',
      type: 'fixed',
      value: 50,
      description: 'Remise périphériques',
      maxUses: 200,
      minPurchase: 300,
      applicableCategories: ['peripheriques'],
    },
  ]
  for (const p of promos) {
    await Promo.updateOne(
      { code: p.code },
      {
        $set: {
          ...p,
          validFrom: new Date('2026-01-01'),
          validUntil: new Date('2026-12-31'),
          active: true,
        },
      },
      { upsert: true },
    )
  }

  console.log(
    `✓ ${components.length} composants + ${catalogExtras.length} produits + 1 service + ${builds.length} PC configurés + ${promos.length} codes promo`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

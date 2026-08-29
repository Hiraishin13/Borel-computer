/**
 * Seed the database with an admin user and demo products.
 * Run with: npm run seed  (loads .env.local)
 */
import { config } from 'dotenv'
import bcrypt from 'bcryptjs'

config({ path: '.env.local' })

import { connectDB } from '../src/lib/mongodb'
import { User } from '../src/models/User'
import { Product } from '../src/models/Product'
import { slugify } from '../src/lib/utils'

const IMG = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800'

const demoProducts = [
  {
    sku: 'GPU-RTX4070S',
    name: 'NVIDIA GeForce RTX 4070 Super',
    description: 'Carte graphique hautes performances pour le jeu en 1440p et la création.',
    category: 'composants',
    subcategory: 'GPU',
    price: 659,
    stock: 18,
    rating: 4.7,
    reviews: 42,
    featured: true,
    specifications: { 'Mémoire': '12 Go GDDR6X', Interface: 'PCIe 4.0', TDP: '220 W' },
  },
  {
    sku: 'CPU-R7-7800X3D',
    name: 'AMD Ryzen 7 7800X3D',
    description: 'Le processeur gaming de référence avec technologie 3D V-Cache.',
    category: 'composants',
    subcategory: 'CPU',
    price: 419,
    stock: 25,
    rating: 4.9,
    reviews: 88,
    featured: true,
    specifications: { Cœurs: '8', Threads: '16', 'Fréquence boost': '5.0 GHz', Socket: 'AM5' },
  },
  {
    sku: 'PC-BOREL-STRIKE',
    name: 'Borel Strike RTX 4070 Super',
    description: 'PC gaming assemblé : Ryzen 7, RTX 4070 Super, 32 Go DDR5, SSD 2 To.',
    category: 'ordinateurs',
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
    description: 'Switches linéaires, châssis aluminium, rétroéclairage RGB par touche.',
    category: 'peripheriques',
    subcategory: 'Claviers',
    price: 129,
    stock: 40,
    rating: 4.5,
    reviews: 63,
    specifications: { Format: 'TKL', Switches: 'Linéaire', Connectique: 'USB-C' },
  },
]

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
    console.log('✓ Admin created:', adminEmail, '/ admin1234')
  }

  for (const p of demoProducts) {
    const slug = slugify(p.name)
    await Product.updateOne(
      { sku: p.sku },
      { $set: { ...p, slug, thumbnail: IMG, images: [IMG] } },
      { upsert: true },
    )
  }
  console.log(`✓ Seeded ${demoProducts.length} products`)

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

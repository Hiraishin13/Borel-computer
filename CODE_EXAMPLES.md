# 💻 BOREL COMPUTER - Code Examples & Snippets

## 1️⃣ INSTALLATION & SETUP

### Créer le projet Next.js
```bash
npx create-next-app@latest borel-computer --typescript --tailwind --eslint
cd borel-computer

# Installer dépendances essentielles
npm install framer-motion axios zustand @tanstack/react-query stripe
npm install -D @types/node @types/react tailwindcss postcss
npm install next-auth bcryptjs
npm install resend dotenv
npm install swr

# Pour MongoDB
npm install mongoose
# OU pour PostgreSQL
npm install prisma @prisma/client
```

---

## 2️⃣ CONFIGURATION FILES

### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.cloudinary.com', 'blob.vercel-storage.com'],
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.vercel-storage.com' }
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  },
  experimental: {
    esmExternals: true
  }
}

module.exports = nextConfig
```

### `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a0a0a',
        secondary: '#1a1a1a',
        accent: '#e50914',
        light: '#f5f5f5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-in',
        slideUp: 'slideUp 0.6s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 3️⃣ COMPOSANTS PRINCIPAUX

### Hero Section avec Video Background
```tsx
// src/components/Hero/HeroSection.tsx
'use client'

import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <section className="relative w-full h-screen overflow-hidden bg-primary">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.5)' }}
      >
        <source src="/videos/gaming-hero.mp4" type="video/mp4" />
      </video>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-primary" />

      {/* Content */}
      <motion.div
        className="relative h-full flex flex-col items-center justify-center text-center z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-5xl md:text-7xl font-serif font-bold text-light mb-6"
          variants={itemVariants}
        >
          Borel Computer
        </motion.h1>

        <motion.p
          className="text-lg md:text-2xl text-light/80 max-w-2xl mb-8"
          variants={itemVariants}
        >
          L'excellence technologique pour gamers et professionnels
        </motion.p>

        <motion.div
          className="flex gap-4 flex-col sm:flex-row"
          variants={itemVariants}
        >
          <button className="px-8 py-3 bg-accent text-light font-semibold rounded hover:bg-opacity-90 transition">
            Découvrir la collection
          </button>
          <button className="px-8 py-3 border border-light text-light font-semibold rounded hover:bg-light/10 transition">
            En savoir plus
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg className="w-6 h-6 text-light/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  )
}
```

### Product Card Component
```tsx
// src/components/Product/ProductCard.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
      },
    },
  }

  const imageVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Link href={`/products/${product.id}`}>
        <motion.div
          className="bg-secondary rounded-lg overflow-hidden cursor-pointer group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {/* Image Container */}
          <motion.div className="relative h-48 overflow-hidden bg-secondary">
            <motion.div
              variants={imageVariants}
              initial="initial"
              whileHover={isHovered ? 'hover' : 'initial'}
            >
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </motion.div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {product.featured && (
                <span className="px-3 py-1 bg-accent text-light text-xs font-semibold rounded">
                  En vedette
                </span>
              )}
              {product.discountPrice && (
                <span className="px-3 py-1 bg-orange-600 text-light text-xs font-semibold rounded">
                  -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                </span>
              )}
            </div>

            {/* Favorite Button */}
            <motion.button
              className="absolute top-3 right-3 w-8 h-8 bg-light/90 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault()
                setIsFavorite(!isFavorite)
              }}
            >
              <svg
                className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-700'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.button>
          </motion.div>

          {/* Content */}
          <div className="p-4">
            <p className="text-xs text-light/50 uppercase tracking-wider mb-2">
              {product.category}
            </p>
            <h3 className="text-light font-semibold line-clamp-2 mb-3">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(product.rating) ? '★' : '☆'}>
                  </span>
                ))}
              </div>
              <span className="text-xs text-light/50">({product.reviews})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-accent">
                €{product.discountPrice || product.price}
              </span>
              {product.discountPrice && (
                <span className="text-sm text-light/50 line-through">
                  €{product.price}
                </span>
              )}
            </div>

            {/* Stock Indicator */}
            <div className="mt-3">
              {product.stock > 10 ? (
                <span className="text-xs text-green-500">En stock</span>
              ) : product.stock > 0 ? (
                <span className="text-xs text-yellow-500">Stock limité ({product.stock})</span>
              ) : (
                <span className="text-xs text-red-500">Rupture de stock</span>
              )}
            </div>

            {/* Add to Cart Button */}
            <motion.button
              className="w-full mt-3 py-2 bg-accent text-light font-semibold rounded transition-colors"
              whileHover={{ backgroundColor: '#d40810' }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => e.preventDefault()}
            >
              Ajouter au panier
            </motion.button>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
```

### Navigation Component
```tsx
// src/components/Layout/Navigation.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/products', label: 'Produits' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const menuVariants = {
    closed: {
      opacity: 0,
      x: -100,
      transition: { duration: 0.3 },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  }

  const itemVariants = {
    closed: { opacity: 0 },
    open: (i: number) => ({
      opacity: 1,
      transition: { delay: i * 0.1 },
    }),
  }

  return (
    <nav className="fixed top-0 w-full bg-primary/95 backdrop-blur-sm z-50 border-b border-secondary">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-serif font-bold text-light">
          Borel
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                pathname === item.href ? 'text-accent' : 'text-light/70 hover:text-light'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex gap-4">
          <input
            type="search"
            placeholder="Rechercher..."
            className="px-4 py-2 bg-secondary text-light rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button className="relative p-2 text-light hover:text-accent transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-light text-xs rounded-full flex items-center justify-center">
              0
            </span>
          </button>
          <button className="p-2 text-light hover:text-accent transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden p-2 text-light"
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden bg-secondary border-t border-secondary"
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={menuVariants}
      >
        {navItems.map((item, i) => (
          <motion.div
            key={item.href}
            variants={itemVariants}
            custom={i}
          >
            <Link
              href={item.href}
              className="block px-4 py-3 text-light/70 hover:text-light hover:bg-primary/50 transition"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </nav>
  )
}
```

---

## 4️⃣ API ROUTES

### Route d'Authentification
```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Chercher utilisateur
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Créer JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '7d' }
    )

    return NextResponse.json(
      {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        token,
        role: user.role,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
```

### Route Produits
```typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') === 'asc' ? 1 : -1

    // Build query
    const query: any = {}
    if (category) query.category = category
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    // Fetch products
    const products = await Product.find(query)
      .sort({ [sortBy]: order })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(query)

    return NextResponse.json(
      {
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check auth & admin role
    const token = request.headers.get('authorization')?.split(' ')[1]
    // ... verify token ...

    await connectDB()
    const body = await request.json()

    const product = await Product.create(body)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
```

---

## 5️⃣ CUSTOM HOOKS

### useCart Hook
```typescript
// src/hooks/useCart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clear: () => void
  getTotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })),

      clear: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'borel-cart',
    }
  )
)
```

### useFetch Hook
```typescript
// src/hooks/useFetch.ts
import { useEffect, useState } from 'react'
import axios from 'axios'

interface UseFetchReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useFetch<T>(url: string, token?: string): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers: any = {}
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api${url}`, {
          headers,
        })
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url, token])

  return { data, loading, error }
}
```

---

## 6️⃣ ANIMATION UTILITIES

```typescript
// src/lib/animations.ts
export const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
}

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, ease: 'easeOut' },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const slideInLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
}

export const slideInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
}
```

---

## 7️⃣ TYPES

```typescript
// src/types/index.ts
export interface Product {
  id: string
  sku: string
  name: string
  description: string
  category: string
  subcategory: string
  price: number
  discountPrice?: number
  currency: string
  stock: number
  thumbnail: string
  images: string[]
  rating: number
  reviews: number
  featured: boolean
  specifications: Record<string, string>
  warranty: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'user' | 'admin'
  profileImage?: string
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  total: number
  createdAt: string
}

export interface OrderItem {
  productId: string
  name: string
  sku: string
  price: number
  quantity: number
}
```

---

**Cette documentation fournit une base solide pour démarrer le projet Borel Computer.**

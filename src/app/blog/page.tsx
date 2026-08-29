import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Blog' }

const posts = [
  { slug: 'guide-achat-gpu-2026', title: 'Guide d’achat GPU 2026', excerpt: 'Quelle carte graphique choisir selon votre budget et votre résolution.' },
  { slug: 'monter-son-pc', title: 'Monter son PC : les étapes clés', excerpt: 'Notre méthode pas à pas pour un premier assemblage réussi.' },
]

export default function BlogPage() {
  return (
    <div className="container-page py-16">
      <h1 className="text-4xl font-bold">Blog</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="card p-6 hover:border-accent">
            <h2 className="text-lg font-semibold">{post.title}</h2>
            <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

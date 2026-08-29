import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import { Product as ProductModel } from '@/models/Product'
import { serializeProduct } from '@/lib/serializers'
import { formatPrice, discountPercent } from '@/lib/utils'
import { RatingStars } from '@/components/ui/RatingStars'
import { Badge } from '@/components/ui/Badge'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductBehaviorTracker } from '@/components/product/ProductBehaviorTracker'
import { Recommendations } from '@/components/product/Recommendations'
import { RecentlyViewed } from '@/components/product/RecentlyViewed'

export const revalidate = 120

async function getProduct(slug: string) {
  try {
    await connectDB()
    const doc = await ProductModel.findOne({ slug, published: { $ne: false } }).lean()
    return doc ? serializeProduct(doc) : null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Produit introuvable' }
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: [product.thumbnail] },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const off = discountPercent(product.price, product.discountPrice)
  const price = product.discountPrice ?? product.price

  return (
    <div className="container-page py-12">
      <ProductBehaviorTracker
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          brand: product.brand,
          price,
          image: product.thumbnail,
        }}
      />
      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery
          images={product.images.length ? product.images : [product.thumbnail]}
          alt={product.name}
        />

        <div>
          <p className="text-xs uppercase tracking-wider text-muted">{product.subcategory}</p>
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
          <RatingStars rating={product.rating} count={product.reviews} className="mt-3" />

          <div className="mt-6 flex items-center gap-3">
            <span className="text-3xl font-bold text-accent">{formatPrice(price)}</span>
            {off && (
              <>
                <span className="text-muted line-through">{formatPrice(product.price)}</span>
                <Badge tone="danger">-{off}%</Badge>
              </>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-muted">{product.description}</p>

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>

          <dl className="mt-10 divide-y divide-white/10 border-t border-white/10 text-sm">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between py-3">
                <dt className="text-muted">{key}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
            <div className="flex justify-between py-3">
              <dt className="text-muted">Garantie</dt>
              <dd className="font-medium">{product.warranty}</dd>
            </div>
          </dl>
        </div>
      </div>

      <Recommendations productId={product.id} slug={product.slug} />
      <RecentlyViewed excludeSlug={product.slug} />
    </div>
  )
}

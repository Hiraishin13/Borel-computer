import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/products', '/configurator', '/blog', '/about', '/contact']
  return routes.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))
}

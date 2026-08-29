import { HeroSection } from '@/components/home/HeroSection'
import { CategoryShowcase } from '@/components/home/CategoryShowcase'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Newsletter } from '@/components/home/Newsletter'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <Newsletter />
    </>
  )
}

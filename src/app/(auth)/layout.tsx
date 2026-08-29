import Link from 'next/link'
import { SITE } from '@/lib/constants'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center font-serif text-2xl font-bold">
          {SITE.name.split(' ')[0]}
          <span className="text-accent">.</span>
        </Link>
        <div className="card p-8">{children}</div>
      </div>
    </div>
  )
}

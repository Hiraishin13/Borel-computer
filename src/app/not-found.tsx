import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-serif text-7xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Page introuvable</h1>
      <p className="mt-2 text-muted">La page que vous cherchez n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" className="btn-primary mt-8">
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}

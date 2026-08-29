const TITLES: Record<string, string> = {
  mentions: 'Mentions légales',
  privacy: 'Politique de confidentialité',
  terms: 'Conditions générales de vente',
  returns: 'Politique de retours',
}

export function generateStaticParams() {
  return Object.keys(TITLES).map((slug) => ({ slug }))
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container-page max-w-2xl py-16">
      <h1 className="text-3xl font-bold">{TITLES[params.slug] ?? 'Informations légales'}</h1>
      <p className="mt-6 text-muted">Contenu légal à compléter.</p>
    </div>
  )
}

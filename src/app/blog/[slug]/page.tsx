export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <article className="container-page max-w-2xl py-16">
      <h1 className="text-3xl font-bold capitalize">{params.slug.replace(/-/g, ' ')}</h1>
      <p className="mt-6 text-muted">
        Contenu de l&apos;article à charger depuis un CMS ou des fichiers MDX.
      </p>
    </article>
  )
}

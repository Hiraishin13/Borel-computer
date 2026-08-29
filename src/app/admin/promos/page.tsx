export default function AdminPromosPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Promotions</h1>
      <p className="mt-4 text-sm text-muted">
        Création et suivi des codes promo — à implémenter via
        <code className="mx-1 rounded bg-secondary px-1">POST /api/admin/promos</code>.
      </p>
    </div>
  )
}

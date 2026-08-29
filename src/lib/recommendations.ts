/** Sous-catégories complémentaires pour "compléter la configuration". */
export const PARTNER_SUBCATEGORIES: Record<string, string[]> = {
  GPU: ['Alimentation', 'Boîtier', 'Carte mère'],
  CPU: ['Carte mère', 'Refroidissement', 'RAM'],
  'Carte mère': ['CPU', 'RAM', 'Stockage'],
  RAM: ['Carte mère', 'Stockage'],
  Stockage: ['Stockage', 'Boîtier'],
  Alimentation: ['Boîtier', 'GPU'],
  Boîtier: ['Refroidissement', 'Alimentation'],
  Refroidissement: ['Boîtier', 'Alimentation'],
  'Desktop Gaming': ['Écrans', 'Claviers', 'Casques'],
  Claviers: ['Souris', 'Casques'],
  Souris: ['Claviers', 'Écrans'],
  'Écrans': ['Claviers', 'Souris'],
}

export function wattsFromSpec(spec?: string): number {
  if (!spec) return 0
  const m = spec.replace(/\s/g, '').match(/(\d+)\s*w/i)
  return m ? Number(m[1]) : 0
}

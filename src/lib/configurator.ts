import type { Product } from '@/types'

/** Slots du configurateur, dans l'ordre d'affichage. */
export const CONFIG_SLOTS = [
  { key: 'CPU', label: 'Processeur', required: true },
  { key: 'Carte mère', label: 'Carte mère', required: true },
  { key: 'GPU', label: 'Carte graphique', required: true },
  { key: 'RAM', label: 'Mémoire', required: true },
  { key: 'Stockage', label: 'Stockage', required: true },
  { key: 'Refroidissement', label: 'Refroidissement', required: false },
  { key: 'Alimentation', label: 'Alimentation', required: true },
  { key: 'Boîtier', label: 'Boîtier', required: true },
] as const

export type SlotKey = (typeof CONFIG_SLOTS)[number]['key']

export type ConfigCatalog = Record<SlotKey, Product[]>

export interface SlotSelection {
  productId: string
  color?: string
}

export type Selection = Partial<Record<SlotKey, SlotSelection>>

/** Récupère une spec quelle que soit la casse / variante de clé. */
function spec(p: Product | undefined, ...keys: string[]): string | undefined {
  if (!p) return undefined
  for (const k of keys) {
    const hit = Object.entries(p.specifications).find(
      ([sk]) => sk.toLowerCase() === k.toLowerCase(),
    )
    if (hit) return hit[1]
  }
  return undefined
}

/** Extrait un nombre de watts d'une chaîne type "750 W". */
export function watts(value: string | undefined): number {
  if (!value) return 0
  const m = value.replace(/\s/g, '').match(/(\d+)\s*w/i)
  return m ? Number(m[1]) : 0
}

export function colorOptions(p: Product | undefined): string[] {
  const variant = p?.variants.find((v) => /couleur|color/i.test(v.name))
  return variant?.options ?? []
}

export interface CompatibilityReport {
  /** Bloquant : empêche l'ajout au panier. */
  errors: string[]
  /** Avertissement non bloquant. */
  warnings: string[]
  /** Consommation estimée (W). */
  estimatedWatts: number
  /** Alimentation recommandée (W). */
  recommendedPsu: number
}

export function checkCompatibility(catalog: ConfigCatalog, selection: Selection): CompatibilityReport {
  const errors: string[] = []
  const warnings: string[] = []

  const get = (slot: SlotKey): Product | undefined => {
    const id = selection[slot]?.productId
    return id ? catalog[slot]?.find((p) => p.id === id) : undefined
  }

  const cpu = get('CPU')
  const mobo = get('Carte mère')
  const gpu = get('GPU')
  const ram = get('RAM')
  const psu = get('Alimentation')
  const cooler = get('Refroidissement')

  // Socket CPU <-> Carte mère
  const cpuSocket = spec(cpu, 'Socket')
  const moboSocket = spec(mobo, 'Socket')
  if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
    errors.push(`Socket incompatible : ${cpu?.brand ?? 'CPU'} ${cpuSocket} vs carte mère ${moboSocket}.`)
  }

  // Type mémoire RAM <-> Carte mère
  const ramType = spec(ram, 'Type', 'Type mémoire')
  const moboMem = spec(mobo, 'Mémoire', 'Type mémoire')
  if (ramType && moboMem && !moboMem.toLowerCase().includes(ramType.toLowerCase())) {
    errors.push(`Mémoire incompatible : ${ramType} vs carte mère ${moboMem}.`)
  }

  // Consommation & alimentation
  const cpuW = watts(spec(cpu, 'TDP', 'Puissance'))
  const gpuW = watts(spec(gpu, 'TDP', 'Puissance'))
  const estimatedWatts = cpuW + gpuW + 120 // reste de la config
  const recommendedPsu = Math.ceil((estimatedWatts * 1.5) / 50) * 50
  const psuW = watts(spec(psu, 'Puissance', 'Wattage'))
  if (psuW && psuW < estimatedWatts * 1.2) {
    errors.push(`Alimentation sous-dimensionnée : ${psuW} W pour ~${estimatedWatts} W estimés (min. ${recommendedPsu} W).`)
  } else if (psuW && psuW < recommendedPsu) {
    warnings.push(`Alimentation un peu juste : ${psuW} W, ${recommendedPsu} W recommandés pour de la marge.`)
  }

  // Refroidissement vs CPU haut de gamme
  if (cpuW >= 150 && cooler && /air/i.test(spec(cooler, 'Type') ?? '')) {
    warnings.push('Processeur puissant : un refroidissement AIO (watercooling) est conseillé.')
  }
  if (cpuW >= 125 && !cooler) {
    warnings.push('Aucun refroidissement sélectionné pour ce processeur.')
  }

  return { errors, warnings, estimatedWatts, recommendedPsu }
}

/** Pour chaque slot, l'ensemble des ids de produits incompatibles avec la sélection courante. */
export function incompatibleIds(
  catalog: ConfigCatalog,
  selection: Selection,
): Record<SlotKey, Set<string>> {
  const result = {} as Record<SlotKey, Set<string>>
  for (const { key } of CONFIG_SLOTS) result[key] = new Set<string>()

  const pick = (slot: SlotKey) => {
    const id = selection[slot]?.productId
    return id ? catalog[slot]?.find((p) => p.id === id) : undefined
  }

  const cpu = pick('CPU')
  const mobo = pick('Carte mère')
  const gpu = pick('GPU')
  const ram = pick('RAM')

  const cpuSocket = spec(cpu, 'Socket')
  const moboSocket = spec(mobo, 'Socket')
  const ramType = spec(ram, 'Type', 'Type mémoire')
  const moboMem = spec(mobo, 'Mémoire', 'Type mémoire')

  if (moboSocket) {
    for (const p of catalog.CPU) {
      const s = spec(p, 'Socket')
      if (s && s !== moboSocket) result.CPU.add(p.id)
    }
  }
  if (cpuSocket) {
    for (const p of catalog['Carte mère']) {
      const s = spec(p, 'Socket')
      if (s && s !== cpuSocket) result['Carte mère'].add(p.id)
    }
  }
  if (moboMem) {
    for (const p of catalog.RAM) {
      const t = spec(p, 'Type', 'Type mémoire')
      if (t && !moboMem.toLowerCase().includes(t.toLowerCase())) result.RAM.add(p.id)
    }
  }
  if (ramType) {
    for (const p of catalog['Carte mère']) {
      const m = spec(p, 'Mémoire', 'Type mémoire')
      if (m && !m.toLowerCase().includes(ramType.toLowerCase())) result['Carte mère'].add(p.id)
    }
  }

  const load = watts(spec(cpu, 'TDP', 'Puissance')) + watts(spec(gpu, 'TDP', 'Puissance')) + 120
  if (load > 120) {
    for (const p of catalog.Alimentation) {
      const w = watts(spec(p, 'Puissance', 'Wattage'))
      if (w && w < load * 1.2) result.Alimentation.add(p.id)
    }
  }

  return result
}

export function performanceTier(gpu: Product | undefined): string {
  if (!gpu) return '—'
  const vram = Number(spec(gpu, 'Mémoire')?.match(/(\d+)\s*Go/i)?.[1] ?? 0)
  const name = gpu.name.toLowerCase()
  if (/4080|4090|7900 xtx/.test(name) || vram >= 16) return 'Gaming 4K / création'
  if (/4070|7800 xt|7900/.test(name)) return 'Gaming 1440p haute fréquence'
  return 'Gaming 1080p / 1440p'
}

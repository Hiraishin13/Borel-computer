import { SITE } from './constants'
import { formatDate } from './utils'

export interface ConfigLine {
  slot: string
  name: string
  detail?: string
  price: number
}

const money = (n: number) => `$${n.toFixed(2)}`

/** PDF récapitulatif d'une configuration PC personnalisée. */
export async function downloadConfigSheet(opts: {
  lines: ConfigLine[]
  total: number
  estimatedWatts: number
  performance: string
  warnings: string[]
}): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const marginX = 48
  let y = 56

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(SITE.name, marginX, y)
  doc.setTextColor(229, 9, 20)
  doc.setFontSize(16)
  doc.text('CONFIGURATION PC', pageW - marginX, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  y += 20
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text(`Devis généré le ${formatDate(new Date())}`, marginX, y)
  doc.setTextColor(0, 0, 0)

  y += 30
  doc.setFillColor(20, 20, 20)
  doc.rect(marginX, y - 12, pageW - marginX * 2, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Poste', marginX + 6, y + 2)
  doc.text('Composant', marginX + 120, y + 2)
  doc.text('Prix', pageW - marginX - 6, y + 2, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  y += 22

  opts.lines.forEach((l) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(l.slot, marginX + 6, y)
    doc.setFont('helvetica', 'normal')
    doc.text(`${l.name}${l.detail ? `  (${l.detail})` : ''}`.slice(0, 70), marginX + 120, y)
    doc.text(money(l.price), pageW - marginX - 6, y, { align: 'right' })
    y += 15
    doc.setDrawColor(230, 230, 230)
    doc.line(marginX, y - 5, pageW - marginX, y - 5)
  })

  y += 14
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL', marginX + 120, y)
  doc.text(money(opts.total), pageW - marginX - 6, y, { align: 'right' })

  y += 26
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Consommation estimée : ${opts.estimatedWatts} W`, marginX, y)
  y += 14
  doc.text(`Usage cible : ${opts.performance}`, marginX, y)

  if (opts.warnings.length) {
    y += 22
    doc.setFont('helvetica', 'bold')
    doc.text('Remarques', marginX, y)
    doc.setFont('helvetica', 'normal')
    opts.warnings.forEach((w) => {
      y += 14
      doc.text(`- ${w}`.slice(0, 110), marginX, y)
    })
  }

  doc.setTextColor(120, 120, 120)
  doc.setFontSize(8)
  doc.text(
    `${SITE.name} — Devis indicatif, valable 15 jours, sous réserve de disponibilité.`,
    marginX,
    doc.internal.pageSize.getHeight() - 36,
  )

  doc.save('configuration-borel-computer.pdf')
}

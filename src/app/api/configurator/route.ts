import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { serializeProduct } from '@/lib/serializers'
import { CONFIG_SLOTS, type ConfigCatalog, type SlotKey } from '@/lib/configurator'
import { handle, ok } from '@/lib/api-response'

export const GET = handle(async () => {
  await connectDB()

  const slotKeys = CONFIG_SLOTS.map((s) => s.key)
  const docs = await Product.find({
    category: 'composants',
    subcategory: { $in: slotKeys },
    stock: { $gt: 0 },
  })
    .sort({ brand: 1, price: 1 })
    .lean()

  const catalog = Object.fromEntries(slotKeys.map((k) => [k, []])) as unknown as ConfigCatalog
  for (const doc of docs) {
    const slot = doc.subcategory as SlotKey
    if (catalog[slot]) catalog[slot].push(serializeProduct(doc))
  }

  return ok({ catalog })
})

export const dynamic = 'force-dynamic'

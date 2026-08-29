/**
 * Peuple la base (CLI). Charge .env.local puis délègue à src/lib/seed.
 * Usage : npm run seed
 *   ou   $env:MONGODB_URI="<atlas>"; npm run seed
 */
import { config } from 'dotenv'

config({ path: '.env.local' })

async function main() {
  const { runSeed } = await import('../src/lib/seed')
  const r = await runSeed()
  if (r.adminCreated) console.log('✓ Admin créé : admin@borelcomputer.com / admin1234')
  console.log(
    `✓ ${r.components} composants + ${r.extras} produits + 1 service + ${r.builds} PC configurés + ${r.promos} codes promo + config boutique`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

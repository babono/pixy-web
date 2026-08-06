import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../src/payload.config'

/**
 * Rebuilds the search index against what's actually in the catalogue.
 *
 * `import:pixy` clears products with `payload.db.deleteMany`, which goes
 * straight to the database and skips collection hooks — so the search plugin
 * never removes the entries for the products it deleted. Those stale results
 * link to 404s and reference media that no longer exists, which is why their
 * thumbnails render broken.
 *
 * Re-saving each surviving document re-runs `beforeSyncWithSearch`, picking up
 * the product packshot as the result image.
 *
 * Usage:
 *   npm run sync:search
 */

const INDEXED = ['products', 'posts'] as const

const run = async () => {
  const payload = await getPayload({ config })

  const alive = new Map<string, Set<string>>()

  for (const collection of INDEXED) {
    const { docs } = await payload.find({
      collection,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { slug: true },
    })
    alive.set(collection, new Set(docs.map((doc) => String(doc.id))))
  }

  payload.logger.info('Pruning stale search entries…')

  const { docs: entries } = await payload.find({
    collection: 'search',
    depth: 0,
    limit: 2000,
    pagination: false,
  })

  let pruned = 0

  for (const entry of entries) {
    const relationTo = entry.doc?.relationTo
    const value = entry.doc?.value
    const ids = relationTo ? alive.get(relationTo) : undefined

    // Unknown collection or a document that no longer exists.
    if (ids?.has(String(typeof value === 'object' && value ? value.id : value))) continue

    await payload.delete({
      collection: 'search',
      id: entry.id,
      context: { disableRevalidate: true },
    })
    pruned += 1
  }

  payload.logger.info(`  removed ${pruned} of ${entries.length} entr(ies)`)

  payload.logger.info('\nRe-indexing…')

  for (const collection of INDEXED) {
    const ids = [...(alive.get(collection) ?? [])]

    for (const id of ids) {
      // An empty update still fires afterChange, which is what re-syncs search.
      await payload.update({
        collection,
        id,
        context: { disableRevalidate: true },
        data: {},
      })
    }

    payload.logger.info(`  ${collection}: ${ids.length} document(s)`)
  }

  payload.logger.info('\nRun `rm -rf .next` before restarting the dev server.')

  process.exit(0)
}

run().catch((error) => {
  console.error(JSON.stringify((error as { cause?: unknown })?.cause ?? error, null, 2))
  process.exit(1)
})

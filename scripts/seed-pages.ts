import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../src/payload.config'
import { aboutPageData } from '../src/endpoints/seed/about-page'
import { faqPageData } from '../src/endpoints/seed/faq-page'

/**
 * Creates the About and FAQ pages from the seed data.
 *
 * The full seed builds these, but it clears every collection first and the 94
 * live products came from `import:pixy` — they would not come back. Until this
 * runs, /about and /faq render the hardcoded fallbacks in about-static.ts and
 * faq-static.ts, which editors can't touch.
 *
 * Re-running updates the existing documents rather than adding duplicates.
 *
 * Usage:
 *   npm run seed:pages
 */

const run = async () => {
  const payload = await getPayload({ config })

  // The brand-values block references the three value icons by ID.
  const { docs: valueMedia } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 10,
    pagination: false,
    sort: 'filename',
    where: { filename: { like: 'pixy-value-' } },
  })

  const valueMediaIds = valueMedia.map((doc) => String(doc.id))

  if (valueMediaIds.length < 3) {
    payload.logger.warn(
      `Only ${valueMediaIds.length} value icon(s) found — the brand values block will drop the rest.`,
    )
  }

  const pages = [aboutPageData({ valueMediaIds }), faqPageData()]

  for (const data of pages) {
    const { docs } = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1,
      pagination: false,
      where: { slug: { equals: data.slug } },
    })

    if (docs[0]) {
      await payload.update({
        collection: 'pages',
        id: docs[0].id,
        context: { disableRevalidate: true },
        data,
      })
      payload.logger.info(`  /${data.slug} — updated (${data.layout?.length ?? 0} blocks)`)
      continue
    }

    await payload.create({
      collection: 'pages',
      depth: 0,
      context: { disableRevalidate: true },
      data,
    })
    payload.logger.info(`  /${data.slug} — created (${data.layout?.length ?? 0} blocks)`)
  }

  payload.logger.info('\nRun `rm -rf .next` before restarting the dev server.')

  process.exit(0)
}

run().catch((error) => {
  console.error(JSON.stringify((error as any)?.cause?.errors ?? error, null, 2))
  process.exit(1)
})

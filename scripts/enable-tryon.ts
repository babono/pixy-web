import 'dotenv/config'

import { getPayload } from 'payload'

import type { Product } from '../src/payload-types'
import config from '../src/payload.config'

/**
 * Turns on the virtual try-on for the lip range and sets each product's finish.
 *
 * The finish decides how much pigment the filter paints, because the imported
 * swatches are flat product colours with no coverage information — see
 * FINISHES in src/components/pixy/TryOn/useLipRenderer.ts.
 *
 * Usage:
 *   npm run enable:tryon
 */

const FINISH_BY_SLUG: Record<string, NonNullable<NonNullable<Product['virtualTryOn']>['finish']>> =
  {
    'pixy-lip-cream': 'cream',
    'pixy-matte-in-love': 'matte',
    'pixy-lip-conditioner': 'sheer',
    'pixy-lip-hydrating': 'sheer',
    'pixy-time-to-gloss': 'vinyl',
    'pixy-hydra-glass-liptint': 'tint',
    'pixy-hyperlast-glazed-lip-vinyl': 'vinyl',
  }

const run = async () => {
  const payload = await getPayload({ config })

  for (const [slug, finish] of Object.entries(FINISH_BY_SLUG)) {
    const { docs } = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 1,
      where: { slug: { equals: slug } },
    })

    const product = docs[0]
    if (!product) {
      payload.logger.warn(`  ${slug} — not found, skipping`)
      continue
    }

    const usable = (product.shades ?? []).filter(
      (shade) => shade.swatch && /^#[0-9a-fA-F]{6}$/.test(shade.swatch),
    )

    if (!usable.length) {
      payload.logger.warn(`  ${slug} — no shades with a hex swatch, skipping`)
      continue
    }

    await payload.update({
      collection: 'products',
      id: product.id,
      // Writing outside a request context rolls the change back if the
      // revalidation hook fires; the dev server picks it up after `rm -rf .next`.
      context: { disableRevalidate: true },
      data: { virtualTryOn: { enabled: true, finish } },
    })

    payload.logger.info(`  ${slug} — enabled (${finish}, ${usable.length} shades)`)
  }

  payload.logger.info('\nRun `rm -rf .next` before restarting the dev server.')
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

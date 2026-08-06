import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../src/payload.config'

/**
 * Points the marketplace tiles at PIXY's official storefronts, and clears the
 * auto-generated "Buy Now" action left on imported products.
 *
 * That action was built from `buyLinks[0]`, so every product sent shoppers to
 * Tokopedia even when it was stocked in five other places. The product page now
 * derives the button from the whole `buyLinks` array, which makes the stored
 * action a duplicate — two identical buttons if it stays.
 *
 * Usage:
 *   npm run sync:commerce
 */

const STOREFRONTS: Record<string, string> = {
  Tokopedia: 'https://www.tokopedia.com/pixyofficial',
  Shopee: 'https://shopee.co.id/pixyindonesia',
  'TikTok Shop': 'https://www.tiktok.com/@pixycosmetics_id',
  Lazada: 'https://www.lazada.co.id/tag/pixy-official-store-indonesia/',
}

const run = async () => {
  const payload = await getPayload({ config })

  payload.logger.info('Updating marketplace storefronts…')

  const { docs: marketplaces } = await payload.find({
    collection: 'marketplaces',
    depth: 0,
    limit: 50,
    pagination: false,
  })

  for (const marketplace of marketplaces) {
    const url = STOREFRONTS[marketplace.name]

    if (!url) {
      payload.logger.warn(`  ${marketplace.name} — no storefront listed, leaving as-is`)
      continue
    }

    if (marketplace.url === url) {
      payload.logger.info(`  ${marketplace.name} — already current`)
      continue
    }

    await payload.update({
      collection: 'marketplaces',
      id: marketplace.id,
      context: { disableRevalidate: true },
      data: { url },
    })
    payload.logger.info(`  ${marketplace.name} — ${url}`)
  }

  /**
   * The footer's E-Commerce column is seeded as plain custom links rather than
   * relationships, so it holds its own copies of these URLs and doesn't follow
   * the collection.
   */
  payload.logger.info('\nUpdating the footer E-Commerce column…')

  const footer = await payload.findGlobal({ slug: 'footer', depth: 0 })
  const columns = (footer.columns ?? []).map((column) => ({
    ...column,
    navItems: (column.navItems ?? []).map((item) => {
      const url = item.link?.label ? STOREFRONTS[item.link.label] : undefined
      if (!url || item.link.url === url) return item

      payload.logger.info(`  ${item.link.label} — ${url}`)
      return { ...item, link: { ...item.link, url } }
    }),
  }))

  await payload.updateGlobal({
    slug: 'footer',
    context: { disableRevalidate: true },
    data: { columns },
  })

  payload.logger.info('\nClearing auto-generated "Buy Now" actions…')

  const { docs: products } = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 500,
    pagination: false,
  })

  let cleared = 0

  for (const product of products) {
    const actions = product.actions ?? []
    if (!actions.length) continue

    // Only the generated one: an editor's own buttons must survive. It is
    // recognisable by pointing at a URL that's already in `buyLinks`.
    const urls = new Set((product.buyLinks ?? []).map((link) => link.url))
    const kept = actions.filter(
      (action) => !(action.label === 'Buy Now' && urls.has(action.url)),
    )

    if (kept.length === actions.length) continue

    await payload.update({
      collection: 'products',
      id: product.id,
      context: { disableRevalidate: true },
      data: { actions: kept },
    })
    cleared += 1
  }

  payload.logger.info(`  cleared on ${cleared} product(s)`)
  payload.logger.info('\nRun `rm -rf .next` before restarting the dev server.')

  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

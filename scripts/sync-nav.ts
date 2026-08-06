import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../src/payload.config'

/**
 * Repoints the header and footer category links at the categories that exist.
 *
 * `import:pixy` replaces the whole taxonomy, which leaves every nav link that
 * referenced a category dangling. A dangling reference renders as nothing, so
 * the footer showed a "Products" heading with no links beneath it.
 *
 * `import:pixy` now does this itself; this repairs a site imported before that.
 *
 * Usage:
 *   npm run sync:nav
 */

const run = async () => {
  const payload = await getPayload({ config })

  const { docs: categories } = await payload.find({
    collection: 'product-categories',
    depth: 0,
    limit: 50,
    pagination: false,
    sort: 'createdAt',
  })

  if (!categories.length) throw new Error('No product categories — run `npm run import:pixy` first.')

  const links = categories.map((category) => ({
    link: {
      type: 'reference' as const,
      reference: { relationTo: 'product-categories' as const, value: category.id },
      label: category.title,
    },
  }))

  payload.logger.info(`Linking ${categories.length} categories: ${categories.map((c) => c.title).join(', ')}`)

  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  await payload.updateGlobal({
    slug: 'header',
    context: { disableRevalidate: true },
    data: {
      navItems: (header.navItems ?? []).map((item) =>
        item.link?.label === 'Products' ? { ...item, subItems: links } : item,
      ),
    },
  })
  payload.logger.info('  header Products submenu — updated')

  const footer = await payload.findGlobal({ slug: 'footer', depth: 0 })
  await payload.updateGlobal({
    slug: 'footer',
    context: { disableRevalidate: true },
    data: {
      columns: (footer.columns ?? []).map((column) =>
        column.title === 'Products' ? { ...column, navItems: links } : column,
      ),
    },
  })
  payload.logger.info('  footer Products column — updated')

  payload.logger.info('\nRun `rm -rf .next` before restarting the dev server.')

  process.exit(0)
}

run().catch((error) => {
  console.error(JSON.stringify((error as { cause?: unknown })?.cause ?? error, null, 2))
  process.exit(1)
})

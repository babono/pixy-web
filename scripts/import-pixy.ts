import 'dotenv/config'

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { File, Payload } from 'payload'
import { getPayload } from 'payload'
import sharp from 'sharp'

import type { Media, ProductCategory } from '../src/payload-types'
import config from '../src/payload.config'
import { richText } from '../src/endpoints/seed/pixy/lexical'
import type { ScrapedProduct } from './scrape-pixy'

/**
 * Imports the scraped pixy.co.id catalogue (`npm run scrape:pixy`) into Payload,
 * replacing the demo products.
 *
 * Copy is imported verbatim in Indonesian — the source site has no English
 * text, and machine-translating regulated cosmetic claims (SPF, BPOM numbers,
 * "brightening agent") onto a live brand site is not something to do silently.
 * Translation is a content task for after localization is configured.
 *
 * Usage:
 *   npm run import:pixy
 *   npm run import:pixy -- --limit 5
 */

const SCRAPE_DIR = path.resolve(process.cwd(), '.pixy-scrape')

/** Old-site category slugs, in the order the new nav should list them. */
const CATEGORIES: {
  art: string
  description: string
  slug: string
  tint: NonNullable<ProductCategory['tint']>
  title: string
}[] = [
  {
    art: 'category-base-makeup.png',
    description:
      'Two way cakes, loose powders and foundations for a bright, even finish that lasts all day.',
    slug: 'base-makeup',
    tint: 'lavender',
    title: 'Base Makeup',
  },
  {
    art: 'category-decoratives.png',
    description: 'Lipsticks, liners and brow pencils to colour, define and finish the look.',
    slug: 'decorative',
    tint: 'sky',
    title: 'Decorative',
  },
  {
    art: 'category-skin-care.png',
    description: 'Serums, moisturisers and essences built around hydration and everyday radiance.',
    slug: 'skin-care',
    tint: 'mint',
    title: 'Skin Care',
  },
  {
    art: 'category-wellness.png',
    description: 'Beauty from the inside out — supplements formulated to support skin and hair.',
    slug: 'wellness',
    tint: 'pink',
    title: 'Wellness',
  },
  {
    // Series spans every category, so its tile is composed from the other four
    art: 'category-series.png',
    description: 'Collections built around a shared benefit, from White Aqua to Make It Glow.',
    slug: 'series',
    tint: 'rose',
    title: 'Series',
  },
]

/** Figma category art lives in the repo, not in the scrape directory. */
const FIGMA_PHOTOS = path.resolve(process.cwd(), 'public', 'pixy', 'photos')

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Source packshots are PNGs on white, often over 1MB. Normalising to WebP keeps
 * the media library consistent with the rest of the seed and cuts the upload
 * dramatically.
 */
const toWebp = async (
  filename: string,
  name: string,
  dir = path.join(SCRAPE_DIR, 'images'),
): Promise<File | null> => {
  const buffer = await readFile(path.join(dir, filename)).catch(() => null)
  if (!buffer) return null

  const data = await sharp(buffer)
    .resize({ fit: 'inside', width: 1400, withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer()

  return { name: `${name}.webp`, data, mimetype: 'image/webp', size: data.byteLength }
}

const filenameFor = (url: string): string => decodeURIComponent(url.split('/').pop() ?? '')

const run = async () => {
  const args = process.argv.slice(2)
  const limitFlag = args.indexOf('--limit')
  const limit = limitFlag > -1 ? Number(args[limitFlag + 1]) : Infinity

  const payload = await getPayload({ config })

  const scraped: ScrapedProduct[] = JSON.parse(
    await readFile(path.join(SCRAPE_DIR, 'products.json'), 'utf8'),
  )
  const products = scraped.slice(0, limit)

  payload.logger.info(`Importing ${products.length} product(s) from pixy.co.id…`)

  // --- replace the demo catalogue -----------------------------------------
  await payload.db.deleteMany({ collection: 'products', where: {} })
  if (payload.collections.products.config.versions) {
    await payload.db.deleteVersions({ collection: 'products', where: {} })
  }
  await payload.db.deleteMany({ collection: 'product-categories', where: {} })

  payload.logger.info('— Seeding categories…')

  const categoryDocs: Record<string, ProductCategory> = {}
  for (const { art, ...category } of CATEGORIES) {
    const file = await toWebp(art, `pixy-category-${category.slug}`, FIGMA_PHOTOS)
    const image = file
      ? await payload.create({
          collection: 'media',
          data: { alt: `${category.title} category` },
          file,
        })
      : null

    categoryDocs[category.slug] = await payload.create({
      collection: 'product-categories',
      depth: 0,
      context: { disableRevalidate: true },
      data: { ...category, ...(image ? { image: image.id } : {}) },
    })
  }

  payload.logger.info('— Importing products…')

  // Media is deduplicated by source filename: shade images reappear in the
  // gallery, and a few packshots are shared across products.
  const mediaByFile = new Map<string, Media>()

  const upload = async (url: string, alt: string): Promise<Media | null> => {
    const filename = filenameFor(url)
    const cached = mediaByFile.get(filename)
    if (cached) return cached

    const file = await toWebp(filename, slugify(filename.replace(/\.[^.]+$/, '')))
    if (!file) return null

    const doc = await payload.create({ collection: 'media', data: { alt }, file })
    mediaByFile.set(filename, doc)
    return doc
  }

  let imported = 0

  for (const [index, product] of products.entries()) {
    try {
      // Serialised: every write shares one Mongo session
      const images: Media[] = []
      for (const src of product.images) {
        const doc = await upload(src, product.title)
        if (doc) images.push(doc)
      }

      const shades = []
      for (const shade of product.shades) {
        const doc = shade.image ? await upload(shade.image, `${product.title} — ${shade.name}`) : null

        shades.push({
          name: shade.name,
          swatch: /^#[0-9a-fA-F]{6}$/.test(shade.hex) ? shade.hex : undefined,
          ...(doc ? { image: doc.id } : {}),
        })
      }

      const categories = product.categories
        .map((slug) => categoryDocs[slug]?.id)
        .filter((id): id is string => Boolean(id))

      if (!categories.length) categories.push(categoryDocs['series'].id)

      await payload.create({
        collection: 'products',
        depth: 0,
        context: { disableRevalidate: true },
        data: {
          _status: 'published',
          title: product.title,
          slug: product.slug,
          category: categories,
          price: product.price ?? 0,
          shortDescription: product.description.slice(0, 300) || undefined,
          description: product.description ? richText([product.description]) : undefined,
          images: images.map((image) => image.id),
          shades,
          buyLinks: product.buyLinks
            .filter((link) => link.label && link.url)
            .map((link) => ({ retailer: link.label, url: link.url })),
          actions: product.buyLinks[0]
            ? [
                {
                  label: 'Buy Now',
                  url: product.buyLinks[0].url,
                  appearance: 'solid' as const,
                  icon: 'cart' as const,
                  newTab: true,
                },
              ]
            : [],
          reviews: product.reviews.map((review) => ({
            author: review.author,
            rating: review.rating,
            body: review.body,
          })),
          publishedAt: new Date().toISOString(),
        },
      })

      imported += 1
      payload.logger.info(
        `  [${index + 1}/${products.length}] ${product.title} — ${images.length} image(s), ${shades.length} shade(s), ${product.reviews.length} review(s)`,
      )
    } catch (error) {
      payload.logger.error(
        `  [${index + 1}/${products.length}] ${product.slug} FAILED: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Replacing the categories orphans every header link that pointed at one,
   * which renders as an empty dropdown. Rebuild the Products submenu from the
   * categories that now exist, leaving the rest of the nav untouched.
   */
  payload.logger.info('— Repointing the header nav at the new categories…')

  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  const navItems = (header.navItems ?? []).map((item) =>
    item.link?.label === 'Products'
      ? {
          ...item,
          subItems: CATEGORIES.map((category) => ({
            link: {
              type: 'reference' as const,
              reference: {
                relationTo: 'product-categories' as const,
                value: categoryDocs[category.slug].id,
              },
              label: category.title,
            },
          })),
        }
      : item,
  )

  await payload.updateGlobal({
    slug: 'header',
    data: { navItems },
    context: { disableRevalidate: true },
  })

  payload.logger.info(
    `\nImported ${imported}/${products.length} products and ${mediaByFile.size} images.`,
  )
  payload.logger.info('Run `rm -rf .next` before restarting the dev server.')

  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

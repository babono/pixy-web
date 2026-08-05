/**
 * Pulls the live pixy.co.id catalogue into `.pixy-scrape/` so it can be
 * imported into Payload. This is a migration of PIXY's own content into PIXY's
 * own new CMS, not third-party scraping — robots.txt allows all, and requests
 * are serialised with a delay so the old (PHP 7.3) box is never hammered.
 *
 * Output:
 *   .pixy-scrape/products.json   structured catalogue
 *   .pixy-scrape/images/*        every packshot referenced by a product
 *
 * Usage:
 *   npm run scrape:pixy              # full catalogue
 *   npm run scrape:pixy -- --limit 5 # smoke test
 *   npm run scrape:pixy -- --no-images
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import tls from 'node:tls'

const ORIGIN = 'https://www.pixy.co.id'
const OUT_DIR = path.resolve(process.cwd(), '.pixy-scrape')
const IMAGE_DIR = path.join(OUT_DIR, 'images')

/** Landing pages that list products rather than being products themselves. */
const CATEGORY_SLUGS = new Set([
  '4-beauty-benefits',
  'airy-series',
  'base-makeup',
  'cheek',
  'contouring',
  'cushion',
  'decorative',
  'eye',
  'face-mist',
  'facial-wash',
  'fixed-matte',
  'foundation',
  'glowssentials',
  'lips',
  'make-it-glow',
  'make-up-cleanser',
  'mask',
  'moisturizer',
  'new-in',
  'powder',
  'primer',
  'series',
  'skin-booster',
  'skin-care',
  'sunscreen',
  'wellness',
  'white-aqua',
])

/** The four top-level sections the new design ships with, plus Series. */
const ROOT_CATEGORIES = ['base-makeup', 'decorative', 'skin-care', 'wellness', 'series']

export type ScrapedShade = {
  hex: string
  image?: string
  name: string
}

export type ScrapedReview = {
  author: string
  avatar?: string
  body: string
  rating: number
  source?: string
}

export type ScrapedProduct = {
  buyLinks: { label: string; url: string }[]
  categories: string[]
  description: string
  images: string[]
  price: number | null
  priceLabel: string | null
  reviews: ScrapedReview[]
  shades: ScrapedShade[]
  slug: string
  title: string
  url: string
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const USER_AGENT = 'Mozilla/5.0 (compatible; PIXY-migration/1.0)'

/**
 * pixy.co.id serves only its leaf certificate, omitting the intermediate.
 * Browsers and macOS curl paper over this by fetching the issuer from the
 * cert's AIA extension; Node does not, so `fetch()` fails with "unable to
 * verify the first certificate". Pulling that intermediate once (over plain
 * HTTP, as the CA publishes it) and adding it to the trust store fixes it
 * without disabling verification.
 */
const AIA_URL = 'http://secure.globalsign.com/cacert/gsgccr6alphasslca2025.crt'

let caBundle: string[] | undefined

const derToPem = (der: Buffer): string =>
  `-----BEGIN CERTIFICATE-----\n${(der.toString('base64').match(/.{1,64}/g) ?? []).join('\n')}\n-----END CERTIFICATE-----\n`

const loadCa = async (): Promise<string[]> => {
  if (caBundle) return caBundle

  const cached = path.join(OUT_DIR, 'intermediate.pem')
  const onDisk = await readFile(cached, 'utf8').catch(() => '')

  if (onDisk.includes('BEGIN CERTIFICATE')) {
    caBundle = [...tls.rootCertificates, onDisk]
    return caBundle
  }

  const der = await new Promise<Buffer>((resolve, reject) => {
    http
      .get(AIA_URL, (response) => {
        const chunks: Buffer[] = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => resolve(Buffer.concat(chunks)))
      })
      .on('error', reject)
  })

  // The CA publishes DER; some mirrors serve PEM already
  const pem = der.toString('utf8').includes('BEGIN CERTIFICATE')
    ? der.toString('utf8')
    : derToPem(der)

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(cached, pem)

  caBundle = [...tls.rootCertificates, pem]
  return caBundle
}

const request = async (url: string): Promise<Buffer> => {
  const ca = await loadCa()

  return new Promise<Buffer>((resolve, reject) => {
    https
      .get(url, { ca, headers: { 'User-Agent': USER_AGENT } }, (response) => {
        if (response.statusCode && response.statusCode >= 400) {
          response.resume()
          reject(new Error(`HTTP ${response.statusCode}`))
          return
        }

        const chunks: Buffer[] = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => resolve(Buffer.concat(chunks)))
      })
      .on('error', reject)
  })
}

/** Serialised with a delay; the source site is a single small PHP host. */
const fetchPage = async (url: string, attempt = 1): Promise<string> => {
  try {
    return (await request(url)).toString('utf8')
  } catch (error) {
    if (attempt >= 3) throw error
    await sleep(1500 * attempt)
    return fetchPage(url, attempt + 1)
  }
}

const decode = (value: string): string =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&rsquo;/g, '’')
    .trim()

const stripTags = (html: string): string => decode(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' '))

const matchAll = (html: string, pattern: RegExp): RegExpMatchArray[] => [...html.matchAll(pattern)]

const firstGroup = (html: string, pattern: RegExp): string | undefined =>
  html.match(pattern)?.[1]?.trim()

/** "IDR 46.000" → 46000 */
const parsePrice = (label: string | null): number | null => {
  if (!label) return null
  const digits = label.replace(/[^\d]/g, '')
  return digits ? Number(digits) : null
}

const slugFromUrl = (url: string): string => url.replace(/\/+$/, '').split('/').pop() ?? ''

/** Known shorteners resolve to a retailer that the hostname alone would hide. */
const RETAILERS: Record<string, string> = {
  'beautyhaulofficial.com': 'Beauty Haul',
  'blibli.com': 'Blibli',
  'lazada.co.id': 'Lazada',
  'shopee.co.id': 'Shopee',
  'shp.ee': 'Shopee',
  'sociolla.com': 'Sociolla',
  'tiktok.com': 'TikTok Shop',
  'tokopedia.com': 'Tokopedia',
}

const retailerFromUrl = (url: string): string => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    const key = Object.keys(RETAILERS).find((domain) => host.endsWith(domain))
    return key ? RETAILERS[key] : host
  } catch {
    return ''
  }
}

const collectProductUrls = async (): Promise<Map<string, Set<string>>> => {
  // slug → the category pages it appeared on, so one product can carry several
  const found = new Map<string, Set<string>>()

  for (const category of ROOT_CATEGORIES) {
    const html = await fetchPage(`${ORIGIN}/product/${category}`)

    for (const match of matchAll(html, /href="(https:\/\/www\.pixy\.co\.id\/product\/[^"]+)"/g)) {
      const slug = slugFromUrl(match[1])
      if (!slug || CATEGORY_SLUGS.has(slug)) continue

      if (!found.has(slug)) found.set(slug, new Set())
      found.get(slug)!.add(category)
    }

    console.log(`  ${category}: ${found.size} unique products so far`)
    await sleep(600)
  }

  return found
}

const parseProduct = (html: string, slug: string, categories: string[]): ScrapedProduct | null => {
  // Category landing pages share the /product/ prefix but carry no product
  // name, so their absence is the reliable signal that this isn't a product.
  const title = firstGroup(html, /<div class="name-product">([\s\S]*?)<\/div>/)

  if (!title) return null

  const priceLabel = firstGroup(html, /<div class="price-product">([\s\S]*?)<\/div>/) ?? null

  const description = stripTags(
    firstGroup(html, /<div class="txt-product">([\s\S]*?)<\/div>\s*<\/div>/) ?? '',
  )

  // Swatches carry both the hex and the human-readable shade name
  const shades: ScrapedShade[] = matchAll(
    html,
    /<div class="box-color" data-id="([^"]*)" data-name="([^"]*)"/g,
  ).map((match) => ({ hex: `#${match[1]}`, name: decode(match[2]) }))

  // Each `box-hide` block is one shade's image set, in the same order
  const shadeImages = matchAll(
    html,
    /<div class="box-hide[^"]*"[^>]*data-name="([^"]*)"[\s\S]*?<img src="([^"]+)"/g,
  )

  for (const [, name, src] of shadeImages) {
    const shade = shades.find((entry) => entry.name === decode(name))
    if (shade && !shade.image) shade.image = src
  }

  const images = [
    ...new Set(
      matchAll(html, /<img src="(https:\/\/www\.pixy\.co\.id\/lib\/images\/product\/[^"]+)"/g).map(
        (match) => match[1],
      ),
    ),
  ]

  const buyLinks = matchAll(
    html,
    /<ul class="l-tutorial">([\s\S]*?)<\/ul>/g,
  ).flatMap(([, block]) =>
    matchAll(block, /<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g).map((match) => ({
      // Some entries are image links with no text, so fall back to the host
      label: stripTags(match[2]) || retailerFromUrl(match[1]),
      url: match[1],
    })),
  )

  /**
   * Reviews are split on their `item` wrappers before parsing. Matching across
   * the whole block with a lazy regex merged every review into one and summed
   * every star bar on the page into a single absurd rating.
   */
  const reviewStart = html.indexOf('customer_review')
  const reviews: ScrapedReview[] = []

  if (reviewStart > -1) {
    const section = html.slice(reviewStart, html.indexOf('<footer', reviewStart) + 1 || undefined)

    for (const block of section.split('<div class="item">').slice(1)) {
      const body = firstGroup(block, /<p>([\s\S]*?)<\/p>/)
      const author = firstGroup(block, /<h4>([\s\S]*?)<\/h4>/)

      if (!body || !author) continue

      // One `<div><span style="width:N%">` per star; N encodes that star's fill
      const stars = matchAll(block, /<div><span style="width:\s*(\d+)%"/g).map((entry) =>
        Number(entry[1]),
      )
      const rating = stars.reduce((total, width) => total + width / 100, 0)

      reviews.push({
        author: stripTags(author),
        avatar: firstGroup(block, /<div class="img"><img src="([^"]*)"/) || undefined,
        body: stripTags(body),
        // Clamped: the source markup occasionally renders more than five bars
        rating: stars.length ? Math.min(5, Math.round(rating * 10) / 10) : 5,
        source: stripTags(block.match(/Sumber:\s*([^<]*)/)?.[1] ?? '') || undefined,
      })
    }
  }

  return {
    buyLinks,
    categories,
    description,
    images,
    price: parsePrice(priceLabel),
    priceLabel,
    reviews,
    shades,
    slug,
    title: stripTags(title),
    url: `${ORIGIN}/product/${slug}`,
  }
}

const downloadImages = async (products: ScrapedProduct[]): Promise<void> => {
  const seen = new Set<string>()
  let saved = 0

  for (const product of products) {
    for (const src of product.images) {
      if (seen.has(src)) continue
      seen.add(src)

      const name = decodeURIComponent(src.split('/').pop() ?? '')
      const target = path.join(IMAGE_DIR, name)

      // Skip anything already on disk so re-runs are cheap
      if (await readFile(target).then(() => true, () => false)) continue

      try {
        await writeFile(target, await request(src))
        saved += 1
      } catch {
        // A missing packshot shouldn't abort the migration
      }

      await sleep(200)
    }
  }

  console.log(`Downloaded ${saved} new image(s) (${seen.size} referenced)`)
}

const main = async () => {
  const args = process.argv.slice(2)
  const limitFlag = args.indexOf('--limit')
  const limit = limitFlag > -1 ? Number(args[limitFlag + 1]) : Infinity

  await mkdir(IMAGE_DIR, { recursive: true })

  console.log('Collecting product URLs…')
  const urls = await collectProductUrls()

  const entries = [...urls.entries()].slice(0, limit)
  console.log(`\nScraping ${entries.length} product page(s)…`)

  const products: ScrapedProduct[] = []

  for (const [index, [slug, categories]] of entries.entries()) {
    try {
      const html = await fetchPage(`${ORIGIN}/product/${slug}`)
      const product = parseProduct(html, slug, [...categories])

      if (!product) {
        console.log(`  [${index + 1}/${entries.length}] ${slug} — skipped (category page)`)
      } else {
        products.push(product)
        console.log(
          `  [${index + 1}/${entries.length}] ${product.title} — ` +
            `${product.shades.length} shade(s), ${product.reviews.length} review(s), ${product.priceLabel ?? 'no price'}`,
        )
      }
    } catch (error) {
      console.warn(`  [${index + 1}/${entries.length}] ${slug} FAILED: ${String(error)}`)
    }

    await sleep(500)
  }

  await writeFile(path.join(OUT_DIR, 'products.json'), JSON.stringify(products, null, 2))
  console.log(`\nWrote ${products.length} products to .pixy-scrape/products.json`)

  if (!args.includes('--no-images')) await downloadImages(products)
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}\n`)
  process.exit(1)
})

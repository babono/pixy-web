import type { File } from 'payload'

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

/**
 * Real artwork extracted from the PIXY Figma file (`npm run figma:assets`) and
 * committed under `public/pixy/`. The seed prefers these over the generated
 * placeholder art in `./images`, which now only covers products whose Figma
 * frames don't include a packshot.
 *
 * Everything is normalised to WebP so Payload's generated image sizes and the
 * Cloudinary public IDs stay consistent with the rest of the seed.
 */

const ASSET_ROOT = path.resolve(process.cwd(), 'public', 'pixy')

/**
 * SVGs are rasterised at a high density first — sharp renders them at their
 * intrinsic size otherwise, which for the certification marks is far too small
 * to survive Payload's resizing.
 */
export const asset = async (relativePath: string, name: string): Promise<File> => {
  const source = path.join(ASSET_ROOT, relativePath)
  const input = await readFile(source)

  const data = await sharp(input, { density: 300 })
    .resize({ fit: 'inside', width: 1600, withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer()

  return { name: `${name}.webp`, data, mimetype: 'image/webp', size: data.byteLength }
}

/**
 * Wordmarks. Both are the same vector artwork recoloured — brand rose for the
 * white header pill, reversed white for the rose footer. The `logo-dark.png`
 * raster is deliberately unused: it carries the "My Beauty, My Energy" lockup,
 * which the header design does not include.
 */
export const logoAssets = {
  rose: 'brand/logo-rose.svg',
  white: 'brand/logo-white.svg',
}

/** Hero slides, in carousel order. */
export const heroAssets = [
  { file: 'photos/hero-model.png', name: 'pixy-hero-1' },
  { file: 'photos/hero-pastel.png', name: 'pixy-hero-2' },
  { file: 'photos/hero-teal.png', name: 'pixy-hero-3' },
]

/** Keyed by category slug so a reordered taxonomy can't silently mismatch. */
export const categoryAssets: Record<string, string> = {
  'base-makeup': 'photos/category-base-makeup.png',
  decoratives: 'photos/category-decoratives.png',
  'skin-care': 'photos/category-skin-care.png',
  wellness: 'photos/category-wellness.png',
}

/** Certification marks, in the order the brand-values band lists them. */
export const valueAssets = [
  'brand/cert-halal.svg',
  'brand/cert-bpom.svg',
  'brand/cert-vegan.svg',
]

/** Keyed by marketplace name as it appears in the seed. */
export const marketplaceAssets: Record<string, string> = {
  Lazada: 'brand/shop-lazada.png',
  Shopee: 'brand/shop-shopee.png',
  'TikTok Shop': 'brand/shop-tiktok.png',
  Tokopedia: 'brand/shop-tokopedia.png',
}

/** Editorial photography, keyed by post slug. */
export const postAssets: Record<string, string> = {
  'artful-makeup-techniques-creative-tips': 'photos/article-application.png',
  'glam-up-your-look-essential-makeup-tips': 'photos/article-bold-look.png',
  'pixy-latest-blush-on-lineup-2026': 'photos/article-palette.png',
  'radiant-skin-secrets-top-skincare-tips': 'photos/article-skincare.png',
}

/**
 * Only two products have real key visuals in the Figma. The rest keep the
 * generated packshots, so the demo still shows a full catalogue.
 */
export const productAssets: Record<string, string> = {
  'pixy-mattenetic-transferproof-lipstick': 'photos/product-mattenetic-lipstick.png',
  'pixy-twc-perfect-fit-07-cream-beige-refill': 'photos/product-twc-perfect-fit.png',
}

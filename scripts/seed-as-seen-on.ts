import 'dotenv/config'

import type { File } from 'payload'
import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '../src/payload.config'
import { uploadVideos } from './upload-videos'

/**
 * Uploads `public/video/*.mp4` to Cloudinary and rebuilds the "As Seen On" feed
 * from them.
 *
 * Posters are real frames: Cloudinary renders a still one second into each clip,
 * which is fetched and stored as a media document. `thumbnail` is a required
 * upload relationship, so a URL alone won't do.
 *
 * Every card links to one product for now.
 *
 * Re-running replaces both the clips and the feed rather than duplicating.
 *
 * Usage:
 *   npm run seed:asseenon
 */

const PRODUCT_SLUG = 'pixy-hyperlast-glazed-lip-vinyl'

const run = async () => {
  const payload = await getPayload({ config })

  payload.logger.info('Uploading clips to Cloudinary…')
  const clips = await uploadVideos((message) => payload.logger.info(message))

  const { docs: products } = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 1,
    pagination: false,
    where: { slug: { equals: PRODUCT_SLUG } },
  })

  const product = products[0]
  if (!product) throw new Error(`No product with slug "${PRODUCT_SLUG}"`)

  payload.logger.info(`\nBuilding poster frames…`)

  /** Fetches Cloudinary's still and stores it as media, replacing any previous one. */
  const poster = async (url: string, name: string, alt: string): Promise<string> => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Poster fetch failed (${response.status}) for ${name}`)

    const data = await sharp(Buffer.from(await response.arrayBuffer()))
      .resize({ fit: 'inside', width: 800, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()

    const file: File = {
      data,
      mimetype: 'image/webp',
      name: `${name}.webp`,
      size: data.byteLength,
    }

    // Same delete-then-create as the hero script: leaving the old file on the
    // storage backend makes Payload suffix the new one and drift the name.
    const { docs } = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 20,
      pagination: false,
      where: { filename: { like: name } },
    })

    for (const doc of docs) {
      if (!new RegExp(`^${name}(-\\d+)?\\.webp$`).test(doc.filename ?? '')) continue
      await payload.delete({
        collection: 'media',
        id: doc.id,
        context: { disableRevalidate: true },
      })
    }

    const created = await payload.create({
      collection: 'media',
      context: { disableRevalidate: true },
      data: { alt },
      file,
    })

    return String(created.id)
  }

  // Rewritten wholesale: the feed mirrors the folder, so a clip that's been
  // removed from disk shouldn't linger in the collection.
  const { docs: existing } = await payload.find({
    collection: 'as-seen-on',
    depth: 0,
    limit: 200,
    pagination: false,
  })

  for (const doc of existing) {
    await payload.delete({
      collection: 'as-seen-on',
      id: doc.id,
      context: { disableRevalidate: true },
    })
  }

  if (existing.length) payload.logger.info(`  removed ${existing.length} existing item(s)`)

  for (const [index, clip] of clips.entries()) {
    const name = clip.source.replace(/\.[^.]+$/, '')
    const thumbnail = await poster(
      clip.posterUrl,
      `pixy-asseenon-${name}`,
      `${product.title} — clip ${index + 1}`,
    )

    await payload.create({
      collection: 'as-seen-on',
      depth: 0,
      context: { disableRevalidate: true },
      data: {
        title: `${product.title} — clip ${index + 1}`,
        videoUrl: clip.url,
        thumbnail,
        product: product.id,
        sortOrder: index + 1,
      },
    })

    payload.logger.info(`  ${String(index + 1).padStart(2)}. ${name} — poster + item created`)
  }

  payload.logger.info('\nRun `rm -rf .next` before restarting the dev server.')

  process.exit(0)
}

run().catch((error) => {
  console.error(JSON.stringify((error as { cause?: unknown })?.cause ?? error, null, 2))
  process.exit(1)
})

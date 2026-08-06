import 'dotenv/config'

import { getPayload } from 'payload'

import type { Media } from '../src/payload-types'
import config from '../src/payload.config'
import { asset, heroAssets } from '../src/endpoints/seed/pixy/assets'

/**
 * Pushes the hero artwork in `public/pixy/photos/` at the live home page.
 *
 * The full seed (`npm run seed`) would do this too, but it clears the whole
 * catalogue first — and the 94 live products came from `import:pixy`, not the
 * seed, so they would not come back. This touches the three hero slides and
 * nothing else.
 *
 * Usage:
 *   npm run update:hero
 */

const run = async () => {
  const payload = await getPayload({ config })

  /**
   * Uploads under a fixed filename, clearing anything already sitting there.
   *
   * Updating a doc in place doesn't work: the old file stays on the storage
   * backend, so Payload sidesteps the collision by suffixing the new one
   * (`pixy-hero-1-desktop-1.webp`). The next run then can't find the canonical
   * name and creates a *second* doc. Deleting first removes the remote file
   * too, which keeps names — and doc count — stable across runs.
   */
  const put = async (file: string, name: string, alt: string): Promise<Media> => {
    const upload = await asset(file, name)
    const taken = new RegExp(`^${name}(-\\d+)?\\.webp$`)

    const { docs } = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 100,
      pagination: false,
      where: { filename: { like: name } },
    })

    for (const doc of docs) {
      if (!taken.test(doc.filename ?? '')) continue
      await payload.delete({
        collection: 'media',
        id: doc.id,
        context: { disableRevalidate: true },
      })
      payload.logger.info(`  ${doc.filename} — removed`)
    }

    payload.logger.info(`  ${name}.webp — uploading (${(upload.size / 1024).toFixed(0)} KB)`)
    return payload.create({
      collection: 'media',
      context: { disableRevalidate: true },
      data: { alt },
      file: upload,
    })
  }

  payload.logger.info('Uploading hero artwork…')

  const pairs: { desktop: Media; mobile: Media }[] = []
  for (const [index, slide] of heroAssets.entries()) {
    const alt = `PIXY campaign banner ${index + 1}`
    pairs.push({
      desktop: await put(slide.file, slide.name, alt),
      mobile: await put(slide.mobileFile, slide.mobileName, alt),
    })
  }

  payload.logger.info('Repointing the home page carousel…')

  const { docs } = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    pagination: false,
    where: { slug: { equals: 'home' } },
  })

  const home = docs[0]
  if (!home) throw new Error('No page with slug "home" — has the seed run?')

  const layout = (home.layout ?? []).map((block) => {
    if (block.blockType !== 'heroCarousel') return block

    return {
      ...block,
      slides: block.slides.map((slide, index) => {
        const pair = pairs[index]
        // Extra slides an editor added by hand keep whatever they point at.
        if (!pair) return slide

        return { ...slide, image: pair.desktop.id, imageMobile: pair.mobile.id }
      }),
    }
  })

  await payload.update({
    collection: 'pages',
    id: home.id,
    context: { disableRevalidate: true },
    // `meta.image` is deliberately left alone: the share card is the branded
    // `public/pixy-og.png`, not whatever artwork the carousel happens to hold.
    data: { layout },
  })

  payload.logger.info(`\nUpdated ${pairs.length} slide(s).`)
  payload.logger.info('Run `rm -rf .next` before restarting the dev server.')

  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

import { readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

/**
 * Draws the share card used when the site is linked on social platforms.
 *
 * Committed as a static file rather than generated per request: scrapers fetch
 * the URL once and cache it, and several of them won't wait on a render.
 *
 * PNG rather than WebP — Facebook and X both handle WebP unreliably, and the
 * gradient compresses well enough that the size difference doesn't matter.
 *
 * Usage:
 *   npm run generate:og
 */

const WIDTH = 1200
const HEIGHT = 630

// From globals.css: the blush ramp and the brand rose.
const BLUSH_300 = '#f2c6cf'
const BLUSH_100 = '#f6dadf'
const PINK = '#e8a2b2'
const ROSE = '#b46b7a'

const LOGO = path.resolve(process.cwd(), 'public', 'pixy', 'brand', 'logo-rose.svg')
const OUTPUT = path.resolve(process.cwd(), 'public', 'pixy-og.png')

/** The wordmark is 104×32 in the source file. */
const LOGO_WIDTH = 460
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 32) / 104)

const run = async () => {
  // Same 135° three-stop ramp as `.pixy-gradient-blush`.
  const background = Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="blush" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${BLUSH_300}" />
          <stop offset="50%" stop-color="${BLUSH_100}" />
          <stop offset="100%" stop-color="${PINK}" />
        </linearGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#blush)" />
    </svg>
  `)

  const logo = await sharp(await readFile(LOGO), { density: 600 })
    .resize({ width: LOGO_WIDTH })
    .png()
    .toBuffer()

  // Wordmark sits slightly above centre so the pair reads as one block.
  const logoTop = Math.round(HEIGHT / 2 - LOGO_HEIGHT / 2 - 26)

  const caption = Buffer.from(`
    <svg width="${WIDTH}" height="120" xmlns="http://www.w3.org/2000/svg">
      <text
        x="${WIDTH / 2}"
        y="70"
        fill="${ROSE}"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="30"
        font-weight="500"
        letter-spacing="7"
        text-anchor="middle"
      >OFFICIAL WEBSITE</text>
    </svg>
  `)

  await sharp(background)
    .composite([
      { input: logo, left: Math.round((WIDTH - LOGO_WIDTH) / 2), top: logoTop },
      { input: caption, left: 0, top: logoTop + LOGO_HEIGHT + 14 },
    ])
    .png({ quality: 90 })
    .toBuffer()
    .then((data) => writeFile(OUTPUT, data))

  const { size } = await stat(OUTPUT)
  console.log(
    `Wrote ${path.relative(process.cwd(), OUTPUT)} — ${WIDTH}\u00d7${HEIGHT}, ${Math.round(size / 1024)} KB`,
  )
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

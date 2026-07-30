import type { File } from 'payload'

import sharp from 'sharp'

/**
 * Placeholder artwork for the PIXY demo.
 *
 * The real campaign and packshot photography isn't in this repo, so the seed
 * draws stand-in art as SVG and rasterises it with sharp. That keeps seeding
 * offline and deterministic — swap any of these for real uploads in the admin
 * and nothing else has to change.
 */

export type Palette = {
  /** Gradient start (top) */
  from: string
  /** Gradient end (bottom) */
  to: string
  /** Band + accent colour */
  accent: string
}

export const palettes = {
  sky: { from: '#8FCBEE', to: '#E8F4FB', accent: '#2E6C9A' },
  blush: { from: '#F6C9D8', to: '#FDF0F4', accent: '#B5697F' },
  lavender: { from: '#C9B7E8', to: '#F1EBFA', accent: '#6E5697' },
  mint: { from: '#A9E0D3', to: '#EDFAF6', accent: '#2F7F6C' },
  rose: { from: '#D98BA2', to: '#FBE4EB', accent: '#9C5568' },
} satisfies Record<string, Palette>

const svgToWebp = async (svg: string, name: string): Promise<File> => {
  const data = await sharp(Buffer.from(svg)).webp({ quality: 82 }).toBuffer()

  return {
    name: `${name}.webp`,
    data,
    mimetype: 'image/webp',
    size: data.byteLength,
  }
}

const font = 'Helvetica Neue, Helvetica, Arial, sans-serif'

/** Labels are authored as plain copy, so `&` and friends need escaping for XML */
const xml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const gradientDefs = (palette: Palette) => `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette.from}" />
      <stop offset="100%" stop-color="${palette.to}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="52%" r="52%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
  </defs>`

/** A powder compact: rounded case with a circular pan */
const compactShape = `
  <g>
    <rect x="330" y="380" width="340" height="250" rx="34" fill="#ffffff" />
    <rect x="330" y="380" width="340" height="250" rx="34" fill="#000000" opacity="0.04" />
    <ellipse cx="500" cy="500" rx="118" ry="82" fill="#E7B590" />
    <ellipse cx="500" cy="492" rx="118" ry="82" fill="#F0C7A6" />
    <rect x="330" y="596" width="340" height="34" rx="17" fill="#F3E4DA" />
  </g>`

/** Two lipstick bullets, one open and one capped */
const lipstickShape = `
  <g>
    <rect x="378" y="330" width="86" height="300" rx="26" fill="#ffffff" />
    <rect x="392" y="262" width="58" height="90" rx="24" fill="#E8A9B8" />
    <rect x="536" y="360" width="86" height="270" rx="26" fill="#F7E7EC" />
    <rect x="550" y="300" width="58" height="80" rx="24" fill="#ffffff" />
    <ellipse cx="500" cy="662" rx="230" ry="40" fill="#ffffff" opacity="0.6" />
  </g>`

/** A serum bottle with a dropper cap */
const bottleShape = `
  <g>
    <rect x="410" y="380" width="180" height="250" rx="30" fill="#ffffff" opacity="0.92" />
    <rect x="452" y="300" width="96" height="90" rx="18" fill="#E9DFF6" />
    <rect x="470" y="262" width="60" height="52" rx="16" fill="#ffffff" />
    <rect x="440" y="470" width="120" height="120" rx="18" fill="#F0E6C8" opacity="0.8" />
    <ellipse cx="500" cy="662" rx="220" ry="38" fill="#ffffff" opacity="0.6" />
  </g>`

const shapes = {
  compact: compactShape,
  lipstick: lipstickShape,
  bottle: bottleShape,
}

export type PackshotShape = keyof typeof shapes

/** Square product packshot in the style of a marketplace listing image */
export const packshot = ({
  bandLabel,
  name,
  palette,
  shape,
  variantLabel,
}: {
  bandLabel: string
  name: string
  palette: Palette
  shape: PackshotShape
  /** Small copy top-right, e.g. "12 Hours Longlasting" */
  variantLabel?: string
}): Promise<File> =>
  svgToWebp(
    `<svg width="1000" height="1000" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
      ${gradientDefs(palette)}
      <rect width="1000" height="1000" fill="url(#bg)" />
      <circle cx="500" cy="500" r="340" fill="url(#glow)" />
      ${shapes[shape]}
      <text x="56" y="92" font-family="${font}" font-size="52" font-weight="500" letter-spacing="10" fill="#ffffff">PIXY</text>
      <text x="56" y="130" font-family="${font}" font-size="20" letter-spacing="5" fill="#ffffff" opacity="0.9">OFFICIAL STORE</text>
      ${
        variantLabel
          ? `<text x="944" y="112" text-anchor="end" font-family="${font}" font-size="30" font-style="italic" fill="#ffffff" opacity="0.95">${xml(variantLabel)}</text>`
          : ''
      }
      <rect x="0" y="892" width="1000" height="108" fill="${palette.accent}" />
      <text x="500" y="958" text-anchor="middle" font-family="${font}" font-size="34" letter-spacing="5" fill="#ffffff">${xml(bandLabel)}</text>
    </svg>`,
    name,
  )

/** Wide campaign banner for the hero carousel */
export const heroBanner = ({
  name,
  palette,
}: {
  name: string
  palette: Palette
}): Promise<File> =>
  svgToWebp(
    `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.accent}" />
          <stop offset="55%" stop-color="${palette.from}" />
          <stop offset="100%" stop-color="${palette.to}" />
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#bg)" />
      <circle cx="1420" cy="420" r="360" fill="#ffffff" opacity="0.18" />
      <circle cx="1620" cy="760" r="240" fill="#ffffff" opacity="0.12" />
      <ellipse cx="1320" cy="900" rx="520" ry="220" fill="${palette.accent}" opacity="0.25" />
      <circle cx="300" cy="880" r="180" fill="#ffffff" opacity="0.08" />
    </svg>`,
    name,
  )

/** Category tile art — a soft still-life silhouette on the tile tint */
export const categoryTile = ({
  name,
  palette,
  shape,
}: {
  name: string
  palette: Palette
  shape: PackshotShape
}): Promise<File> =>
  svgToWebp(
    `<svg width="900" height="700" viewBox="0 0 900 700" xmlns="http://www.w3.org/2000/svg">
      ${gradientDefs(palette)}
      <rect width="900" height="700" fill="url(#bg)" />
      <circle cx="450" cy="330" r="250" fill="url(#glow)" />
      <g transform="translate(-50, -110) scale(1.0)">${shapes[shape]}</g>
    </svg>`,
    name,
  )

/** Round certification badge used by the brand-values list */
export const valueIcon = ({ label, name }: { label: string; name: string }): Promise<File> =>
  svgToWebp(
    `<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="76" fill="#FBE6ED" />
      <circle cx="80" cy="80" r="60" fill="#ffffff" />
      <text x="80" y="92" text-anchor="middle" font-family="${font}" font-size="34" font-weight="600" fill="#B5697F">${xml(label)}</text>
    </svg>`,
    name,
  )

/** Square marketplace logo tile */
export const marketplaceLogo = ({
  color,
  initial,
  name,
}: {
  color: string
  initial: string
  name: string
}): Promise<File> =>
  svgToWebp(
    `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="30" fill="${color}" />
      <text x="64" y="86" text-anchor="middle" font-family="${font}" font-size="66" font-weight="700" fill="#ffffff">${xml(initial)}</text>
    </svg>`,
    name,
  )

/** Editorial image for Tips &amp; Reviews cards */
export const editorialImage = ({
  name,
  palette,
}: {
  name: string
  palette: Palette
}): Promise<File> =>
  svgToWebp(
    `<svg width="1200" height="900" viewBox="0 0 1200 900" xmlns="http://www.w3.org/2000/svg">
      ${gradientDefs(palette)}
      <rect width="1200" height="900" fill="url(#bg)" />
      <circle cx="380" cy="330" r="230" fill="#ffffff" opacity="0.35" />
      <circle cx="820" cy="520" r="290" fill="${palette.accent}" opacity="0.22" />
      <ellipse cx="600" cy="820" rx="520" ry="150" fill="#ffffff" opacity="0.3" />
    </svg>`,
    name,
  )

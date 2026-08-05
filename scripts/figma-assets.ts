/**
 * Downloads the actual artwork out of a Figma file into `.figma/assets/`.
 *
 * Two different things are needed, via two different endpoints:
 *
 *   photos/  — the bitmaps someone uploaded into Figma (hero photography,
 *              product packshots, category art). `GET /files/:key/images`
 *              returns a map of imageRef → CDN URL; the refs live on the
 *              `fills` of whichever node paints them.
 *   icons/   — logos, certification badges, social and marketplace marks.
 *              These are vector nodes, so they are *rendered* to SVG through
 *              `GET /images/:key?format=svg` rather than downloaded.
 *
 * Usage:
 *   npm run figma:assets -- "<figma url>"
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = path.resolve(process.cwd(), '.figma', 'assets')
const API = 'https://api.figma.com/v1'

type Paint = { imageRef?: string; type: string; visible?: boolean }
type FigmaNode = {
  absoluteBoundingBox?: { height: number; width: number }
  children?: FigmaNode[]
  fills?: Paint[]
  id: string
  name: string
  type: string
  visible?: boolean
}

/**
 * Vector artwork worth extracting, as opposed to layout frames that merely
 * happen to be small. Matched against the layer name.
 */
const ICON_PATTERNS = [
  /^pixy logo$/i,
  /^halal$/i,
  /^bpom$/i,
  /^badan_pom/i,
  /^spa$/i,
  /^socials$/i,
  /^ecommerce logo$/i,
  /^logo/i,
]

const readToken = async (): Promise<string> => {
  const { readFile } = await import('node:fs/promises')
  const fromEnv = process.env.FIGMA_TOKEN?.trim()
  if (fromEnv) return fromEnv

  const fromFile = await readFile(path.resolve(process.cwd(), '.figma-token'), 'utf8').catch(
    () => '',
  )
  if (fromFile.trim()) return fromFile.trim()

  throw new Error('No Figma token. See `npm run figma:pull` for setup.')
}

const api = async <T>(token: string, endpoint: string): Promise<T> => {
  const response = await fetch(`${API}${endpoint}`, { headers: { 'X-Figma-Token': token } })

  if (!response.ok) {
    throw new Error(`Figma ${response.status} on ${endpoint}`)
  }

  return response.json() as Promise<T>
}

const parseKey = (input: string): string => {
  const match = input.match(/figma\.com\/(?:file|design|proto)\/([A-Za-z0-9]+)/)
  const key = match?.[1] ?? (/^[A-Za-z0-9]{10,}$/.test(input) ? input : undefined)
  if (!key) throw new Error(`Could not find a file key in "${input}".`)
  return key
}

const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'asset'

const download = async (url: string, file: string): Promise<boolean> => {
  const response = await fetch(url)
  if (!response.ok) return false

  await writeFile(file, Buffer.from(await response.arrayBuffer()))
  return true
}

/** Ensures two layers with the same name don't overwrite each other. */
const uniqueName = (used: Map<string, number>, base: string): string => {
  const seen = used.get(base) ?? 0
  used.set(base, seen + 1)
  return seen === 0 ? base : `${base}-${seen + 1}`
}

const main = async () => {
  const url = process.argv.slice(2).find((arg) => !arg.startsWith('--'))
  if (!url) throw new Error('Usage: npm run figma:assets -- "<figma url>"')

  const key = parseKey(url)
  const token = await readToken()

  await mkdir(path.join(OUT_DIR, 'photos'), { recursive: true })
  await mkdir(path.join(OUT_DIR, 'icons'), { recursive: true })

  console.log(`Reading ${key}…`)
  const file = await api<{ document: FigmaNode }>(token, `/files/${key}`)

  // One pass over the tree collecting both kinds of asset.
  const imageNodes: { name: string; ref: string }[] = []
  const iconNodes: { id: string; name: string }[] = []
  const seenRefs = new Set<string>()
  const seenIcons = new Set<string>()

  const walk = (node: FigmaNode) => {
    if (node.visible === false) return

    for (const paint of node.fills ?? []) {
      if (paint.type === 'IMAGE' && paint.imageRef && !seenRefs.has(paint.imageRef)) {
        seenRefs.add(paint.imageRef)
        imageNodes.push({ name: node.name, ref: paint.imageRef })
      }
    }

    if (ICON_PATTERNS.some((pattern) => pattern.test(node.name)) && !seenIcons.has(node.name)) {
      seenIcons.add(node.name)
      iconNodes.push({ id: node.id, name: node.name })
    }

    node.children?.forEach(walk)
  }

  walk(file.document)

  console.log(`Found ${imageNodes.length} image fill(s), ${iconNodes.length} vector asset(s)`)

  // --- photos: resolve every imageRef in one call, then fetch each bitmap ---
  if (imageNodes.length) {
    const { meta } = await api<{ meta: { images: Record<string, string> } }>(
      token,
      `/files/${key}/images`,
    )

    const used = new Map<string, number>()
    let saved = 0

    for (const { name, ref } of imageNodes) {
      const source = meta.images[ref]
      if (!source) continue

      // Figma serves these as PNG regardless of what was uploaded
      const filename = `${uniqueName(used, slug(name))}.png`
      if (await download(source, path.join(OUT_DIR, 'photos', filename))) {
        saved += 1
        console.log(`  photos/${filename}`)
      }
    }

    console.log(`Saved ${saved} photo(s)`)
  }

  // --- icons: render the vector nodes to SVG ---
  if (iconNodes.length) {
    const { images } = await api<{ images: Record<string, string | null> }>(
      token,
      `/images/${key}?ids=${encodeURIComponent(iconNodes.map((n) => n.id).join(','))}&format=svg`,
    )

    const used = new Map<string, number>()
    let saved = 0

    for (const { id, name } of iconNodes) {
      const source = images[id]
      if (!source) continue

      const filename = `${uniqueName(used, slug(name))}.svg`
      if (await download(source, path.join(OUT_DIR, 'icons', filename))) {
        saved += 1
        console.log(`  icons/${filename}`)
      }
    }

    console.log(`Saved ${saved} icon(s)`)
  }

  console.log(`\nAssets in ${path.relative(process.cwd(), OUT_DIR)}`)
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}\n`)
  process.exit(1)
})

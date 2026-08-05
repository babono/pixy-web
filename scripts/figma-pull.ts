/**
 * Pulls a Figma file down into `.figma/` so the design can be implemented from
 * measured values rather than eyeballed screenshots.
 *
 * Produces three things per run:
 *   .figma/<frame>.png    rendered frames at 2x, to look at
 *   .figma/spec.json      the trimmed node tree — boxes, fills, type, layout
 *   .figma/spec.md        a readable digest: palette, type ramp, frame outlines
 *
 * Usage:
 *   FIGMA_TOKEN=... npm run figma:pull -- "<figma url>"
 *   npm run figma:pull -- "<figma url>" --node 1:234
 *
 * The token is read from FIGMA_TOKEN or `.figma-token`; both stay out of git.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = path.resolve(process.cwd(), '.figma')
const API = 'https://api.figma.com/v1'

type Vector = { x: number; y: number }
type Rect = { height: number; width: number; x: number; y: number }
type Paint = {
  color?: { a?: number; b: number; g: number; r: number }
  gradientHandlePositions?: Vector[]
  gradientStops?: { color: { a?: number; b: number; g: number; r: number }; position: number }[]
  opacity?: number
  type: string
  visible?: boolean
}
type TypeStyle = {
  fontFamily?: string
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  lineHeightPx?: number
  textCase?: string
}
type FigmaNode = {
  absoluteBoundingBox?: Rect
  backgroundColor?: Paint['color']
  characters?: string
  children?: FigmaNode[]
  cornerRadius?: number
  counterAxisAlignItems?: string
  fills?: Paint[]
  id: string
  itemSpacing?: number
  layoutMode?: string
  name: string
  opacity?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  primaryAxisAlignItems?: string
  rectangleCornerRadii?: number[]
  strokeWeight?: number
  strokes?: Paint[]
  style?: TypeStyle
  type: string
  visible?: boolean
}

/** Figma URLs come in /file/, /design/ and /proto/ flavours; all carry the key in the same slot. */
const parseUrl = (input: string): { key: string; nodeId?: string } => {
  const keyMatch = input.match(/figma\.com\/(?:file|design|proto)\/([A-Za-z0-9]+)/)
  const key = keyMatch?.[1] ?? (/^[A-Za-z0-9]{10,}$/.test(input) ? input : undefined)

  if (!key) {
    throw new Error(`Could not find a file key in "${input}". Paste the full Figma URL.`)
  }

  // node-id travels as `1-234` in the URL but the API wants `1:234`
  const nodeMatch = input.match(/node-id=([0-9]+[-:][0-9]+)/)

  return { key, nodeId: nodeMatch?.[1].replace('-', ':') }
}

const readToken = async (): Promise<string> => {
  const fromEnv = process.env.FIGMA_TOKEN?.trim()
  if (fromEnv) return fromEnv

  const fromFile = await readFile(path.resolve(process.cwd(), '.figma-token'), 'utf8').catch(
    () => '',
  )
  if (fromFile.trim()) return fromFile.trim()

  throw new Error(
    'No Figma token. Create one at Figma → Settings → Security → Personal access tokens\n' +
      '(scope: File content — read only), then:\n\n' +
      '  echo "YOUR_TOKEN" > .figma-token\n',
  )
}

const api = async <T>(token: string, endpoint: string): Promise<T> => {
  const response = await fetch(`${API}${endpoint}`, { headers: { 'X-Figma-Token': token } })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Figma ${response.status} on ${endpoint}\n${body.slice(0, 400)}`)
  }

  return response.json() as Promise<T>
}

const channel = (value: number) =>
  Math.round(value * 255)
    .toString(16)
    .padStart(2, '0')

const rgba = (
  color: { a?: number; b: number; g: number; r: number },
  opacity = 1,
): string => {
  const { a = 1, b, g, r } = color
  const alpha = a * opacity
  const base = `#${channel(r)}${channel(g)}${channel(b)}`

  return alpha >= 0.999 ? base : `${base}${channel(alpha)}`
}

/**
 * This design leans on gradients and photographic fills far more than flat
 * colour, so a solid-only reader would silently miss most backgrounds. Gradients
 * are emitted in CSS order with their stop positions; the angle is derived from
 * Figma's two handle positions.
 */
const describeFill = (paint?: Paint): string | undefined => {
  if (!paint || paint.visible === false) return undefined

  if (paint.type === 'SOLID' && paint.color) return rgba(paint.color, paint.opacity)

  if (paint.type === 'IMAGE') return 'image'

  if (paint.type.startsWith('GRADIENT') && paint.gradientStops?.length) {
    const stops = paint.gradientStops
      .map((stop) => `${rgba(stop.color, paint.opacity)} ${Math.round(stop.position * 100)}%`)
      .join(', ')

    const handles = paint.gradientHandlePositions

    if (paint.type === 'GRADIENT_LINEAR' && handles && handles.length >= 2) {
      const [start, end] = handles
      // CSS angles run clockwise from "to top"; Figma handles are vectors in unit space
      const degrees = Math.round(
        (Math.atan2(end.x - start.x, -(end.y - start.y)) * 180) / Math.PI,
      )
      return `linear-gradient(${degrees}deg, ${stops})`
    }

    return `${paint.type === 'GRADIENT_RADIAL' ? 'radial' : 'linear'}-gradient(${stops})`
  }

  return undefined
}

/** First visible paint wins, matching how the layer reads on screen. */
const topFill = (paints?: Paint[]): string | undefined => {
  const visible = paints?.filter((paint) => paint.visible !== false) ?? []
  // Figma stacks paints bottom-first, so the last visible one is on top
  return describeFill(visible[visible.length - 1])
}

const round = (value?: number): number | undefined =>
  typeof value === 'number' ? Math.round(value * 100) / 100 : undefined

/** Collected across the whole file so the digest can show what's actually reused. */
const palette = new Map<string, number>()
const typeRamp = new Map<string, number>()

const tally = (map: Map<string, number>, key?: string) => {
  if (key) map.set(key, (map.get(key) ?? 0) + 1)
}

type Trimmed = {
  bg?: string
  children?: Trimmed[]
  fill?: string
  gap?: number
  id: string
  layout?: string
  name: string
  pad?: string
  radius?: number
  rect?: string
  stroke?: string
  text?: string
  type: string
  typography?: string
}

const describeType = (style?: TypeStyle): string | undefined => {
  if (!style?.fontSize) return undefined

  const parts = [
    style.fontFamily,
    `${round(style.fontSize)}px`,
    style.fontWeight ? `w${style.fontWeight}` : undefined,
    style.lineHeightPx ? `lh${round(style.lineHeightPx)}` : undefined,
    style.letterSpacing ? `ls${round(style.letterSpacing)}` : undefined,
    style.textCase,
  ].filter(Boolean)

  return parts.join(' ')
}

const describePadding = (node: FigmaNode): string | undefined => {
  const { paddingBottom: b, paddingLeft: l, paddingRight: r, paddingTop: t } = node
  if (!t && !r && !b && !l) return undefined
  return `${t ?? 0} ${r ?? 0} ${b ?? 0} ${l ?? 0}`
}

/** Origin-relative so numbers read as offsets inside the frame, not canvas coordinates. */
const trim = (node: FigmaNode, origin?: Vector, depth = 0): Trimmed | undefined => {
  if (node.visible === false) return undefined

  const box = node.absoluteBoundingBox
  const root = origin ?? (box ? { x: box.x, y: box.y } : undefined)

  const fill = topFill(node.fills)
  const stroke = topFill(node.strokes)
  const typography = describeType(node.style)

  // `image` is a placeholder, not a value worth ranking in the palette
  if (fill !== 'image') tally(palette, fill)
  tally(palette, stroke)
  tally(typeRamp, typography)

  const trimmed: Trimmed = {
    // Kept on every node so any subtree can be re-rendered with --node later
    id: node.id,
    name: node.name,
    type: node.type,
    ...(box && root
      ? {
          rect: `${round(box.x - root.x)},${round(box.y - root.y)} ${round(box.width)}×${round(
            box.height,
          )}`,
        }
      : {}),
    ...(fill ? { fill } : {}),
    ...(stroke ? { stroke, ...(node.strokeWeight ? { radius: node.cornerRadius } : {}) } : {}),
    ...(node.cornerRadius ? { radius: node.cornerRadius } : {}),
    ...(node.layoutMode && node.layoutMode !== 'NONE'
      ? { layout: `${node.layoutMode.toLowerCase()} ${node.primaryAxisAlignItems ?? ''}`.trim() }
      : {}),
    ...(node.itemSpacing ? { gap: node.itemSpacing } : {}),
    ...(describePadding(node) ? { pad: describePadding(node) } : {}),
    ...(typography ? { typography } : {}),
    ...(node.characters ? { text: node.characters } : {}),
  }

  // Deep component internals (icon vectors, mask groups) add noise without
  // informing layout, so the walk stops before it drowns the digest.
  if (node.children?.length && depth < 12) {
    const children = node.children
      .map((child) => trim(child, root, depth + 1))
      .filter((child): child is Trimmed => Boolean(child))

    if (children.length) trimmed.children = children
  }

  return trimmed
}

const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'frame'

const outline = (node: Trimmed, depth = 0): string[] => {
  const bits = [
    node.rect,
    node.fill,
    node.typography,
    node.layout,
    node.gap ? `gap${node.gap}` : undefined,
    node.pad ? `pad ${node.pad}` : undefined,
    node.text ? JSON.stringify(node.text.slice(0, 60)) : undefined,
  ].filter(Boolean)

  return [
    `${'  '.repeat(depth)}- **${node.name}** \`${node.type}\` ${bits.join(' · ')}`,
    ...(depth < 5 ? (node.children ?? []).flatMap((child) => outline(child, depth + 1)) : []),
  ]
}

const renderFrames = async (token: string, key: string, frames: FigmaNode[]): Promise<void> => {
  const { images } = await api<{ images: Record<string, string | null> }>(
    token,
    `/images/${key}?ids=${encodeURIComponent(frames.map((frame) => frame.id).join(','))}` +
      `&format=png&scale=2`,
  )

  for (const frame of frames) {
    const imageUrl = images[frame.id]
    if (!imageUrl) continue

    const response = await fetch(imageUrl)
    if (!response.ok) continue

    const file = path.join(OUT_DIR, `${slug(frame.name)}.png`)
    await writeFile(file, Buffer.from(await response.arrayBuffer()))
    console.log(`  ${path.relative(process.cwd(), file)}`)
  }
}

const main = async () => {
  const args = process.argv.slice(2)
  const url = args.find((arg) => !arg.startsWith('--'))

  if (!url) {
    throw new Error('Usage: npm run figma:pull -- "<figma url>" [--node 1:234]')
  }

  const nodeFlag = args.indexOf('--node')
  const { key, nodeId } = parseUrl(url)
  const targetNode = nodeFlag > -1 ? args[nodeFlag + 1] : nodeId

  const token = await readToken()
  await mkdir(OUT_DIR, { recursive: true })

  console.log(`Fetching file ${key}${targetNode ? ` (node ${targetNode})` : ''}…`)

  // Scoping to a node keeps huge files manageable; otherwise take page one.
  const targets: FigmaNode[] = targetNode
    ? Object.values(
        (
          await api<{ nodes: Record<string, { document: FigmaNode }> }>(
            token,
            `/files/${key}/nodes?ids=${encodeURIComponent(targetNode)}`,
          )
        ).nodes,
      ).map((entry) => entry.document)
    : ((await api<{ document: FigmaNode; name: string }>(token, `/files/${key}?depth=6`)).document
        .children ?? [])

  /**
   * A page/canvas is a container, not a design. Rendering one produces a single
   * enormous image of every artboard side by side, so descend to its children
   * and treat each artboard as its own frame.
   */
  const frames = targets.flatMap((node) =>
    node.type === 'CANVAS' || node.type === 'DOCUMENT' ? (node.children ?? []) : [node],
  )

  if (!frames.length) throw new Error('No frames found. Try passing --node <id>.')

  console.log(`Found ${frames.length} frame(s): ${frames.map((f) => f.name).join(', ')}`)

  const spec = frames.map((frame) => trim(frame))
  await writeFile(path.join(OUT_DIR, 'spec.json'), JSON.stringify(spec, null, 2))

  // Rendered PNGs — Figma returns short-lived S3 URLs that must be fetched
  // separately, and full-page frames at 2x are slow, so allow spec-only re-runs.
  if (args.includes('--no-images')) {
    console.log('Skipping renders (--no-images)')
  } else {
    await renderFrames(token, key, frames)
  }

  const sorted = (map: Map<string, number>) =>
    [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40)

  const digest = [
    `# Figma spec — ${key}`,
    '',
    '## Palette (by usage)',
    ...sorted(palette).map(([value, count]) => `- \`${value}\` ×${count}`),
    '',
    '## Type ramp (by usage)',
    ...sorted(typeRamp).map(([value, count]) => `- ${value} ×${count}`),
    '',
    ...frames.flatMap((frame, index) => {
      const trimmed = spec[index]
      return ['', `## ${frame.name}`, '', ...(trimmed ? outline(trimmed as Trimmed) : [])]
    }),
  ].join('\n')

  await writeFile(path.join(OUT_DIR, 'spec.md'), digest)
  console.log(`\nWrote .figma/spec.json and .figma/spec.md`)
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}\n`)
  process.exit(1)
})

/**
 * Minimal Lexical builders for seeded rich text.
 *
 * Payload stores rich text as a Lexical editor state; hand-writing that JSON
 * for every paragraph is noisy, so the seed composes it from plain strings.
 */

type LexicalRoot = {
  root: {
    type: string
    children: { type: string; version: number; [k: string]: unknown }[]
    direction: 'ltr' | 'rtl' | null
    format: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'
    indent: number
    version: number
  }
  [k: string]: unknown
}

const textNode = (text: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: text ? [textNode(text)] : [],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  version: 1,
})

/**
 * Each string becomes one paragraph. Use an empty string for a blank line —
 * the seeded copy relies on those to separate the spec lists.
 */
export const richText = (paragraphs: string[]): LexicalRoot => ({
  root: {
    type: 'root',
    children: paragraphs.map(paragraph),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

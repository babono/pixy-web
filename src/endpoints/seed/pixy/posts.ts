import type { Palette } from './images'

import { palettes } from './images'

export type SeedPost = {
  slug: string
  title: string
  /** Matches a title in the `categories` collection, shown as the card eyebrow */
  category: 'Review' | 'Tips'
  excerpt: string
  body: string[]
  palette: Palette
}

export const seedPosts: SeedPost[] = [
  {
    slug: 'pixy-latest-blush-on-lineup-2026',
    title: "PIXY's Latest Blush-On Lineup for 2026 Has Arrived, Don't Miss Out!",
    category: 'Review',
    excerpt:
      'Six new shades, one silky formula. Here is how the 2026 blush-on lineup wears through a full Jakarta day.',
    body: [
      'The 2026 blush-on lineup lands with six shades built around one idea: colour that looks like it came from your own skin.',
      'Each pan uses the same finely milled, silica-cushioned powder, so the shades layer over one another without turning patchy. We wore all six through a 12-hour day to see how they held up.',
      'Coral Pop and Rose Quartz were the standouts for everyday wear, while Plum Haze earned its place as the evening pick.',
    ],
    palette: palettes.blush,
  },
  {
    slug: 'artful-makeup-techniques-creative-tips',
    title: 'Artful Makeup Techniques: Creative Tips for a Stunning Look',
    category: 'Tips',
    excerpt:
      'Graphic liner, diffused colour and a soft-focus base — three techniques that move everyday makeup somewhere more expressive.',
    body: [
      'Artful makeup is less about precision than about intent. These three techniques give you room to play without a steep learning curve.',
      'Start with a soft-focus base so colour has somewhere clean to sit. Then build the graphic element first and diffuse outwards — the reverse order is much harder to correct.',
      'Finish by muting one area deliberately. A bold eye reads best against a quiet lip, and vice versa.',
    ],
    palette: palettes.lavender,
  },
  {
    slug: 'radiant-skin-secrets-top-skincare-tips',
    title: 'Radiant Skin Secrets: Top Skincare Tips',
    category: 'Tips',
    excerpt:
      'Layering order, humidity and the two steps most routines skip. A practical guide to a brighter everyday complexion.',
    body: [
      'Radiance is mostly a hydration story. Skin that holds water reflects light evenly, and that reads as glow.',
      'Layer thinnest to thickest, and give each layer thirty seconds to settle. In humid weather, swap a cream for a water-gel rather than skipping moisturiser entirely.',
      'The two most-skipped steps: sunscreen re-application, and giving an active four full weeks before judging it.',
    ],
    palette: palettes.mint,
  },
  {
    slug: 'glam-up-your-look-essential-makeup-tips',
    title: 'Glam Up Your Look: Essential Makeup Tips',
    category: 'Tips',
    excerpt:
      'A five-minute routine that takes a daytime face to something ready for the evening, using what is already in your bag.',
    body: [
      'Going from day to evening rarely needs a full re-do. It needs contrast.',
      'Deepen the outer corner of the eye, press a touch of shimmer onto the centre of the lid, and reach for a lip a shade or two richer than your daytime pick.',
      'Set the T-zone last so the added product does not slide, and you are done in about five minutes.',
    ],
    palette: palettes.rose,
  },
]

import type { PackshotShape, Palette } from './images'

import { palettes } from './images'
import { richText } from './lexical'

export type SeedProduct = {
  slug: string
  title: string
  categorySlug: string
  price: number
  featured: boolean
  shortDescription: string
  highlights: string[]
  actions: {
    label: string
    url: string
    appearance: 'solid' | 'outline'
    icon: 'none' | 'sparkles' | 'cart'
    newTab?: boolean
  }[]
  description: string[]
  howToUse: string[]
  reviews: { author: string; rating: number; body: string }[]
  /** Drives the generated placeholder packshots */
  art: { bandLabel: string; palettes: Palette[]; shape: PackshotShape; variantLabel?: string }
}

const buyActions: SeedProduct['actions'] = [
  { label: 'Try Filter', url: '#try-filter', appearance: 'outline', icon: 'sparkles' },
  { label: 'Buy Now', url: 'https://www.tokopedia.com/', appearance: 'solid', icon: 'none', newTab: true },
]

export const seedProducts: SeedProduct[] = [
  {
    slug: 'pixy-mattenetic-transferproof-lipstick',
    title: 'PIXY Mattenetic Transferproof Lipstick',
    categorySlug: 'decoratives',
    price: 62100,
    featured: true,
    shortDescription:
      'A matte lipstick that is transfer-proof and lasts up to 12 hours, with a creamy texture that never feels heavy.',
    highlights: ['Halal Certified', 'Transfer-proof', '12 Hour Wear'],
    actions: buyActions,
    description: [
      'A matte lipstick that is transfer-proof and lasts up to 12 hours!',
      '"Feel powerful and magnetic with every swipe."',
      '',
      'Formulated with 5x Mattenetic Blur + Non-Drying Effect, it keeps your lips hydrated, feeling light, and prevents cracking.',
      'Its creamy texture is easy to blend and delivers intense, pigmented color with just one swipe.',
      '',
      '- Transfer-proof & lasts up to 12 hours',
      '- Keeps lips hydrated and comfortable',
      '- Intense & highly pigmented color',
      '- Creamy texture, easy to blend',
      '- Lightweight feel without heaviness',
      '',
      'Available in 8 shades:',
      '01 Polarose',
      '02 Coralbyte',
      '03 Pinkpulse',
      '04 Megamauve',
      '05 Powerplum',
      '06 Brownetic',
      '07 Rednotic',
      '08 Rubivolt',
      '',
      'BPOM Number:',
      '01 Polarose NA11251301407',
      '02 Coralbyte NA11251301408',
      '03 Pinkpulse NA11251301409',
      '04 Megamauve NA11251301410',
      '05 Powerplum NA11251301411',
      '06 Brownetic NA11251301412',
      '07 Rednotic NA11251301413',
      '08 Rubivolt NA11251301405',
      '',
      'Net Weight: 3g',
    ],
    howToUse: [
      'Apply to your lips as desired. For a bold look, go for full lips, or create an ombre effect with a light base and a darker center for a captivating appearance.',
    ],
    reviews: [
      {
        author: 'Tanisha S.',
        rating: 5,
        body: 'This transfer-proof lipstick is a striking red matte finish that glides on smoothly, giving my lips a vibrant glow without feeling heavy! It’s perfect for everyday wear.',
      },
      {
        author: 'Veronica',
        rating: 5,
        body: 'I absolutely love this shade. It blends seamlessly and stays put through a whole day of meetings without any touch-ups.',
      },
      {
        author: 'Amara D.',
        rating: 4.8,
        body: 'Great pigment in a single swipe, and it never feels drying even after hours of wear. The packaging is beautiful too.',
      },
    ],
    art: {
      bandLabel: 'MATTENETIC TRANSFERPROOF',
      palettes: [palettes.rose, palettes.blush, palettes.lavender, palettes.rose],
      shape: 'lipstick',
      variantLabel: '12 Hours Longlasting',
    },
  },
  {
    slug: 'pixy-twc-perfect-fit-07-cream-beige-refill',
    title: 'PIXY TWC Perfect Fit 07 Cream Beige - Refill',
    categorySlug: 'base-makeup',
    price: 27800,
    featured: true,
    shortDescription:
      'A seamless blend of powder and foundation for a bright, even finish that lasts up to 12 hours with SPF 30 PA+++ protection.',
    highlights: ['Halal Certified', 'SPF 30 PA+++', '12 Hour Coverage'],
    actions: buyActions,
    description: [
      'A two way cake refill that blends powder and foundation into one seamless step.',
      '"Perfect fit, all day long."',
      '',
      'Formulated with Yuzu Bead Extract and Vitamin C to keep skin bright, even and comfortable from morning to night.',
      'The finely milled powder blurs pores without settling into fine lines or looking cakey.',
      '',
      '- Coverage that lasts up to 12 hours',
      '- SPF 30 PA+++ daily sun protection',
      '- Squalane Oil for a non-drying finish',
      '- Refill pan fits every PIXY Perfect Fit case',
      '',
      'Available in 6 shades:',
      '01 Natural Beige',
      '02 Natural Ivory',
      '03 Beige',
      '04 Golden Beige',
      '05 Sandy Beige',
      '07 Cream Beige',
      '',
      'BPOM Number: NA11221300865',
      '',
      'Net Weight: 12.2g',
    ],
    howToUse: [
      'Place the refill pan into your Perfect Fit case. Using the sponge, apply evenly from the center of the face outwards. Layer for fuller coverage.',
    ],
    reviews: [
      {
        author: 'Tanisha S.',
        rating: 5,
        body: 'This cream beige makeup cake refill blends beautifully and gives my skin a natural glow without feeling heavy! It’s perfect for everyday wear.',
      },
      {
        author: 'Veronica',
        rating: 5,
        body: 'I absolutely love this cream beige makeup cake refill! It blends seamlessly into my skin, providing a lovely natural radiance without any heaviness. Ideal for daily use!',
      },
      {
        author: 'Amara D.',
        rating: 4.8,
        body: 'Great coverage that lasts all day. The SPF protection is a huge plus and it never feels cakey even in humid weather.',
      },
    ],
    art: {
      bandLabel: 'PERFECT FIT TWO WAY CAKE REFILL',
      palettes: [palettes.sky, palettes.mint, palettes.sky, palettes.lavender],
      shape: 'compact',
      variantLabel: 'SPF 30 PA+++',
    },
  },
  {
    slug: 'pixy-uv-whitening-two-way-cake',
    title: 'PIXY UV Whitening Two Way Cake',
    categorySlug: 'base-makeup',
    price: 45900,
    featured: true,
    shortDescription:
      'A brightening two way cake with UV filters that evens out tone while keeping skin protected all day.',
    highlights: ['Halal Certified', 'SPF 25 PA++', 'Brightening'],
    actions: buyActions,
    description: [
      'A brightening two way cake that evens skin tone while shielding it from daily UV exposure.',
      '',
      '- Natural, buildable coverage',
      '- SPF 25 PA++ protection',
      '- Enriched with Vitamin C and E',
      '',
      'BPOM Number: NA11201300712',
      '',
      'Net Weight: 12.2g',
    ],
    howToUse: [
      'Apply evenly with the sponge, starting from the center of the face. Re-apply through the day as needed.',
    ],
    reviews: [
      {
        author: 'Sarah W.',
        rating: 5,
        body: 'Brightens my skin without looking chalky. The compact is small enough to carry everywhere.',
      },
      {
        author: 'Nadia P.',
        rating: 4.7,
        body: 'Lovely everyday finish and the UV protection makes it my go-to for outdoor days.',
      },
    ],
    art: {
      bandLabel: 'UV WHITENING TWO WAY CAKE',
      palettes: [palettes.lavender, palettes.blush, palettes.sky],
      shape: 'compact',
      variantLabel: 'SPF 25 PA++',
    },
  },
  {
    slug: 'pixy-silky-fit-loose-powder',
    title: 'PIXY Silky Fit Loose Powder',
    categorySlug: 'base-makeup',
    price: 38500,
    featured: false,
    shortDescription:
      'An airy loose powder that sets makeup with a soft-focus finish and keeps shine away for hours.',
    highlights: ['Halal Certified', 'Oil Control', 'Soft Focus'],
    actions: buyActions,
    description: [
      'A weightless loose powder that locks makeup in place with a smooth, soft-focus finish.',
      '',
      '- Controls shine for up to 8 hours',
      '- Blurs the look of pores',
      '- Talc-light, breathable texture',
      '',
      'Net Weight: 20g',
    ],
    howToUse: ['Dust lightly over the face with a puff or brush after applying base makeup.'],
    reviews: [
      {
        author: 'Ratna K.',
        rating: 4.9,
        body: 'Sets everything beautifully and my T-zone stays matte through a full workday.',
      },
    ],
    art: {
      bandLabel: 'SILKY FIT LOOSE POWDER',
      palettes: [palettes.blush, palettes.rose, palettes.lavender],
      shape: 'compact',
    },
  },
  {
    slug: 'pixy-line-and-brow-pencil',
    title: 'PIXY Line & Brow Pencil',
    categorySlug: 'decoratives',
    price: 32000,
    featured: true,
    shortDescription:
      'A dual-ended pencil that shapes brows and defines eyes with one precise, smudge-resistant formula.',
    highlights: ['Halal Certified', 'Smudge Resistant', 'Dual Ended'],
    actions: buyActions,
    description: [
      'A dual-ended pencil that draws crisp brow hairs on one end and lines the eyes on the other.',
      '',
      '- Fine 1.5mm tip for hair-like strokes',
      '- Smudge and water resistant',
      '- Built-in spoolie for blending',
      '',
      'Net Weight: 0.3g',
    ],
    howToUse: [
      'Draw short strokes along the natural brow shape, then blend with the spoolie. Use the liner end close to the lash line.',
    ],
    reviews: [
      {
        author: 'Amira J.',
        rating: 4.8,
        body: 'The tip is thin enough for realistic brow strokes, and it genuinely does not budge.',
      },
    ],
    art: {
      bandLabel: 'LINE & BROW PENCIL',
      palettes: [palettes.lavender, palettes.rose, palettes.blush],
      shape: 'lipstick',
    },
  },
  {
    slug: 'pixy-white-aqua-serum',
    title: 'PIXY White Aqua Serum',
    categorySlug: 'skin-care',
    price: 54900,
    featured: true,
    shortDescription:
      'A lightweight brightening serum with Yuzu extract that floods skin with moisture in a single layer.',
    highlights: ['Halal Certified', 'Vegan Friendly', 'Brightening'],
    actions: buyActions,
    description: [
      'A featherlight serum that layers brightening Yuzu extract with deep hydration.',
      '',
      '- Visibly brighter skin in 4 weeks',
      '- Non-sticky, fast absorbing',
      '- Free from alcohol and fragrance',
      '',
      'Net Volume: 30ml',
    ],
    howToUse: [
      'Apply 2-3 drops to cleansed skin morning and night, then follow with moisturiser.',
    ],
    reviews: [
      {
        author: 'Dewi R.',
        rating: 5,
        body: 'Sinks in instantly and my skin looks noticeably brighter after a month of use.',
      },
      {
        author: 'Clara M.',
        rating: 4.9,
        body: 'No stickiness at all, which is rare for a brightening serum. Layers well under makeup.',
      },
    ],
    art: {
      bandLabel: 'WHITE AQUA SERUM',
      palettes: [palettes.mint, palettes.sky, palettes.mint],
      shape: 'bottle',
    },
  },
  {
    slug: 'pixy-white-aqua-gel-moisturiser',
    title: 'PIXY White Aqua Gel Moisturiser',
    categorySlug: 'skin-care',
    price: 47500,
    featured: false,
    shortDescription:
      'A cooling gel moisturiser that locks in hydration for 24 hours without a heavy finish.',
    highlights: ['Halal Certified', 'Vegan Friendly', '24h Hydration'],
    actions: buyActions,
    description: [
      'A cooling water-gel that seals in moisture for a full 24 hours.',
      '',
      '- Refreshing, non-greasy texture',
      '- Strengthens the moisture barrier',
      '- Suitable for oily and combination skin',
      '',
      'Net Weight: 50g',
    ],
    howToUse: ['Smooth over face and neck as the final step of your routine.'],
    reviews: [
      {
        author: 'Intan S.',
        rating: 4.8,
        body: 'Perfect for humid weather — hydrating but it disappears into the skin.',
      },
    ],
    art: {
      bandLabel: 'WHITE AQUA GEL',
      palettes: [palettes.sky, palettes.mint, palettes.sky],
      shape: 'bottle',
    },
  },
  {
    slug: 'pixy-beauty-inside-collagen-drink',
    title: 'PIXY Beauty Inside Collagen Drink',
    categorySlug: 'wellness',
    price: 89000,
    featured: false,
    shortDescription:
      'A daily marine collagen drink formulated to support skin elasticity from the inside out.',
    highlights: ['Halal Certified', 'Registered in BPOM', 'Sugar Free'],
    actions: buyActions,
    description: [
      'A daily collagen drink that supports skin elasticity and glow from within.',
      '',
      '- 5,000mg marine collagen per serving',
      '- Added Vitamin C and Zinc',
      '- Sugar free, natural yuzu flavour',
      '',
      'Contents: 10 sachets',
    ],
    howToUse: ['Dissolve one sachet in 150ml of cold water and drink once daily.'],
    reviews: [
      {
        author: 'Putri A.',
        rating: 4.7,
        body: 'Tastes clean and citrusy rather than fishy, which was my worry with collagen drinks.',
      },
    ],
    art: {
      bandLabel: 'BEAUTY INSIDE COLLAGEN',
      palettes: [palettes.mint, palettes.lavender, palettes.blush],
      shape: 'bottle',
    },
  },
]

export const productRichText = (paragraphs: string[]) => richText(paragraphs)

import type { RequiredDataFromCollectionSlug } from 'payload'

import { defaultFaqItems } from '@/blocks/FaqBlock/Component'

export const faqStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'faq',
  _status: 'published',
  title: 'FAQ',
  hero: {
    type: 'none',
  },
  layout: [
    {
      blockType: 'faqBlock',
      title: 'FREQUENTLY ASKED QUESTIONS',
      subtitle: 'FAQ',
      items: defaultFaqItems,
    },
    {
      blockType: 'socialStrip',
      heading: 'Stay Connected',
    },
  ],
  meta: {
    title: 'FAQ | PIXY',
    description:
      'Pertanyaan umum seputar produk PIXY, keaslian, kehalalan, ketersediaan online dan offline, serta keanggotaan PBC.',
  },
}

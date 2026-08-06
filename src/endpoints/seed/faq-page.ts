import type { RequiredDataFromCollectionSlug } from 'payload'

import { defaultFaqItems } from '@/blocks/FaqBlock/Component'

export const faqPageData = (): RequiredDataFromCollectionSlug<'pages'> => {
  return {
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
      // No title: it falls back to the page title, and SITE_NAME is appended.
      description:
        'Pertanyaan umum seputar produk PIXY, keaslian, kehalalan, ketersediaan online dan offline, serta keanggotaan PBC.',
    },
  }
}

import type { Block } from 'payload'

import { link } from '@/fields/link'

/**
 * Full-bleed campaign carousel that opens the home page.
 */
export const HeroCarousel: Block = {
  slug: 'heroCarousel',
  interfaceName: 'HeroCarouselBlock',
  labels: {
    singular: 'Hero Carousel',
    plural: 'Hero Carousels',
  },
  fields: [
    {
      name: 'slides',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      required: true,
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { description: 'Shown from 768px up. Landscape crops work best.' },
        },
        {
          name: 'imageMobile',
          type: 'upload',
          relationTo: 'media',
          label: 'Image (mobile)',
          admin: {
            description:
              'Optional portrait crop for screens under 768px. Falls back to the image above.',
          },
        },
        {
          name: 'headline',
          type: 'textarea',
          required: true,
          admin: { description: 'Line breaks are preserved.' },
        },
        {
          name: 'subheadline',
          type: 'text',
        },
        link({ appearances: false }),
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'autoplay',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%' },
        },
        {
          name: 'intervalSeconds',
          type: 'number',
          defaultValue: 6,
          min: 2,
          max: 30,
          admin: {
            width: '50%',
            condition: (_, siblingData) => Boolean(siblingData?.autoplay),
          },
        },
      ],
    },
  ],
}

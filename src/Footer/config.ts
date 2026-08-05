import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { socialLinks } from '@/fields/socialLinks'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Site',
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Reversed (white) wordmark. Falls back to the text wordmark when empty.',
      },
    },
    {
      name: 'tagline',
      type: 'textarea',
      defaultValue:
        'Real beauty, rooted in quality. Japanese beauty expertise for your authentic, everyday glow.',
    },
    {
      name: 'columns',
      type: 'array',
      maxRows: 4,
      labels: { singular: 'Link column', plural: 'Link columns' },
      admin: {
        initCollapsed: true,
        description: 'Each column becomes one heading with a list of links beneath it.',
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'navItems',
          type: 'array',
          maxRows: 8,
          fields: [link({ appearances: false })],
        },
      ],
    },
    socialLinks(),
    {
      name: 'localeLinks',
      type: 'array',
      maxRows: 4,
      labels: { singular: 'Language', plural: 'Languages' },
      admin: { initCollapsed: true },
      fields: [link({ appearances: false })],
    },
    {
      name: 'legalLinks',
      type: 'array',
      maxRows: 4,
      admin: { initCollapsed: true },
      fields: [link({ appearances: false })],
    },
    {
      name: 'copyright',
      type: 'text',
      defaultValue: '© 2026 PIXY. All rights reserved.',
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}

import type { Block } from 'payload'

import { link } from '@/fields/link'

/**
 * "As Seen On" — video feed cards featuring product thumbnails & hover autoplay.
 */
export const AsSeenOnFeed: Block = {
  slug: 'asSeenOnFeed',
  interfaceName: 'AsSeenOnFeedBlock',
  labels: {
    singular: 'As Seen On Feed',
    plural: 'As Seen On Feeds',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'AS SEEN ON',
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'latest',
      options: [
        { label: 'Latest items (automatic)', value: 'latest' },
        { label: 'Hand-picked', value: 'manual' },
      ],
    },
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'as-seen-on',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'manual',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 20,
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'latest',
      },
    },
    {
      name: 'cta',
      type: 'group',
      label: 'See more button',
      admin: { hideGutter: true },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
        },
        link({
          appearances: false,
          overrides: {
            admin: {
              condition: (_, siblingData) => Boolean(siblingData?.enabled),
            },
          },
        }),
      ],
    },
  ],
}

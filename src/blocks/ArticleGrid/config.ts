import type { Block } from 'payload'

import { link } from '@/fields/link'

/**
 * "Tips & Reviews" — editorial cards pulled from the Posts collection.
 */
export const ArticleGrid: Block = {
  slug: 'articleGrid',
  interfaceName: 'ArticleGridBlock',
  labels: {
    singular: 'Article Grid',
    plural: 'Article Grids',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Tips & Reviews',
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'latest',
      options: [
        { label: 'Latest posts (automatic)', value: 'latest' },
        { label: 'Hand-picked', value: 'manual' },
      ],
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'manual',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 12,
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
          defaultValue: true,
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

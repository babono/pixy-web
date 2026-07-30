import type { Block } from 'payload'

import { link } from '@/fields/link'

/**
 * "Popular Products" / "Similar Products" — a four-up grid of product cards.
 */
export const ProductGrid: Block = {
  slug: 'productGrid',
  interfaceName: 'ProductGridBlock',
  labels: {
    singular: 'Product Grid',
    plural: 'Product Grids',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Popular Products',
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'featured',
      options: [
        { label: 'Featured products (automatic)', value: 'featured' },
        { label: 'One category (automatic)', value: 'category' },
        { label: 'Hand-picked', value: 'manual' },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'product-categories',
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'category',
      },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
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
        condition: (_, siblingData) => siblingData?.source !== 'manual',
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

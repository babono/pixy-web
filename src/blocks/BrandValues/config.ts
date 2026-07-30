import type { Block } from 'payload'

/**
 * "Real beauty, rooted in quality" — brand statement plus certification badges.
 */
export const BrandValues: Block = {
  slug: 'brandValues',
  interfaceName: 'BrandValuesBlock',
  labels: {
    singular: 'Brand Values',
    plural: 'Brand Values',
  },
  fields: [
    {
      name: 'heading',
      type: 'textarea',
      required: true,
      defaultValue: 'Real beauty,\nrooted in quality',
      admin: { description: 'Line breaks are preserved.' },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'values',
      type: 'array',
      minRows: 1,
      maxRows: 5,
      labels: { singular: 'Value', plural: 'Values' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: { width: '60%' },
            },
            {
              name: 'icon',
              type: 'upload',
              relationTo: 'media',
              admin: { width: '40%' },
            },
          ],
        },
      ],
    },
  ],
}

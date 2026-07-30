import type { Block } from 'payload'

/**
 * "Shop Now" — outbound links to the marketplaces PIXY sells on.
 */
export const MarketplaceLinks: Block = {
  slug: 'marketplaceLinks',
  interfaceName: 'MarketplaceLinksBlock',
  labels: {
    singular: 'Shop Now',
    plural: 'Shop Now',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Shop Now',
    },
    {
      name: 'marketplaces',
      type: 'relationship',
      relationTo: 'marketplaces',
      hasMany: true,
      admin: {
        description: 'Leave empty to show every marketplace.',
      },
    },
  ],
}

import type { Block } from 'payload'

/**
 * "Find What You Need" — one tinted tile per shop category.
 */
export const CategoryGrid: Block = {
  slug: 'categoryGrid',
  interfaceName: 'CategoryGridBlock',
  labels: {
    singular: 'Category Grid',
    plural: 'Category Grids',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Find What You Need',
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'product-categories',
      hasMany: true,
      admin: {
        description: 'Leave empty to show every product category.',
      },
    },
  ],
}

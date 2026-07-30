import type { CollectionConfig } from 'payload'

import { slugField } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { revalidateProductCategory } from './hooks/revalidateProductCategory'

/**
 * Shop categories — "Base Makeup", "Decoratives", "Skin Care", "Wellness".
 *
 * Drives the "Find What You Need" tiles on the home page, the product
 * breadcrumb, and the eyebrow label on the product detail page.
 */
export const ProductCategories: CollectionConfig<'product-categories'> = {
  slug: 'product-categories',
  labels: {
    singular: 'Product Category',
    plural: 'Product Categories',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    tint: true,
    image: true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'tint', 'updatedAt'],
    group: 'Shop',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Product still used on the category tile.',
      },
    },
    {
      name: 'tint',
      type: 'select',
      defaultValue: 'pink',
      required: true,
      options: [
        { label: 'Lavender', value: 'lavender' },
        { label: 'Sky', value: 'sky' },
        { label: 'Mint', value: 'mint' },
        { label: 'Pink', value: 'pink' },
      ],
      admin: {
        description: 'Background colour of the category tile.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Shown at the top of the category listing page.',
      },
    },
    slugField({ position: undefined }),
  ],
  hooks: {
    afterChange: [revalidateProductCategory],
  },
}

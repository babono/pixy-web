import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/**
 * Where PIXY is sold — Tokopedia, Shopee, TikTok Shop, Lazada.
 *
 * Referenced by the "Shop Now" home page block and the footer's e-commerce
 * column, so adding a new marketplace in the admin surfaces it in both places.
 */
export const Marketplaces: CollectionConfig<'marketplaces'> = {
  slug: 'marketplaces',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  defaultPopulate: {
    name: true,
    url: true,
    logo: true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'url', 'updatedAt'],
    group: 'Shop',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Square marketplace logo, shown at 32×32.',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'Link to the PIXY official store on this marketplace.',
      },
    },
  ],
}

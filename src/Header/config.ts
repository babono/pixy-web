import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
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
        description: 'Optional. Falls back to the PIXY wordmark when empty.',
      },
    },
    {
      name: 'navItems',
      type: 'array',
      maxRows: 8,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
      fields: [
        link({
          appearances: false,
        }),
        {
          name: 'subItems',
          type: 'array',
          maxRows: 8,
          labels: { singular: 'Sub item', plural: 'Sub items' },
          admin: {
            description: 'Optional. Renders as a dropdown on desktop and an accordion on mobile.',
          },
          fields: [
            link({
              appearances: false,
            }),
          ],
        },
      ],
    },
    {
      name: 'searchPlaceholder',
      type: 'text',
      defaultValue: 'Search products, tips and more',
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}

import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'

export const AsSeenOn: CollectionConfig<'as-seen-on'> = {
  slug: 'as-seen-on',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    video: true,
    videoUrl: true,
    thumbnail: true,
    product: true,
    customProduct: true,
    tiktokUrl: true,
    sortOrder: true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'product', 'sortOrder', 'updatedAt'],
    group: 'Shop',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Title or description of this video clip for admin reference.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          admin: {
            width: '50%',
            description: 'MP4 video file uploaded to Media for hover autoplay.',
          },
        },
        {
          name: 'videoUrl',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Optional direct MP4 URL string if video is hosted on CDN.',
          },
        },
      ],
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Thumbnail / poster image shown when video is paused or before hover.',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      admin: {
        description: 'Linked Payload Product. Auto-populates title, price, image & CTA URL.',
      },
    },
    {
      name: 'customProduct',
      type: 'group',
      admin: {
        description: 'Fallback product info if not linking to a Payload Product.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'price',
          type: 'number',
          admin: {
            description: 'Price in Rupiah (e.g. 119000 renders as IDR 119.000).',
          },
        },
        {
          name: 'category',
          type: 'text',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'CTA link destination (e.g. /products/dewdrop).',
          },
        },
      ],
    },
    {
      name: 'tiktokUrl',
      type: 'text',
      admin: {
        description: 'Optional original TikTok URL link.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order weight (lower numbers appear first).',
      },
    },
  ],
}

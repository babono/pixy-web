import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateProduct, revalidateProductDelete } from './hooks/revalidateProduct'

export const Products: CollectionConfig<'products'> = {
  slug: 'products',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // Keeps product cards cheap wherever a product is referenced (grids, related)
  defaultPopulate: {
    title: true,
    slug: true,
    price: true,
    category: true,
    images: true,
    shortDescription: true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'price', '_status', 'updatedAt'],
    group: 'Shop',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({ slug: data?.slug, collection: 'products', req }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({ slug: data?.slug as string, collection: 'products', req }),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  type: 'relationship',
                  relationTo: 'product-categories',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                  min: 0,
                  admin: {
                    width: '50%',
                    description: 'In rupiah, without separators. e.g. 62100 renders as Rp62.100',
                  },
                },
              ],
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              admin: {
                description: 'One or two lines shown under the price, and on product cards.',
              },
            },
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              required: true,
              admin: {
                description: 'First image is the card thumbnail. The rest become gallery slides.',
              },
            },
            {
              name: 'highlights',
              type: 'array',
              maxRows: 4,
              labels: { singular: 'Highlight', plural: 'Highlights' },
              admin: {
                description: 'Ticked claims under the buttons, e.g. "Halal Certified".',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'actions',
              type: 'array',
              maxRows: 2,
              labels: { singular: 'Button', plural: 'Buttons' },
              admin: {
                description: 'Call-to-action buttons, e.g. "Try Filter" and "Buy Now".',
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
                    { name: 'url', type: 'text', required: true, admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'appearance',
                      type: 'select',
                      defaultValue: 'solid',
                      options: [
                        { label: 'Solid rose', value: 'solid' },
                        { label: 'Outline', value: 'outline' },
                      ],
                      admin: { width: '50%' },
                    },
                    {
                      name: 'icon',
                      type: 'select',
                      defaultValue: 'none',
                      options: [
                        { label: 'None', value: 'none' },
                        { label: 'Sparkles', value: 'sparkles' },
                        { label: 'Cart', value: 'cart' },
                      ],
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'newTab',
                  type: 'checkbox',
                  label: 'Open in new tab',
                },
              ],
            },
            {
              name: 'featured',
              type: 'checkbox',
              label: 'Show in Popular Products',
              admin: {
                description:
                  'Home page product grids set to "Automatic" pull from featured products.',
              },
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            {
              name: 'description',
              type: 'richText',
              label: 'About Product',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
            },
            {
              name: 'howToUse',
              type: 'richText',
              label: 'How To Use',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
            },
          ],
        },
        {
          label: 'Reviews',
          fields: [
            {
              name: 'reviews',
              type: 'array',
              labels: { singular: 'Review', plural: 'Reviews' },
              admin: {
                description:
                  'The headline score above the review cards is the average of these ratings.',
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'author', type: 'text', required: true, admin: { width: '50%' } },
                    {
                      name: 'rating',
                      type: 'number',
                      required: true,
                      min: 0,
                      max: 5,
                      defaultValue: 5,
                      admin: { width: '50%', step: 0.1 },
                    },
                  ],
                },
                { name: 'body', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Related',
          fields: [
            {
              name: 'relatedProducts',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              // Never let a product recommend itself
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
              admin: {
                description:
                  'Leave empty to automatically show other products from the same category.',
              },
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateProduct],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateProductDelete],
  },
  versions: {
    drafts: {
      autosave: { interval: 100 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}

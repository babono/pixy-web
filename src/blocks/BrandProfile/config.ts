import type { Block } from 'payload'

/**
 * Brand Profile section matching the PIXY About Us design layout.
 */
export const BrandProfile: Block = {
  slug: 'brandProfile',
  interfaceName: 'BrandProfileBlock',
  labels: {
    singular: 'Brand Profile',
    plural: 'Brand Profiles',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'ABOUT US',
    },
    {
      name: 'subtitle',
      type: 'text',
      required: true,
      defaultValue: 'BRAND PROFILE',
    },
    {
      name: 'paragraphs',
      type: 'array',
      labels: { singular: 'Paragraph', plural: 'Paragraphs' },
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
}

import type { Block } from 'payload'

/**
 * Interactive FAQ Accordion Block.
 */
export const FaqBlock: Block = {
  slug: 'faqBlock',
  interfaceName: 'FaqBlockProps',
  labels: {
    singular: 'FAQ Accordion',
    plural: 'FAQ Accordions',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'FREQUENTLY ASKED QUESTIONS',
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: 'FAQ',
    },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'FAQ Item', plural: 'FAQ Items' },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          admin: {
            description: 'Optional when the answer is made up entirely of bullet items.',
          },
        },
        {
          name: 'listItems',
          type: 'array',
          labels: { singular: 'Bullet Item', plural: 'Bullet Items' },
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}

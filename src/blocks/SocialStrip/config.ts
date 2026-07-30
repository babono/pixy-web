import type { Block } from 'payload'

/**
 * "Stay Connected" — the social icon row above the footer. The icons come from
 * the Footer global's social links, so they only need maintaining in one place.
 */
export const SocialStrip: Block = {
  slug: 'socialStrip',
  interfaceName: 'SocialStripBlock',
  labels: {
    singular: 'Stay Connected',
    plural: 'Stay Connected',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Stay Connected',
    },
  ],
}

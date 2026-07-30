import type { ArrayField, Field } from 'payload'

import deepMerge from '@/utilities/deepMerge'

/**
 * The social platforms PIXY links out to. Each value maps to an icon in
 * `@/components/pixy/SocialIcon`, so adding a platform here means adding a
 * matching icon there.
 */
export const socialPlatforms = [
  { label: 'YouTube', value: 'youtube' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'X', value: 'x' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'WhatsApp', value: 'whatsapp' },
] as const

export type SocialPlatform = (typeof socialPlatforms)[number]['value']

type SocialLinksType = (options?: { overrides?: Partial<ArrayField> }) => Field

export const socialLinks: SocialLinksType = ({ overrides = {} } = {}) => {
  const result: ArrayField = {
    name: 'socialLinks',
    type: 'array',
    maxRows: 8,
    labels: { singular: 'Social link', plural: 'Social links' },
    admin: {
      initCollapsed: true,
      description: 'Rendered in the "Stay Connected" strip and in the footer.',
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'platform',
            type: 'select',
            required: true,
            options: [...socialPlatforms],
            admin: { width: '50%' },
          },
          {
            name: 'url',
            type: 'text',
            required: true,
            admin: { width: '50%' },
          },
        ],
      },
    ],
  }

  return deepMerge(result, overrides)
}

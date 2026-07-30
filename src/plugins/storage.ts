import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { Plugin } from 'payload'

import { cloudinaryStorageAdapter } from '@/storage/cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET
const folder = process.env.CLOUDINARY_FOLDER || 'pixy'

/**
 * Media goes to Cloudinary when credentials are present, and to `public/media`
 * when they aren't.
 *
 * The fallback is deliberate: a fresh clone with no Cloudinary account still
 * runs and seeds. `enabled: false` makes the plugin a no-op rather than
 * throwing at config load.
 */
export const cloudinaryEnabled = Boolean(cloudName && apiKey && apiSecret)

export const storagePlugin: Plugin = cloudStoragePlugin({
  enabled: cloudinaryEnabled,
  collections: {
    media: {
      adapter: cloudinaryEnabled
        ? cloudinaryStorageAdapter({
            apiKey: apiKey!,
            apiSecret: apiSecret!,
            cloudName: cloudName!,
            folder,
          })
        : null,
      // Store and serve the Cloudinary URL directly instead of proxying every
      // request through /api/media/file. This is what puts the Cloudinary path
      // in the `url` field in MongoDB.
      disablePayloadAccessControl: true,
    },
  },
})

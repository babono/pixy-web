import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'

import { v2 as cloudinary } from 'cloudinary'

/**
 * Cloudinary storage adapter for Payload's cloud-storage plugin.
 *
 * Payload ships official adapters for S3, Azure, GCS, Vercel Blob and
 * UploadThing but not Cloudinary, so this implements the same
 * `GeneratedAdapter` contract against the official Cloudinary SDK.
 *
 * Files are stored at `<folder>/<prefix?>/<filename>` and the `public_id`
 * deliberately keeps the file extension. That makes upload, delete and URL
 * generation symmetric — no extension bookkeeping, and Payload's generated
 * image sizes (`name-300x200.webp`) round-trip unchanged.
 */

export type CloudinaryAdapterArgs = {
  apiKey: string
  apiSecret: string
  cloudName: string
  /** Root folder inside the Cloudinary media library, e.g. `pixy` */
  folder?: string
}

/**
 * Cloudinary needs an explicit resource type to delete or address a file, and
 * it must match what was used to upload. Deriving it from the MIME type keeps
 * both sides in agreement.
 *
 * Note that Cloudinary classifies PDFs as `image`, not `raw`.
 */
const resourceTypeFor = (mimeType?: string | null): 'image' | 'raw' | 'video' => {
  if (!mimeType) return 'image'
  if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) return 'video'
  if (mimeType.startsWith('image/') || mimeType === 'application/pdf') return 'image'
  return 'raw'
}

const joinPath = (...segments: (string | undefined | null)[]): string =>
  segments
    .filter((segment): segment is string => Boolean(segment))
    .map((segment) => segment.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')

export const cloudinaryStorageAdapter =
  ({ apiKey, apiSecret, cloudName, folder }: CloudinaryAdapterArgs): Adapter =>
  ({ prefix }): GeneratedAdapter => {
    cloudinary.config({
      api_key: apiKey,
      api_secret: apiSecret,
      cloud_name: cloudName,
      secure: true,
      // Keeps the SDK's `?_a=` tracking param out of URLs persisted to MongoDB
      analytics: false,
    })

    /**
     * `force_version: false` drops the `v1/` segment the SDK would otherwise
     * add. Uploads use `overwrite: true` and deletes invalidate the CDN, so
     * there is no version to pin and the placeholder only adds noise.
     */
    const urlFor = (publicId: string, mimeType?: string | null) =>
      cloudinary.url(publicId, {
        resource_type: resourceTypeFor(mimeType),
        secure: true,
        force_version: false,
      })

    const publicIdFor = (filename: string, docPrefix?: string) =>
      joinPath(folder, docPrefix ?? prefix, filename)

    return {
      name: 'cloudinary',

      handleUpload: async ({ data, file }) => {
        const publicId = publicIdFor(file.filename, data?.prefix)

        await new Promise<void>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: publicId,
              resource_type: resourceTypeFor(file.mimeType),
              // The public_id is fully computed above, so none of Cloudinary's
              // own naming behaviour should interfere with it.
              use_filename: false,
              unique_filename: false,
              overwrite: true,
            },
            (error) => (error ? reject(error) : resolve()),
          )

          stream.end(file.buffer)
        })

        return data
      },

      handleDelete: async ({ doc, filename }) => {
        await cloudinary.uploader.destroy(publicIdFor(filename, doc?.prefix), {
          resource_type: resourceTypeFor(doc?.mimeType),
          invalidate: true,
        })
      },

      generateURL: ({ data, filename, prefix: docPrefix }) =>
        urlFor(publicIdFor(filename, docPrefix), data?.mimeType),

      /**
       * Used when `disablePayloadAccessControl` is off — Payload proxies the
       * file so its access control still applies. Streams straight through
       * rather than buffering the whole asset.
       */
      staticHandler: async (_req, { doc, params }) => {
        const mimeType = (doc as { mimeType?: string } | undefined)?.mimeType
        const url = urlFor(joinPath(folder, params.prefix, params.filename), mimeType)

        const response = await fetch(url)

        if (!response.ok || !response.body) {
          return new Response(null, { status: response.status || 404, statusText: 'Not Found' })
        }

        return new Response(response.body, {
          headers: {
            'Content-Length': response.headers.get('Content-Length') ?? '',
            'Content-Type': response.headers.get('Content-Type') ?? 'application/octet-stream',
          },
          status: 200,
        })
      },
    }
  }

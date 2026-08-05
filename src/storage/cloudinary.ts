import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'

import { v2 as cloudinary } from 'cloudinary'

/**
 * Cloudinary storage adapter for Payload's cloud-storage plugin.
 *
 * Payload ships official adapters for S3, Azure, GCS, Vercel Blob and
 * UploadThing but not Cloudinary, so this implements the same
 * `GeneratedAdapter` contract against the official Cloudinary SDK.
 *
 * Files are stored at `<folder>/<prefix?>/<filename>`.
 *
 * Extensions need care. For `image` and `video` resources Cloudinary treats the
 * extension as a *delivery format* appended to the public ID, so a public ID
 * that already ends in `.webp` is served at `name.webp.webp`. Those types
 * therefore store the ID stem and pass the extension as `format`. `raw` behaves
 * the opposite way — the public ID is the whole filename and nothing is
 * appended — so raw keeps its extension.
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
    /**
     * Splits `name.webp` into the public-ID stem and delivery format, except
     * for `raw` where the extension is part of the ID itself.
     */
    const identify = (filename: string, mimeType?: string | null) => {
      const resourceType = resourceTypeFor(mimeType)
      const match = filename.match(/^(.*)\.([A-Za-z0-9]+)$/)

      if (resourceType === 'raw' || !match) {
        return { format: undefined, resourceType, stem: filename }
      }

      return { format: match[2], resourceType, stem: match[1] }
    }

    const publicIdFor = (filename: string, docPrefix?: string) =>
      joinPath(folder, docPrefix ?? prefix, filename)

    const urlFor = (
      filename: string,
      docPrefix?: string,
      mimeType?: string | null,
      version?: number | null,
    ) => {
      const { format, resourceType, stem } = identify(filename, mimeType)

      return cloudinary.url(publicIdFor(stem, docPrefix), {
        format,
        resource_type: resourceType,
        secure: true,
        // Without a known version, fall back to a versionless URL rather than
        // emitting the SDK's `v1` placeholder, which never resolves.
        force_version: false,
        ...(version ? { version } : {}),
      })
    }

    return {
      name: 'cloudinary',

      handleUpload: async ({ data, file }) => {
        const { resourceType, stem } = identify(file.filename, file.mimeType)

        const uploaded = await new Promise<{ version?: number }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: publicIdFor(stem, data?.prefix),
              resource_type: resourceType,
              // The public_id is fully computed above, so none of Cloudinary's
              // own naming behaviour should interfere with it.
              use_filename: false,
              unique_filename: false,
              overwrite: true,
            },
            (error, result) => (error ? reject(error) : resolve(result ?? {})),
          )

          stream.end(file.buffer)
        })

        // Persisted on the doc so generateURL can address this exact version
        return { ...data, cloudinaryVersion: uploaded.version }
      },

      handleDelete: async ({ doc, filename }) => {
        const { resourceType, stem } = identify(filename, doc?.mimeType)

        await cloudinary.uploader.destroy(publicIdFor(stem, doc?.prefix), {
          resource_type: resourceType,
          invalidate: true,
        })
      },

      generateURL: ({ data, filename, prefix: docPrefix }) =>
        urlFor(filename, docPrefix, data?.mimeType, data?.cloudinaryVersion),

      /**
       * Used when `disablePayloadAccessControl` is off — Payload proxies the
       * file so its access control still applies. Streams straight through
       * rather than buffering the whole asset.
       */
      staticHandler: async (_req, { doc, params }) => {
        const mimeType = (doc as { mimeType?: string } | undefined)?.mimeType
        const response = await fetch(urlFor(params.filename, params.prefix, mimeType))

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

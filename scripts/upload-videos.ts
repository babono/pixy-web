import 'dotenv/config'

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import { v2 as cloudinary } from 'cloudinary'

export type UploadedClip = {
  /** Cloudinary-generated still, one second in. */
  posterUrl: string
  publicId: string
  source: string
  url: string
}

const VIDEO_DIR = path.resolve(process.cwd(), 'public', 'video')
const FOLDER = `${process.env.CLOUDINARY_FOLDER || 'pixy'}/video`

/** `video-2` must sort before `video-10`, which a plain string sort gets wrong. */
const naturally = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })

export const configureCloudinary = () => {
  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_CLOUD_NAME, _API_KEY and _API_SECRET must all be set.')
  }

  cloudinary.config({
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    cloud_name: CLOUDINARY_CLOUD_NAME,
    secure: true,
  })
}

/**
 * Uploads `public/video/*.mp4` to Cloudinary.
 *
 * Videos need `resource_type: 'video'` — the media collection's storage adapter
 * only handles images, which is why these don't go through Payload uploads.
 * The public IDs are derived from the filename and uploaded with `overwrite`,
 * so re-running replaces rather than accumulating.
 */
export const uploadVideos = async (
  log: (message: string) => void = console.log,
): Promise<UploadedClip[]> => {
  configureCloudinary()

  const files = (await readdir(VIDEO_DIR).catch(() => [] as string[]))
    .filter((file) => file.toLowerCase().endsWith('.mp4'))
    .sort(naturally)

  if (!files.length) throw new Error(`No .mp4 files in ${VIDEO_DIR}`)

  const clips: UploadedClip[] = []

  for (const file of files) {
    const name = file.replace(/\.[^.]+$/, '')
    const buffer = await readFile(path.join(VIDEO_DIR, file))

    const result = await new Promise<{ public_id: string; secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: FOLDER,
            overwrite: true,
            public_id: name,
            resource_type: 'video',
          },
          (error, uploaded) =>
            error || !uploaded
              ? reject(error ?? new Error(`Upload failed for ${file}`))
              : resolve(uploaded as { public_id: string; secure_url: string }),
        )
        stream.end(buffer)
      },
    )

    // A still frame from the clip itself, rather than reusing a packshot.
    const posterUrl = cloudinary.url(result.public_id, {
      format: 'jpg',
      resource_type: 'video',
      secure: true,
      transformation: [{ start_offset: '1' }, { quality: 'auto', width: 800, crop: 'limit' }],
    })

    clips.push({ posterUrl, publicId: result.public_id, source: file, url: result.secure_url })
    log(`  ${file} → ${result.secure_url} (${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB)`)
  }

  return clips
}

const run = async () => {
  console.log(`Uploading to Cloudinary folder "${FOLDER}"…`)
  const clips = await uploadVideos()
  console.log(`\nUploaded ${clips.length} clip(s).`)
  process.exit(0)
}

// Only run when invoked directly, so seed-as-seen-on can import `uploadVideos`.
if (process.argv[1] && path.resolve(process.argv[1]).endsWith('upload-videos.ts')) {
  run().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}

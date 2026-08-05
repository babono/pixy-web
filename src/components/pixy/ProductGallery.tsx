'use client'

import { Play } from 'lucide-react'
import React, { useState } from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

const isVideo = (item: MediaType): boolean => Boolean(item.mimeType?.startsWith('video/'))

export const ProductGallery: React.FC<{ images: MediaType[]; title: string }> = ({
  images,
  title,
}) => {
  const [active, setActive] = useState(0)
  const current = images[active] ?? images[0]

  if (!current) return null

  return (
    // Figma: square frame on #f6f6f6 at 16px radius, 16px gap, 10px thumbnails
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-pixy-surface">
        {isVideo(current) ? (
          /* Shopee-style: the shopper drives playback, so this gets real
             controls rather than the autoplaying loop `VideoMedia` renders. */
          <video
            className="absolute inset-0 size-full object-cover"
            controls
            key={current.id}
            playsInline
            preload="metadata"
            src={current.url ?? undefined}
          />
        ) : (
          <Media
            fill
            imgClassName="object-cover"
            priority
            resource={current}
            size="(max-width: 1024px) 100vw, 46vw"
          />
        )}
      </div>

      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <li key={image.id ?? index}>
              <button
                aria-current={index === active}
                aria-label={`${title} — image ${index + 1}`}
                className={cn(
                  'relative block aspect-square w-full overflow-hidden rounded-[10px] border-2 bg-pixy-surface transition-colors',
                  index === active
                    ? 'border-pixy-rose'
                    : 'border-transparent hover:border-pixy-blush-300',
                )}
                onClick={() => setActive(index)}
                type="button"
              >
                {isVideo(image) ? (
                  <>
                    {/* A video has no still to show, so the frame itself is the
                        thumbnail — metadata only, so nothing downloads eagerly. */}
                    <video
                      className="absolute inset-0 size-full object-cover"
                      muted
                      preload="metadata"
                      src={image.url ?? undefined}
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <Play className="size-5 fill-white text-white" />
                    </span>
                  </>
                ) : (
                  <Media fill imgClassName="object-cover" resource={image} size="120px" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

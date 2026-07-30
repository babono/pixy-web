'use client'

import React, { useState } from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

export const ProductGallery: React.FC<{ images: MediaType[]; title: string }> = ({
  images,
  title,
}) => {
  const [active, setActive] = useState(0)
  const current = images[active] ?? images[0]

  if (!current) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-pixy-blush-50">
        <Media
          fill
          imgClassName="object-cover"
          priority
          resource={current}
          size="(max-width: 1024px) 100vw, 46vw"
        />
      </div>

      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <li key={image.id ?? index}>
              <button
                aria-current={index === active}
                aria-label={`${title} — image ${index + 1}`}
                className={cn(
                  'relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-pixy-blush-50 transition-colors',
                  index === active
                    ? 'border-pixy-rose'
                    : 'border-transparent hover:border-pixy-blush-300',
                )}
                onClick={() => setActive(index)}
                type="button"
              >
                <Media fill imgClassName="object-cover" resource={image} size="120px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

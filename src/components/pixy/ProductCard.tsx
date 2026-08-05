import Link from 'next/link'
import React from 'react'

import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { formatPrice } from './format'

type Props = {
  className?: string
  product: Product
  /** Grids render four across, so each card only ever needs a quarter-width image */
  sizes?: string
}

export const ProductCard: React.FC<Props> = ({ className, product, sizes }) => {
  const { images, price, slug, title } = product
  const cover = images?.[0]

  return (
    <Link
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-pixy-blush-200 bg-white transition-shadow hover:shadow-md',
        className,
      )}
      href={`/products/${slug}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-pixy-blush-50">
        {typeof cover === 'object' && cover !== null && (
          <Media
            fill
            imgClassName="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            resource={cover}
            size={sizes ?? '(max-width: 768px) 50vw, 25vw'}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 md:p-4">
        <h3 className="line-clamp-2 text-sm leading-snug text-pixy-ink md:text-base">{title}</h3>
        <p className="mt-auto pt-1 text-sm font-semibold text-pixy-rose md:text-base">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  )
}

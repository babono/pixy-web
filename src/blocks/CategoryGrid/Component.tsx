import { ChevronRight } from 'lucide-react'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { CategoryGridBlock as CategoryGridBlockProps, ProductCategory } from '@/payload-types'

import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/pixy/SectionHeading'
import { cn } from '@/utilities/ui'

const tintClasses: Record<NonNullable<ProductCategory['tint']>, string> = {
  lavender: 'bg-pixy-tile-lavender',
  sky: 'bg-pixy-tile-sky',
  mint: 'bg-pixy-tile-mint',
  pink: 'bg-pixy-tile-pink',
}

export const CategoryGridBlock: React.FC<CategoryGridBlockProps> = async ({
  categories,
  heading,
}) => {
  let resolved = (categories ?? []).filter(
    (category): category is ProductCategory => typeof category === 'object' && category !== null,
  )

  // No hand-picked selection means "show the whole shop"
  if (!resolved.length) {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'product-categories',
      depth: 1,
      limit: 8,
      sort: 'createdAt',
    })
    resolved = docs
  }

  if (!resolved.length) return null

  return (
    <section className="w-full bg-pixy-cream py-14 md:py-20">
      <div className="container">
        <SectionHeading>{heading}</SectionHeading>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {resolved.map((category) => (
            <Link
              className={cn(
                'group relative flex min-h-[132px] items-end overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-1 lg:aspect-4/3 lg:min-h-0',
                tintClasses[category.tint ?? 'pink'],
              )}
              href={`/products/category/${category.slug}`}
              key={category.id}
            >
              {typeof category.image === 'object' && category.image !== null && (
                <Media
                  fill
                  imgClassName="object-cover object-top opacity-95"
                  resource={category.image}
                  size="(max-width: 1024px) 50vw, 25vw"
                />
              )}

              {/* Fades the tile art so the label keeps contrast on every tint */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/25 to-transparent" />

              <span className="relative flex w-full items-center justify-between gap-2">
                <span className="font-display text-base font-medium text-white drop-shadow-sm md:text-lg">
                  {category.title}
                </span>
                <ChevronRight className="size-5 shrink-0 text-white" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

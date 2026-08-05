import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { ProductGridBlock as ProductGridBlockProps, Product } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { ProductCard } from '@/components/pixy/ProductCard'
import { SectionHeading } from '@/components/pixy/SectionHeading'

export const ProductGridBlock: React.FC<ProductGridBlockProps> = async ({
  category,
  cta,
  heading,
  limit,
  products,
  source,
}) => {
  let resolved: Product[] = []

  if (source === 'manual') {
    resolved = (products ?? []).filter(
      (product): product is Product => typeof product === 'object' && product !== null,
    )
  } else {
    const payload = await getPayload({ config: configPromise })
    const categoryID = typeof category === 'object' ? category?.id : category

    const { docs } = await payload.find({
      collection: 'products',
      depth: 1,
      limit: limit ?? 4,
      sort: '-publishedAt',
      where:
        source === 'category' && categoryID
          ? { category: { equals: categoryID } }
          : { featured: { equals: true } },
    })

    resolved = docs
  }

  if (!resolved.length) return null

  return (
    <section className="w-full bg-white py-14 md:py-20">
      <div className="container">
        <SectionHeading>{heading}</SectionHeading>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {resolved.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {cta?.enabled && cta.link?.label && (
          <div className="mt-10 flex justify-center">
            <CMSLink
              {...cta.link}
              className="inline-flex h-11 items-center justify-center rounded-full bg-pixy-rose px-14 pixy-button-label text-white transition-colors hover:bg-pixy-rose-dark"
            />
          </div>
        )}
      </div>
    </section>
  )
}

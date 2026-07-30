import type { Metadata } from 'next'

import { CheckCircle2 } from 'lucide-react'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import type { Media as MediaType, Product, ProductCategory } from '@/payload-types'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText'
import { Breadcrumbs } from '@/components/pixy/Breadcrumbs'
import { formatPrice } from '@/components/pixy/format'
import { ProductActions } from '@/components/pixy/ProductActions'
import { ProductCard } from '@/components/pixy/ProductCard'
import { ProductGallery } from '@/components/pixy/ProductGallery'
import { ProductReviews } from '@/components/pixy/ProductReviews'
import { SectionHeading } from '@/components/pixy/SectionHeading'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({
    collection: 'products',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return products.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function ProductPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = `/products/${decodedSlug}`

  const product = await queryProductBySlug({ slug: decodedSlug })

  if (!product) return <PayloadRedirects url={url} />

  const category = typeof product.category === 'object' ? product.category : null
  const images = (product.images ?? []).filter(
    (image): image is MediaType => typeof image === 'object' && image !== null,
  )
  const related = await queryRelatedProducts(product)

  return (
    <article className="pt-28">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <div className="container pt-4 pb-10 md:pb-16">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Home' },
            ...(category
              ? [{ href: `/products/category/${category.slug}`, label: category.title }]
              : []),
            { label: product.title },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={images} title={product.title} />

          <div className="flex flex-col">
            {category && (
              <span className="pixy-eyebrow text-[11px] text-pixy-rose">{category.title}</span>
            )}

            <h1 className="mt-3 text-2xl leading-tight font-medium text-pixy-ink md:text-3xl">
              {product.title}
            </h1>

            <p className="mt-4 text-2xl font-semibold text-pixy-crimson md:text-3xl">
              {formatPrice(product.price)}
            </p>

            {product.shortDescription && (
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-pixy-ink/80 md:text-base">
                {product.shortDescription}
              </p>
            )}

            {/* Hidden on mobile — the same buttons live in the sticky bottom bar */}
            <ProductActions actions={product.actions} className="mt-7 hidden md:flex" />

            {Boolean(product.highlights?.length) && (
              <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-pixy-blush-200 pt-6">
                {product.highlights!.map((highlight, index) => (
                  <li
                    className="flex items-center gap-2 text-xs text-pixy-ink/80 md:text-sm"
                    key={highlight.id ?? index}
                  >
                    <CheckCircle2 className="size-4 shrink-0 text-pixy-rose" />
                    {highlight.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ProductReviews reviews={product.reviews} />

      {product.description && (
        <section className="w-full border-b border-pixy-blush-200 bg-white py-10 md:py-14">
          <div className="container">
            <h2 className="pixy-eyebrow text-xs text-pixy-ink md:text-sm">About Product</h2>
            <RichText
              className="mt-5 max-w-3xl text-sm text-pixy-ink/80 md:text-base"
              data={product.description}
              enableGutter={false}
            />
          </div>
        </section>
      )}

      {product.howToUse && (
        <section className="w-full border-b border-pixy-blush-200 bg-white py-10 md:py-14">
          <div className="container">
            <h2 className="pixy-eyebrow text-xs text-pixy-ink md:text-sm">How To Use</h2>
            <RichText
              className="mt-5 max-w-3xl text-sm text-pixy-ink/80 md:text-base"
              data={product.howToUse}
              enableGutter={false}
            />
          </div>
        </section>
      )}

      {Boolean(related.length) && (
        <section className="w-full bg-white py-12 md:py-16">
          <div className="container">
            <SectionHeading>Similar Products</SectionHeading>

            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile purchase bar; padding below keeps it clear of the footer */}
      {Boolean(product.actions?.length) && (
        <>
          <div className="h-24 md:hidden" />
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-pixy-blush-200 bg-white/95 p-3 backdrop-blur-sm md:hidden">
            <ProductActions actions={product.actions} className="flex-nowrap" />
          </div>
        </>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const product = await queryProductBySlug({ slug: decodeURIComponent(slug) })

  return generateMeta({ doc: product })
}

const queryProductBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})

/**
 * Falls back to other products in the same category when an editor hasn't
 * hand-picked any, so the "Similar Products" rail is never empty.
 */
const queryRelatedProducts = async (product: Product): Promise<Product[]> => {
  const picked = (product.relatedProducts ?? []).filter(
    (item): item is Product => typeof item === 'object' && item !== null,
  )

  if (picked.length) return picked.slice(0, 4)

  const categoryID =
    typeof product.category === 'object'
      ? (product.category as ProductCategory).id
      : product.category

  if (!categoryID) return []

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 4,
    sort: '-publishedAt',
    where: {
      and: [{ category: { equals: categoryID } }, { id: { not_equals: product.id } }],
    },
  })

  return docs
}

import type { Metadata } from 'next'

import { CheckCircle2 } from 'lucide-react'
import configPromise from '@payload-config'
import Link from 'next/link'
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
import { TryOnButton } from '@/components/pixy/TryOn/TryOnButton'
import { tryOnShades } from '@/components/pixy/TryOn/shades'
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

  const firstCategory = Array.isArray(product.category) ? product.category[0] : product.category
  const category =
    typeof firstCategory === 'object' && firstCategory !== null
      ? (firstCategory as ProductCategory)
      : null
  const images = (product.images ?? []).filter(
    (image): image is MediaType => typeof image === 'object' && image !== null,
  )
  const related = await queryRelatedProducts(product)

  // "Try Me" needs both an editor opt-in and at least one shade carrying a hex.
  const shades = tryOnShades(product)
  const showTryOn = Boolean(product.virtualTryOn?.enabled) && shades.length > 0

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

        {/* Figma: two equal 473.5px columns with a 56px gutter */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={images} title={product.title} />

          <div className="flex flex-col gap-5">
            {category && (
              <span className="text-xs leading-[18px] font-medium tracking-[0.5px] text-pixy-rose uppercase">
                {category.title}
              </span>
            )}

            <h1 className="text-2xl leading-tight font-medium text-pixy-ink md:text-[32px] md:leading-10">
              {product.title}
            </h1>

            <p className="text-2xl font-bold text-pixy-rose md:text-[30px] md:leading-[45px]">
              {formatPrice(product.price)}
            </p>

            {product.shortDescription && (
              <p className="text-sm text-pixy-muted md:text-[15px] md:leading-[26px]">
                {product.shortDescription}
              </p>
            )}

            {/* Hidden on mobile — the same buttons live in the sticky bottom bar */}
            <div className="mt-2 hidden md:flex md:flex-wrap md:items-center md:gap-3">
              <ProductActions actions={product.actions} />
              {showTryOn && (
                <TryOnButton
                  finish={product.virtualTryOn?.finish ?? 'cream'}
                  productTitle={product.title}
                  shades={shades}
                />
              )}
            </div>

            {Boolean(product.highlights?.length) && (
              <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-pixy-blush-200 pt-6">
                {product.highlights!.map((highlight, index) => (
                  <li
                    className="flex items-center gap-2 text-xs text-pixy-muted md:text-sm"
                    key={highlight.id ?? index}
                  >
                    <CheckCircle2 className="size-[18px] shrink-0 text-pixy-rose" />
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
        <section className="w-full bg-white py-8">
          <div className="container">
            <h2 className="text-base leading-[18px] font-medium tracking-[0.8px] text-pixy-ink uppercase">
              About Product
            </h2>
            {/* `enableProse` centres and narrows the copy; the design runs it
                full width beneath the heading. */}
            <RichText
              className="mt-4 text-sm leading-[22px] text-pixy-muted"
              data={product.description}
              enableGutter={false}
              enableProse={false}
            />
          </div>
        </section>
      )}

      {/* Full-bleed 8px band, not a hairline rule */}
      <div aria-hidden="true" className="h-2 w-full bg-pixy-surface" />

      {product.howToUse && (
        <>
          <section className="w-full bg-white py-8">
            <div className="container">
              <h2 className="text-base leading-[18px] font-medium tracking-[0.8px] text-pixy-ink uppercase">
                How To Use
              </h2>
              <RichText
                className="mt-4 text-sm leading-[22px] text-pixy-muted"
                data={product.howToUse}
                enableGutter={false}
                enableProse={false}
              />
            </div>
          </section>

          <div aria-hidden="true" className="h-2 w-full bg-pixy-surface" />
        </>
      )}

      {Boolean(related.length) && (
        <section className="w-full bg-white py-8">
          <div className="container">
            <SectionHeading>Similar Products</SectionHeading>

            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                className="pixy-button-label inline-flex h-12 w-[300px] items-center justify-center rounded-full bg-pixy-rose text-white transition-colors hover:bg-pixy-rose-dark"
                href="/products"
              >
                See More
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Mobile purchase bar; padding below keeps it clear of the footer */}
      {(Boolean(product.actions?.length) || showTryOn) && (
        <>
          <div className="h-24 md:hidden" />
          <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-pixy-blush-200 bg-white/95 p-3 backdrop-blur-sm md:hidden">
            {showTryOn && (
              <TryOnButton
                className="shrink-0 px-4"
                finish={product.virtualTryOn?.finish ?? 'cream'}
                productTitle={product.title}
                shades={shades}
              />
            )}
            <ProductActions actions={product.actions} className="flex-1 flex-nowrap" />
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

  const firstCat = Array.isArray(product.category) ? product.category[0] : product.category
  const categoryID =
    typeof firstCat === 'object' && firstCat !== null
      ? (firstCat as ProductCategory).id
      : firstCat

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

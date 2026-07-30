import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import { Breadcrumbs } from '@/components/pixy/Breadcrumbs'
import { ProductCard } from '@/components/pixy/ProductCard'
import { SectionHeading } from '@/components/pixy/SectionHeading'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'product-categories',
    limit: 100,
    pagination: false,
    select: { slug: true },
  })

  return docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function ProductCategoryPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const category = await queryCategoryBySlug({ slug: decodeURIComponent(slug) })

  if (!category) notFound()

  const payload = await getPayload({ config: configPromise })
  const { docs: products } = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 48,
    overrideAccess: false,
    sort: '-publishedAt',
    where: { category: { equals: category.id } },
  })

  return (
    <div className="pt-28 pb-20">
      <div className="container">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Home' },
            { href: '/products', label: 'Products' },
            { label: category.title },
          ]}
        />

        <SectionHeading as="h1" className="mt-6" size="page">
          {category.title}
        </SectionHeading>

        {category.description && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-pixy-ink/80 md:text-base">
            {category.description}
          </p>
        )}

        {products.length ? (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-pixy-muted">
            Nothing in this category yet — check back soon.
          </p>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const category = await queryCategoryBySlug({ slug: decodeURIComponent(slug) })

  const title = category ? `${category.title} | PIXY` : 'PIXY'

  return {
    title,
    description: category?.description ?? undefined,
    openGraph: mergeOpenGraph({ title, url: `/products/category/${slug}` }),
  }
}

const queryCategoryBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'product-categories',
    limit: 1,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return docs?.[0] || null
})

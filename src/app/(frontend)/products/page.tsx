import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { Breadcrumbs } from '@/components/pixy/Breadcrumbs'
import { ProductCard } from '@/components/pixy/ProductCard'
import { SectionHeading } from '@/components/pixy/SectionHeading'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function ProductsPage() {
  const payload = await getPayload({ config: configPromise })

  const { docs: products } = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 48,
    overrideAccess: false,
    sort: '-publishedAt',
  })

  return (
    <div className="pt-28 pb-20">
      <div className="container">
        <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Products' }]} />
        <SectionHeading as="h1" className="mt-6" size="page">
          All Products
        </SectionHeading>

        {products.length ? (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-pixy-muted">No products published yet.</p>
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Products | PIXY',
  description: 'Browse the full PIXY makeup and skincare range.',
  openGraph: mergeOpenGraph({ title: 'Products | PIXY', url: '/products' }),
}

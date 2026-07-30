import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Product } from '../../../payload-types'

/**
 * Products surface in three places: their own page, the category listing and
 * the home page's popular-products grid. Editing one has to refresh all three,
 * otherwise the CMS demo looks like nothing happened.
 */
const revalidateProductSurfaces = (slug: string | null | undefined) => {
  revalidatePath(`/products/${slug}`)
  revalidatePath('/products')
  revalidatePath('/', 'page')
  revalidateTag('products-sitemap', 'max')
}

export const revalidateProduct: CollectionAfterChangeHook<Product> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info(`Revalidating product at path: /products/${doc.slug}`)
      revalidateProductSurfaces(doc.slug)
    }

    // If the product was previously published, revalidate the old path too
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating old product at path: /products/${previousDoc.slug}`)
      revalidateProductSurfaces(previousDoc.slug)
    }
  }

  return doc
}

export const revalidateProductDelete: CollectionAfterDeleteHook<Product> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidateProductSurfaces(doc?.slug)
  }

  return doc
}

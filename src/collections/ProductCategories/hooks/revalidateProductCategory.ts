import type { CollectionAfterChangeHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { ProductCategory } from '../../../payload-types'

export const revalidateProductCategory: CollectionAfterChangeHook<ProductCategory> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating product category ${doc.slug}`)

    revalidatePath(`/products/category/${doc.slug}`)
    // The home page renders category tiles, and every product page renders a breadcrumb
    revalidatePath('/', 'page')
    revalidateTag('products-sitemap', 'max')
  }

  return doc
}

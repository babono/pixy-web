/**
 * Maps a linkable collection to its route prefix.
 *
 * Pages live at the root, everything else is namespaced. Product categories
 * are nested under /products so the shop shares one URL space.
 */
const prefixByCollection = {
  pages: '',
  posts: '/posts',
  products: '/products',
  'product-categories': '/products/category',
} as const

export type LinkableCollection = keyof typeof prefixByCollection

export const getDocumentHref = (
  relationTo: LinkableCollection,
  slug: string | null | undefined,
): string | null => {
  if (!slug) return null

  const prefix = prefixByCollection[relationTo]

  // `pages` has an empty prefix, so guard against producing a bare "/slug//"
  return prefix === '' ? `/${slug}` : `${prefix}/${slug}`
}

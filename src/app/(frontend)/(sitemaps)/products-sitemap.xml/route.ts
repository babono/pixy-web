import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getProductsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const dateFallback = new Date().toISOString()

    const [products, categories] = await Promise.all([
      payload.find({
        collection: 'products',
        overrideAccess: false,
        draft: false,
        depth: 0,
        limit: 1000,
        pagination: false,
        where: {
          _status: {
            equals: 'published',
          },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
      payload.find({
        collection: 'product-categories',
        overrideAccess: false,
        depth: 0,
        limit: 100,
        pagination: false,
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
    ])

    return [
      ...products.docs
        .filter((product) => Boolean(product?.slug))
        .map((product) => ({
          loc: `${SITE_URL}/products/${product.slug}`,
          lastmod: product.updatedAt || dateFallback,
        })),
      ...categories.docs
        .filter((category) => Boolean(category?.slug))
        .map((category) => ({
          loc: `${SITE_URL}/products/category/${category.slug}`,
          lastmod: category.updatedAt || dateFallback,
        })),
    ]
  },
  ['products-sitemap'],
  {
    tags: ['products-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getProductsSitemap()

  return getServerSideSitemap(sitemap)
}

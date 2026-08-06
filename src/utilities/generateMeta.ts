import type { Metadata } from 'next'

import type { Media, Page, Post, Product, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { SITE_NAME } from './site'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/pixy-og.png'

  if (image && typeof image === 'object' && 'url' in image) {
    const source = image.sizes?.og?.url || image.url

    // Cloudinary hands back absolute URLs; prefixing those produced
    // `https://site/https://res.cloudinary.com/...`, which no scraper resolves.
    if (source) url = /^https?:\/\//.test(source) ? source : serverUrl + source
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | Partial<Product> | null
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)

  /**
   * Most imported products carry no SEO title, and without a fallback they all
   * render the same <title>. The home page is the exception: it's the brand
   * line on its own, not "Home | …".
   */
  const label = doc?.meta?.title || (doc?.slug === 'home' ? null : doc?.title)
  const title = label ? `${label} | ${SITE_NAME}` : SITE_NAME

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}

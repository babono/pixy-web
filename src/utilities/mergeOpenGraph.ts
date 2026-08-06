import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'
import { SITE_DESCRIPTION, SITE_NAME } from './site'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: SITE_DESCRIPTION,
  images: [
    {
      url: `${getServerSideURL()}/pixy-og.png`,
    },
  ],
  siteName: SITE_NAME,
  title: SITE_NAME,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}

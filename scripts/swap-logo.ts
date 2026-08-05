import 'dotenv/config'

import config from '../src/payload.config'
import { getPayload } from 'payload'

import { asset, logoAssets } from '../src/endpoints/seed/pixy/assets'

/** One-off: replace the header wordmark without re-running the whole seed. */
const run = async () => {
  const payload = await getPayload({ config })

  const file = await asset(logoAssets.rose, 'pixy-logo-rose')
  const media = await payload.create({ collection: 'media', data: { alt: 'PIXY' }, file })

  console.log('uploaded:', media.filename, '→', media.url)

  // revalidateTag throws outside a Next request context and rolls the write back
  await payload.updateGlobal({
    slug: 'header',
    data: { logo: media.id },
    context: { disableRevalidate: true },
  })
  console.log('header.logo updated')

  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

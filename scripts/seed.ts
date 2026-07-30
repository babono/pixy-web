import 'dotenv/config'

import { createLocalReq, getPayload } from 'payload'

import config from '../src/payload.config'
import { seed } from '../src/endpoints/seed'

/**
 * Resets the database to the PIXY demo content.
 *
 * Run with `pnpm seed`. This wipes the seeded collections first, so never point
 * it at anything but a demo database.
 */
const run = async () => {
  const payload = await getPayload({ config })
  const req = await createLocalReq({}, payload)

  await seed({ payload, req })

  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

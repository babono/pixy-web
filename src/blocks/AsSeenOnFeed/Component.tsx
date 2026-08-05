import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { AsSeenOnFeedBlock as AsSeenOnFeedBlockProps, AsSeenOn } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { SectionHeading } from '@/components/pixy/SectionHeading'
import { AsSeenOnCard } from './AsSeenOnCard'

export const AsSeenOnFeedBlock: React.FC<AsSeenOnFeedBlockProps> = async ({
  cta,
  heading,
  items,
  limit,
  source,
}) => {
  let resolved: AsSeenOn[] = []

  if (source === 'manual') {
    resolved = (items ?? []).filter(
      (item): item is AsSeenOn => typeof item === 'object' && item !== null,
    )
  } else {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'as-seen-on',
      depth: 2,
      limit: limit ?? 10,
      sort: 'sortOrder',
    })
    resolved = docs
  }

  if (!resolved.length) return null

  return (
    <section className="w-full bg-white py-14 md:py-20">
      <div className="container">
        <SectionHeading>{heading || 'AS SEEN ON'}</SectionHeading>

        {/* Responsive Grid: 5 columns on desktop (10 cards max), 3 columns on tablet (9 cards visible), 2 columns on mobile */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:gap-5">
          {resolved.map((item, index) => (
            <AsSeenOnCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {cta?.enabled && cta.link?.label && (
          <div className="mt-10 flex justify-center">
            <CMSLink
              {...cta.link}
              className="inline-flex h-11 items-center justify-center rounded-full bg-pixy-rose px-14 pixy-button-label text-white transition-colors hover:bg-pixy-rose-dark"
            />
          </div>
        )}
      </div>
    </section>
  )
}

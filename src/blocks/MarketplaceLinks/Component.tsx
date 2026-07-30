import { ChevronRight } from 'lucide-react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { MarketplaceLinksBlock as MarketplaceLinksBlockProps, Marketplace } from '@/payload-types'

import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/pixy/SectionHeading'

export const MarketplaceLinksBlock: React.FC<MarketplaceLinksBlockProps> = async ({
  heading,
  marketplaces,
}) => {
  let resolved = (marketplaces ?? []).filter(
    (marketplace): marketplace is Marketplace =>
      typeof marketplace === 'object' && marketplace !== null,
  )

  if (!resolved.length) {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'marketplaces',
      depth: 1,
      limit: 8,
      sort: 'createdAt',
    })
    resolved = docs
  }

  if (!resolved.length) return null

  return (
    <section className="pixy-gradient-blush w-full py-14 md:py-20">
      <div className="container">
        <SectionHeading>{heading}</SectionHeading>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {resolved.map((marketplace) => (
            <a
              className="group flex items-center gap-3 rounded-full bg-white px-5 py-3.5 transition-shadow hover:shadow-md"
              href={marketplace.url}
              key={marketplace.id}
              rel="noopener noreferrer"
              target="_blank"
            >
              {typeof marketplace.logo === 'object' && marketplace.logo !== null && (
                <span className="relative h-8 w-8 shrink-0">
                  <Media
                    fill
                    imgClassName="object-contain"
                    resource={marketplace.logo}
                    size="32px"
                  />
                </span>
              )}
              <span className="flex-1 text-sm text-pixy-ink md:text-base">{marketplace.name}</span>
              <ChevronRight className="size-4 shrink-0 text-pixy-rose transition-transform group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

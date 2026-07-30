import React from 'react'

import type { SocialStripBlock as SocialStripBlockProps } from '@/payload-types'

import { SocialIcon, socialLabel } from '@/components/pixy/SocialIcon'
import { getCachedGlobal } from '@/utilities/getGlobals'

export const SocialStripBlock: React.FC<SocialStripBlockProps> = async ({ heading }) => {
  // Icons are owned by the Footer global so they only need maintaining once
  const footer = await getCachedGlobal('footer', 1)()
  const links = footer?.socialLinks ?? []

  if (!links.length) return null

  return (
    <section className="pixy-gradient-blush w-full py-12 md:py-16">
      <div className="container flex flex-col items-center gap-6">
        <h2 className="pixy-heading text-lg md:text-xl">{heading}</h2>

        <ul className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {links.map((link, index) => (
            <li key={link.id ?? index}>
              <a
                aria-label={socialLabel(link.platform)}
                className="block text-pixy-rose-dark transition-opacity hover:opacity-70"
                href={link.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <SocialIcon className="size-6 md:size-7" platform={link.platform} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

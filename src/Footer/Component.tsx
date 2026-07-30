import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { SocialIcon, socialLabel } from '@/components/pixy/SocialIcon'
import { Wordmark } from '@/components/pixy/Wordmark'
import { getCachedGlobal } from '@/utilities/getGlobals'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  const columns = footerData?.columns || []
  const socials = footerData?.socialLinks || []
  const locales = footerData?.localeLinks || []
  const legal = footerData?.legalLinks || []

  return (
    <footer className="pixy-gradient-rose mt-auto text-white">
      <div className="container py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
          <div>
            <Link aria-label="PIXY home" className="inline-flex text-white" href="/">
              <Wordmark className="text-4xl" />
            </Link>

            {footerData?.tagline && (
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/85">
                {footerData.tagline}
              </p>
            )}

            {Boolean(socials.length) && (
              <ul className="mt-6 flex flex-wrap items-center gap-5">
                {socials.map((social, index) => (
                  <li key={social.id ?? index}>
                    <a
                      aria-label={socialLabel(social.platform)}
                      className="block text-white transition-opacity hover:opacity-70"
                      href={social.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <SocialIcon className="size-5" platform={social.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {Boolean(columns.length) && (
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-10">
              {columns.map((column, index) => (
                <div key={column.id ?? index}>
                  <h2 className="pixy-eyebrow text-[10px] text-white/70">{column.title}</h2>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {(column.navItems ?? []).map((item, itemIndex) => (
                      <li key={item.id ?? itemIndex}>
                        <CMSLink
                          {...item.link}
                          className="text-sm text-white/95 transition-opacity hover:opacity-70"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/25 pt-6 text-xs text-white/80 md:flex-row md:items-center md:justify-between">
          {Boolean(locales.length) && (
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 md:order-2">
              {locales.map((item, index) => (
                <React.Fragment key={item.id ?? index}>
                  {index > 0 && <li aria-hidden="true">•</li>}
                  <li>
                    <CMSLink {...item.link} className="transition-opacity hover:opacity-70" />
                  </li>
                </React.Fragment>
              ))}
            </ul>
          )}

          {Boolean(legal.length) && (
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 md:order-3">
              {legal.map((item, index) => (
                <React.Fragment key={item.id ?? index}>
                  {index > 0 && <li aria-hidden="true">•</li>}
                  <li>
                    <CMSLink {...item.link} className="transition-opacity hover:opacity-70" />
                  </li>
                </React.Fragment>
              ))}
            </ul>
          )}

          {footerData?.copyright && <p className="md:order-1">{footerData.copyright}</p>}
        </div>
      </div>
    </footer>
  )
}

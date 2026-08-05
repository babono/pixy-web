import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
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
    <footer className="mt-auto bg-pixy-rose text-white">
      {/* Figma: 64px block padding, a 320px brand column, then an 80px gutter */}
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-[320px_minmax(0,1fr)] md:gap-20">
          <div className="flex flex-col gap-5">
            <Link aria-label="PIXY home" className="inline-flex text-white" href="/">
              {typeof footerData?.logo === 'object' && footerData.logo !== null ? (
                <span className="relative block h-8 w-26">
                  <Media
                    fill
                    imgClassName="object-contain object-left"
                    resource={footerData.logo}
                    size="104px"
                  />
                </span>
              ) : (
                <Wordmark className="text-4xl" />
              )}
            </Link>

            {footerData?.tagline && (
              <p className="max-w-[280px] text-[13px] leading-5 text-pixy-blush-200">
                {footerData.tagline}
              </p>
            )}

            {Boolean(socials.length) && (
              <ul className="flex flex-wrap items-center gap-3">
                {socials.map((social, index) => (
                  <li key={social.id ?? index}>
                    <a
                      aria-label={socialLabel(social.platform)}
                      className="flex size-8 items-center justify-center text-white transition-opacity hover:opacity-70"
                      href={social.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <SocialIcon className="size-6" platform={social.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {Boolean(columns.length) && (
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {columns.map((column, index) => (
                <div className="flex flex-col gap-3" key={column.id ?? index}>
                  <h2 className="text-[11px] leading-[16.5px] font-medium tracking-[0.5px] text-pixy-pink uppercase">
                    {column.title}
                  </h2>
                  <ul className="flex flex-col gap-3">
                    {(column.navItems ?? []).map((item, itemIndex) => (
                      <li key={item.id ?? itemIndex}>
                        <CMSLink
                          {...item.link}
                          className="text-sm leading-[21px] text-white/90 transition-opacity hover:opacity-70"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Locale and legal read as one continuous bulleted run in the design,
            so they are concatenated rather than kept as two separate lists. */}
        <div className="mt-10 flex flex-col gap-4 border-t border-pixy-pink/50 pt-10 text-[13px] leading-[19.5px] text-white/80 md:flex-row md:items-center md:justify-between">
          {footerData?.copyright && <p>{footerData.copyright}</p>}

          {Boolean(locales.length || legal.length) && (
            <ul className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
              {[...locales, ...legal].map((item, index) => (
                <React.Fragment key={item.id ?? index}>
                  {index > 0 && (
                    <li aria-hidden="true" className="text-pixy-pink">
                      •
                    </li>
                  )}
                  <li>
                    <CMSLink {...item.link} className="transition-opacity hover:opacity-70" />
                  </li>
                </React.Fragment>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}

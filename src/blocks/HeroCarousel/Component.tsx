'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { HeroCarouselBlock as HeroCarouselBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

export const HeroCarouselBlock: React.FC<HeroCarouselBlockProps> = ({
  autoplay,
  intervalSeconds,
  slides,
}) => {
  const [active, setActive] = useState(0)
  // Pause the rotation while a visitor is reading or tabbing through a slide
  const [paused, setPaused] = useState(false)
  const total = slides?.length ?? 0
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((index: number) => setActive(index), [])

  useEffect(() => {
    if (!autoplay || paused || total < 2) return

    timer.current = setInterval(
      () => setActive((current) => (current + 1) % total),
      Math.max(intervalSeconds ?? 6, 2) * 1000,
    )

    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [autoplay, intervalSeconds, paused, total])

  if (!total) return null

  return (
    <section
      className="relative isolate w-full overflow-hidden bg-pixy-blush-100"
      onBlur={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[520px] w-full md:h-[620px]">
        {slides.map((slide, index) => (
          <div
            aria-hidden={index !== active}
            className={cn(
              'absolute inset-0 transition-opacity duration-700',
              index === active ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            key={slide.id ?? index}
          >
            {typeof slide.image === 'object' && slide.image !== null && (
              <Media
                fill
                imgClassName="object-cover object-center"
                priority={index === 0}
                resource={slide.image}
                size="100vw"
              />
            )}

            {/* Keeps the headline readable over busy campaign photography */}
            <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/25 to-transparent" />

            <div className="container relative flex h-full flex-col justify-end pb-24 md:justify-center md:pb-0">
              <div className="max-w-xl text-white">
                <h1 className="font-display text-4xl font-medium tracking-[0.04em] whitespace-pre-line uppercase md:text-5xl">
                  {slide.headline}
                </h1>
                {slide.subheadline && (
                  <p className="mt-4 max-w-md text-sm text-white/90 md:text-base">
                    {slide.subheadline}
                  </p>
                )}
                {slide.link?.label && (
                  <CMSLink
                    {...slide.link}
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-pixy-rose px-10 font-display text-sm font-medium tracking-[0.12em] text-white uppercase transition-colors hover:bg-pixy-rose-dark"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {total > 1 && (
        <div className="absolute bottom-8 left-0 w-full">
          <div className="container flex justify-center gap-2 md:justify-start">
            {slides.map((slide, index) => (
              <button
                aria-current={index === active}
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  'h-2.5 w-2.5 rounded-full border border-white/70 transition-colors',
                  index === active ? 'bg-white' : 'bg-white/20 hover:bg-white/50',
                )}
                key={slide.id ?? index}
                onClick={() => goTo(index)}
                type="button"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

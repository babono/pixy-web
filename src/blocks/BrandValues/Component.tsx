import React from 'react'

import type { BrandValuesBlock as BrandValuesBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/pixy/SectionHeading'

export const BrandValuesBlock: React.FC<BrandValuesBlockProps> = ({ body, heading, values }) => (
  <section className="pixy-gradient-blush-soft w-full py-14 md:py-20">
    <div className="container grid gap-8 md:grid-cols-2 md:items-center md:gap-16">
      <div>
        <SectionHeading className="whitespace-pre-line">{heading}</SectionHeading>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-pixy-ink/80 md:text-base">
          {body}
        </p>
      </div>

      {Boolean(values?.length) && (
        <ul className="flex flex-col gap-3 md:gap-4">
          {values!.map((value, index) => (
            <li
              className="flex items-center gap-4 rounded-2xl bg-white/70 px-5 py-4 backdrop-blur-sm md:px-6 md:py-5"
              key={value.id ?? index}
            >
              {typeof value.icon === 'object' && value.icon !== null && (
                <span className="relative h-9 w-9 shrink-0">
                  <Media fill imgClassName="object-contain" resource={value.icon} size="36px" />
                </span>
              )}
              <span className="pixy-eyebrow text-xs text-pixy-heading md:text-sm">
                {value.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </section>
)

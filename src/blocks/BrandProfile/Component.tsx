import React from 'react'

import type { BrandProfileBlock as BrandProfileBlockProps } from '@/payload-types'

const defaultParagraphs = [
  'Kecantikan bagi perempuan merupakan energi yang dapat meningkatkan kepercayaan diri dan suasana hati. Untuk melengkapinya, PIXY hadir untuk mendukung penampilanmu yang modern, feminine, chic, dan simple.',
  'Bersama PIXY, cantiknya perempuan Asia akan menginspirasi energi positif kepada orang-orang sekitar untuk menggapai mimpi mereka.',
  'Pancarkan energi positif melalui cantikmu.',
  'My Beauty, My Energy.',
]

export const BrandProfileBlock: React.FC<Partial<BrandProfileBlockProps>> = ({
  paragraphs,
  subtitle = 'BRAND PROFILE',
  title = 'ABOUT US',
}) => {
  const pList =
    paragraphs && paragraphs.length > 0
      ? paragraphs.map((p) => (typeof p === 'string' ? p : p.text))
      : defaultParagraphs

  return (
    <section className="w-full bg-white py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        {/* Diamond Header Ornament */}
        <div className="mb-12 flex items-center justify-center gap-2 md:mb-16 md:gap-3">
          <span className="select-none text-[10px] text-[#2b2525] md:text-xs">◆</span>
          <h1 className="font-sans text-xl font-bold tracking-widest text-[#2b2525] uppercase md:text-2xl lg:text-3xl">
            {title}
          </h1>
          <span className="select-none text-[10px] text-[#2b2525] md:text-xs">◆</span>
        </div>

        {/* Brand Profile Body */}
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-5 font-sans text-sm font-bold tracking-wide text-[#2b2525] uppercase md:mb-6 md:text-base">
            {subtitle}
          </h2>

          <div className="space-y-5 font-sans text-sm leading-relaxed text-[#595959] md:space-y-6 md:text-[15px] md:leading-7">
            {pList.map((paragraphText, idx) => (
              <p key={idx}>{paragraphText}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

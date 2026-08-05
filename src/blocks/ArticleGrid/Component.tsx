import { ChevronRight } from 'lucide-react'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { ArticleGridBlock as ArticleGridBlockProps, Post } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/pixy/SectionHeading'

/** First category doubles as the card's eyebrow label ("TIPS", "REVIEW") */
const eyebrowFor = (post: Post): string => {
  const first = post.categories?.[0]
  return typeof first === 'object' && first !== null ? first.title : 'Article'
}

export const ArticleGridBlock: React.FC<ArticleGridBlockProps> = async ({
  cta,
  heading,
  limit,
  posts,
  source,
}) => {
  let resolved: Post[] = []

  if (source === 'manual') {
    resolved = (posts ?? []).filter(
      (post): post is Post => typeof post === 'object' && post !== null,
    )
  } else {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: limit ?? 4,
      sort: '-publishedAt',
    })
    resolved = docs
  }

  if (!resolved.length) return null

  return (
    <section className="w-full bg-white py-14 md:py-20">
      <div className="container">
        <SectionHeading>{heading}</SectionHeading>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {resolved.map((post) => {
            const image = post.meta?.image

            return (
              <Link
                className="group flex flex-col gap-3"
                href={`/posts/${post.slug}`}
                key={post.id}
              >
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-pixy-blush-50">
                  {typeof image === 'object' && image !== null && (
                    <Media
                      fill
                      imgClassName="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      resource={image}
                      size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  )}
                </div>

                <span className="pixy-eyebrow text-[11px] text-pixy-rose">{eyebrowFor(post)}</span>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-3 text-sm leading-snug text-pixy-ink">{post.title}</h3>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-pixy-rose transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            )
          })}
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

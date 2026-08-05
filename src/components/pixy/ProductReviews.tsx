import React from 'react'

import type { Product } from '@/payload-types'

import { averageRating } from './format'
import { Stars } from './Stars'

export const ProductReviews: React.FC<{ reviews: Product['reviews'] }> = ({ reviews }) => {
  const average = averageRating(reviews)

  if (!reviews?.length || average === null) return null

  return (
    <section className="w-full bg-pixy-surface py-10 md:py-14">
      <div className="container">
        <div className="flex items-center gap-4">
          <h2 className="pixy-eyebrow text-xs text-pixy-muted md:text-sm">Reviews</h2>
          <span className="text-lg font-semibold text-pixy-ink md:text-xl">{average}</span>
          <Stars rating={average} size={18} />
        </div>

        {/* Horizontal scroll on mobile mirrors the peek-through card in the design */}
        <ul className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {reviews.map((review, index) => (
            <li
              className="w-[78%] shrink-0 snap-start rounded-xl border border-pixy-blush-200 bg-white p-5 md:w-auto"
              key={review.id ?? index}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-pixy-ink">{review.author}</span>
                <span className="text-xs text-pixy-muted">{review.rating}</span>
                <Stars rating={review.rating} size={13} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-pixy-ink/80">{review.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

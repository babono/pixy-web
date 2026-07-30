import { cn } from '@/utilities/ui'
import React from 'react'

type Props = {
  /** 0–5, fractional values render a partially filled star */
  rating: number
  className?: string
  size?: number
}

const Star: React.FC<{ fill: number; size: number; id: string }> = ({ fill, size, id }) => (
  <svg
    aria-hidden="true"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id={id}>
        <stop offset={`${fill * 100}%`} stopColor="#F5B301" />
        <stop offset={`${fill * 100}%`} stopColor="#E3DCD4" />
      </linearGradient>
    </defs>
    <path
      d="M12 2.2l2.9 6.06 6.6.86-4.84 4.6 1.23 6.6L12 17.2l-5.89 3.12 1.23-6.6L2.5 9.12l6.6-.86z"
      fill={`url(#${id})`}
    />
  </svg>
)

export const Stars: React.FC<Props> = ({ rating, className, size = 16 }) => {
  // Unique-enough gradient ids so multiple star rows on a page don't collide
  const key = React.useId()

  return (
    <div
      aria-label={`Rated ${rating} out of 5`}
      className={cn('inline-flex items-center gap-0.5', className)}
      role="img"
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          fill={Math.min(Math.max(rating - index, 0), 1)}
          id={`${key}-star-${index}`}
          key={index}
          size={size}
        />
      ))}
    </div>
  )
}

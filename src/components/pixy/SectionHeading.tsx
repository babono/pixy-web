import { cn } from '@/utilities/ui'
import React from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  /** `section` is the standard band title, `page` is the larger hero-adjacent one */
  size?: 'section' | 'page'
  as?: 'h1' | 'h2' | 'h3'
}

export const SectionHeading: React.FC<Props> = ({
  children,
  className,
  size = 'section',
  as: Tag = 'h2',
}) => (
  <Tag
    className={cn(
      'pixy-heading',
      size === 'section' ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl',
      className,
    )}
  >
    {children}
  </Tag>
)

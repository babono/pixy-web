import { cn } from '@/utilities/ui'
import React from 'react'

/**
 * The PIXY wordmark. Set as text rather than an image so it stays crisp and
 * inherits colour from the surface it sits on; the Header global can override
 * it with an uploaded logo.
 */
export const Wordmark: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cn('pixy-wordmark select-none leading-none', className)}>Pixy</span>
)

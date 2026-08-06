import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'

/** Matches the keys of `cssVariables.breakpoints`. */
export type Breakpoint = '3xl' | '2xl' | 'xl' | 'lg' | 'md' | 'sm'

export interface Props {
  alt?: string
  className?: string
  fill?: boolean // for NextImage only
  htmlElement?: ElementType | null
  pictureClassName?: string
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager' // for NextImage only
  /**
   * Art-direction variant served below `mobileBreakpoint`. Rendered as a
   * `<source>` so the browser downloads one crop, not both.
   */
  mobileResource?: MediaType | string | number | null
  mobileBreakpoint?: Breakpoint
  priority?: boolean // for NextImage only
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  resource?: MediaType | string | number | null // for Payload media
  size?: string // for NextImage only
  src?: StaticImageData // for static media
  videoClassName?: string
}

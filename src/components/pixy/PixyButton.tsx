import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

export type PixyButtonAppearance = 'solid' | 'outline' | 'light'

const base =
  'pixy-button-label inline-flex items-center justify-center gap-2 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pixy-rose'

const appearances: Record<PixyButtonAppearance, string> = {
  solid: 'bg-pixy-rose text-white hover:bg-pixy-rose-dark',
  outline: 'border border-pixy-rose text-pixy-rose bg-white hover:bg-pixy-blush-50',
  light: 'bg-white text-pixy-rose hover:bg-pixy-blush-50',
}

type Props = {
  appearance?: PixyButtonAppearance
  children: React.ReactNode
  className?: string
  href: string
  newTab?: boolean | null
  size?: 'md' | 'lg'
}

export const PixyButton: React.FC<Props> = ({
  appearance = 'solid',
  children,
  className,
  href,
  newTab,
  size = 'md',
}) => (
  <Link
    className={cn(
      base,
      appearances[appearance],
      size === 'lg' ? 'h-12 px-10' : 'h-11 px-8',
      className,
    )}
    href={href}
    {...(newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
  >
    {children}
  </Link>
)

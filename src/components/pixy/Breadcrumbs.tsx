import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { cn } from '@/utilities/ui'

export type Crumb = {
  href?: string
  label: string
}

export const Breadcrumbs: React.FC<{ className?: string; items: Crumb[] }> = ({
  className,
  items,
}) => (
  <nav aria-label="Breadcrumb" className={cn('text-xs text-pixy-muted', className)}>
    <ol className="flex flex-wrap items-center gap-1.5">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <li className="flex items-center gap-1.5" key={`${item.label}-${index}`}>
            {index > 0 && <ChevronRight aria-hidden="true" className="size-3 text-pixy-muted/60" />}
            {item.href && !isLast ? (
              <Link className="transition-colors hover:text-pixy-rose" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span aria-current={isLast ? 'page' : undefined} className="text-pixy-ink">
                {item.label}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  </nav>
)

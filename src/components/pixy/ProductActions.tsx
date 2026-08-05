import { ShoppingBag, Sparkles } from 'lucide-react'
import React from 'react'

import type { Product } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { PixyButton } from './PixyButton'

type Action = NonNullable<Product['actions']>[number]

const icons = {
  sparkles: Sparkles,
  cart: ShoppingBag,
}

export const ProductActions: React.FC<{ actions: Product['actions']; className?: string }> = ({
  actions,
  className,
}) => {
  if (!actions?.length) return null

  return (
    // Figma: two 227×48 buttons, 20px apart
    <div className={cn('flex flex-wrap gap-3 md:gap-5', className)}>
      {actions.map((action: Action, index) => {
        const Icon = action.icon && action.icon !== 'none' ? icons[action.icon] : null

        return (
          <PixyButton
            appearance={action.appearance === 'outline' ? 'outline' : 'solid'}
            className="h-12 min-w-[9.5rem] flex-1 md:w-[227px] md:flex-none"
            href={action.url}
            key={action.id ?? index}
            newTab={action.newTab}
          >
            {Icon && <Icon className="size-4" />}
            {action.label}
          </PixyButton>
        )
      })}
    </div>
  )
}

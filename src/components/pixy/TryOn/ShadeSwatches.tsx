'use client'

import { Check } from 'lucide-react'
import React from 'react'

import { cn } from '@/utilities/ui'

import type { TryOnShade } from './shades'

type Props = {
  onSelect: (shade: TryOnShade) => void
  selected: TryOnShade | null
  shades: TryOnShade[]
}

export const ShadeSwatches: React.FC<Props> = ({ onSelect, selected, shades }) => {
  return (
    <div
      aria-label="Choose a shade"
      className="flex gap-3 overflow-x-auto pb-1"
      role="radiogroup"
    >
      {shades.map((shade, index) => {
        const isSelected = selected?.id === shade.id

        return (
          <button
            aria-checked={isSelected}
            aria-label={shade.name}
            className="group flex shrink-0 flex-col items-center gap-1.5"
            key={shade.id ?? index}
            onClick={() => onSelect(shade)}
            role="radio"
            type="button"
          >
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-full ring-offset-2 transition-all',
                isSelected
                  ? 'ring-2 ring-pixy-rose'
                  : 'ring-1 ring-black/10 group-hover:ring-pixy-rose/50',
              )}
              style={{ backgroundColor: shade.swatch }}
            >
              {isSelected && <Check aria-hidden="true" className="size-4 text-white drop-shadow" />}
            </span>
            <span
              className={cn(
                'max-w-[72px] truncate text-[10px] leading-tight',
                isSelected ? 'font-medium text-pixy-ink' : 'text-pixy-muted',
              )}
            >
              {shade.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

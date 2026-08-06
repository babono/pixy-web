'use client'

import { ChevronRight, ShoppingBag } from 'lucide-react'
import React, { useState } from 'react'

import type { Media as MediaType, Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/utilities/ui'

export type BuyLink = NonNullable<Product['buyLinks']>[number]

type Props = {
  buyLinks: BuyLink[]
  className?: string
  /** Retailer name (lowercased) → logo, so the sheet matches "Shop Now". */
  logos?: Record<string, MediaType>
  productTitle: string
}

const pill =
  'pixy-button-label inline-flex h-12 items-center justify-center gap-2 rounded-full bg-pixy-rose px-8 text-white transition-colors hover:bg-pixy-rose-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pixy-rose'

export const BuyNowButton: React.FC<Props> = ({ buyLinks, className, logos, productTitle }) => {
  const [open, setOpen] = useState(false)

  if (!buyLinks.length) return null

  // Nothing to choose between — go straight there rather than opening a sheet
  // with a single row in it.
  if (buyLinks.length === 1) {
    return (
      <a
        className={cn(pill, className)}
        href={buyLinks[0].url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <ShoppingBag className="size-4" />
        Buy Now
      </a>
    )
  }

  return (
    <>
      <button className={cn(pill, className)} onClick={() => setOpen(true)} type="button">
        <ShoppingBag className="size-4" />
        Buy Now
      </button>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="w-[calc(100%-24px)] max-w-md p-0">
          <div className="border-b border-pixy-blush-200 px-5 py-4">
            <DialogTitle>Where to buy</DialogTitle>
            <p className="mt-0.5 text-xs text-pixy-muted">{productTitle}</p>
          </div>

          <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto p-5">
            {buyLinks.map((link, index) => {
              const logo = logos?.[link.retailer.toLowerCase()]

              return (
                <a
                  className="group flex items-center gap-3 rounded-full border border-pixy-blush-200 bg-white px-5 py-3.5 transition-shadow hover:shadow-md"
                  href={link.url}
                  key={link.id ?? index}
                  onClick={() => setOpen(false)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {logo ? (
                    <span className="relative size-8 shrink-0">
                      <Media fill imgClassName="object-contain" resource={logo} size="32px" />
                    </span>
                  ) : (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-pixy-blush-100 text-sm font-medium text-pixy-rose">
                      {link.retailer.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="flex-1 text-sm text-pixy-ink md:text-base">{link.retailer}</span>
                  <ChevronRight className="size-4 shrink-0 text-pixy-rose transition-transform group-hover:translate-x-0.5" />
                </a>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

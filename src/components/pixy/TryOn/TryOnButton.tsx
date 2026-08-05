'use client'

import { Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { useState } from 'react'

import type { Product } from '@/payload-types'

import { cn } from '@/utilities/ui'

import type { TryOnShade } from './ShadeSwatches'

/**
 * The filter pulls in MediaPipe plus an 11MB WASM runtime and a 3.7MB model.
 * None of that may touch the product page bundle, so the modal is only
 * imported once someone actually asks for it — and never on the server, since
 * it reaches straight for the camera and the canvas.
 */
const TryOnModal = dynamic(() => import('./TryOnModal'), { ssr: false })

type Props = {
  className?: string
  finish: NonNullable<NonNullable<Product['virtualTryOn']>['finish']>
  productTitle: string
  shades: TryOnShade[]
}

export const TryOnButton: React.FC<Props> = ({ className, finish, productTitle, shades }) => {
  const [open, setOpen] = useState(false)
  // Kept mounted after the first open so the close animation can play.
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <button
        className={cn(
          'pixy-button-label inline-flex h-12 items-center justify-center gap-2 rounded-full border border-pixy-rose px-6 text-pixy-rose transition-colors hover:bg-pixy-blush-50',
          className,
        )}
        onClick={() => {
          setLoaded(true)
          setOpen(true)
        }}
        type="button"
      >
        <Sparkles className="size-4" />
        Try Me
      </button>

      {loaded && (
        <TryOnModal
          finish={finish}
          onOpenChange={setOpen}
          open={open}
          productTitle={productTitle}
          shades={shades}
        />
      )}
    </>
  )
}

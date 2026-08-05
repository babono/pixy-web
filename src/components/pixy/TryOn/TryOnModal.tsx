'use client'

import { Camera, Download, Loader2, RefreshCw, Share2, X } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import type { Product } from '@/payload-types'

import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/utilities/ui'

import { ShadeSwatches } from './ShadeSwatches'
import type { TryOnShade } from './shades'
import { useLipRenderer } from './useLipRenderer'

type Props = {
  finish: NonNullable<NonNullable<Product['virtualTryOn']>['finish']>
  onOpenChange: (open: boolean) => void
  open: boolean
  productTitle: string
  shades: TryOnShade[]
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const TryOnModal: React.FC<Props> = ({
  finish,
  onOpenChange,
  open,
  productTitle,
  shades,
}) => {
  const [selected, setSelected] = useState<TryOnShade | null>(shades[0] ?? null)
  const [shot, setShot] = useState<string | null>(null)

  const { canvasRef, capture, containerRef, error, hasFace, layerRef, status, videoRef } =
    useLipRenderer({
      // Tied to `open` alone, deliberately. Stopping while a capture is on
      // screen would mean re-initialising the landmarker on every retake,
      // which costs a second or more; the still image just covers the canvas.
      active: open,
      color: selected?.swatch ?? null,
      finish,
    })

  // A fresh session should always start from the first shade.
  useEffect(() => {
    if (!open) {
      setShot(null)
      setSelected(shades[0] ?? null)
    }
  }, [open, shades])

  const handleDownload = useCallback(() => {
    if (!shot) return
    const link = document.createElement('a')
    link.href = shot
    link.download = `pixy-${slugify(productTitle)}-${slugify(selected?.name ?? 'try-on')}.png`
    link.click()
  }, [productTitle, selected, shot])

  const handleShare = useCallback(async () => {
    if (!shot) return

    try {
      const blob = await (await fetch(shot)).blob()
      const file = new File([blob], 'pixy-try-on.png', { type: 'image/png' })

      // Falls back to a download anywhere the file share target is missing,
      // which is most desktop browsers.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: `Trying on ${selected?.name ?? ''} from ${productTitle} ✨`,
          title: 'PIXY Virtual Try-On',
        })
        return
      }

      handleDownload()
    } catch {
      // A dismissed share sheet throws; nothing to recover from.
    }
  }, [handleDownload, productTitle, selected, shot])

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-24px)] max-w-md overflow-y-auto p-0">
        <div className="flex items-center justify-between border-b border-pixy-blush-200 px-5 py-4">
          <div>
            <DialogTitle>Virtual Try-On</DialogTitle>
            <p className="mt-0.5 text-xs text-pixy-muted">{productTitle}</p>
          </div>
          <DialogClose
            aria-label="Close"
            className="rounded-full p-1.5 text-pixy-muted transition-colors hover:bg-pixy-surface hover:text-pixy-ink"
          >
            <X className="size-5" />
          </DialogClose>
        </div>

        <div className="p-5">
          <div
            className="relative aspect-square w-full overflow-hidden rounded-xl bg-pixy-ink"
            ref={containerRef}
          >
            {/* Source frames only; everything visible is drawn to the canvas. */}
            <video className="hidden" muted playsInline ref={videoRef} />
            <canvas
              className={cn(
                'absolute inset-0 size-full scale-x-[-1] transition-opacity',
                shot ? 'opacity-0' : 'opacity-100',
              )}
              ref={canvasRef}
            />
            <canvas className="hidden" ref={layerRef} />

            {shot && (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="Your virtual try-on" className="absolute inset-0 size-full object-cover" src={shot} />
            )}

            {status === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                <Loader2 className="size-6 animate-spin" />
                <p className="text-xs text-white/80">Starting camera…</p>
              </div>
            )}

            {status === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <p className="text-center text-sm text-white/90">{error}</p>
              </div>
            )}

            {status === 'ready' && !hasFace && !shot && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-center text-xs text-white">
                  Position your face in the frame
                </p>
              </div>
            )}
          </div>

          {!shot && shades.length > 1 && (
            <div className="mt-5">
              <ShadeSwatches onSelect={setSelected} selected={selected} shades={shades} />
            </div>
          )}

          <div className="mt-5 flex gap-3">
            {shot ? (
              <>
                <button
                  className="pixy-button-label inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-pixy-rose text-pixy-rose transition-colors hover:bg-pixy-blush-50"
                  onClick={() => setShot(null)}
                  type="button"
                >
                  <RefreshCw className="size-4" />
                  Retake
                </button>
                <button
                  className="pixy-button-label inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-pixy-rose text-white transition-colors hover:bg-pixy-rose-dark"
                  onClick={handleShare}
                  type="button"
                >
                  <Share2 className="size-4" />
                  Share
                </button>
                <button
                  aria-label="Download photo"
                  className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-pixy-blush-200 text-pixy-muted transition-colors hover:text-pixy-ink"
                  onClick={handleDownload}
                  type="button"
                >
                  <Download className="size-4" />
                </button>
              </>
            ) : (
              <button
                className="pixy-button-label inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-pixy-rose text-white transition-colors hover:bg-pixy-rose-dark disabled:opacity-50"
                disabled={status !== 'ready'}
                onClick={() => setShot(capture())}
                type="button"
              >
                <Camera className="size-4" />
                Take Photo
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-pixy-muted">
            Shades are shown as a guide — on-skin colour varies. Nothing is uploaded; the camera
            runs entirely on your device.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TryOnModal

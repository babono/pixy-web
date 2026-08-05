'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Volume2, VolumeX, Play } from 'lucide-react'
import type { AsSeenOn, Media as MediaType, Product } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'

interface AsSeenOnCardProps {
  item: AsSeenOn
  index: number
}

function formatRupiah(amount: number): string {
  return `IDR ${amount.toLocaleString('id-ID')}`
}

export const AsSeenOnCard: React.FC<AsSeenOnCardProps> = ({ item, index }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [hasHoveredOnce, setHasHoveredOnce] = useState(false)

  // Resolve product info (either from linked Payload Product or fallback custom product)
  const linkedProduct =
    typeof item.product === 'object' && item.product !== null ? (item.product as Product) : null
  const custom = item.customProduct

  const title = linkedProduct?.title || custom?.name || item.title || 'PIXY Product'
  const price = linkedProduct?.price ?? custom?.price ?? 0
  const formattedPrice = formatRupiah(price)

  // Product CTA URL
  const ctaUrl = linkedProduct ? `/products/${linkedProduct.slug}` : custom?.url || '/products'

  // Product Image / Thumbnail
  let productImageSrc = ''
  if (linkedProduct && Array.isArray(linkedProduct.images) && linkedProduct.images[0]) {
    const firstImg = linkedProduct.images[0]
    if (typeof firstImg === 'object' && firstImg !== null) {
      productImageSrc = getMediaUrl((firstImg as MediaType).url) || ''
    }
  } else if (custom?.image && typeof custom.image === 'object' && custom.image !== null) {
    productImageSrc = getMediaUrl((custom.image as MediaType).url) || ''
  }

  // Video source
  let videoSrc = ''
  if (item.video && typeof item.video === 'object' && item.video !== null) {
    videoSrc = getMediaUrl((item.video as MediaType).url) || ''
  } else if (item.videoUrl) {
    videoSrc = item.videoUrl
  }

  // Cover / Poster thumbnail source
  let posterSrc = ''
  if (item.thumbnail && typeof item.thumbnail === 'object' && item.thumbnail !== null) {
    posterSrc = getMediaUrl((item.thumbnail as MediaType).url) || ''
  }

  const handleMouseEnter = () => {
    setHasHoveredOnce(true)
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (videoRef.current) {
      const nextMuted = !isMuted
      videoRef.current.muted = nextMuted
      setIsMuted(nextMuted)
    }
  }

  // Requirement #1: Hide 10th card (index === 9) on tablet so tablet displays an even 3x3 grid (9 items total)
  const isTenthItem = index === 9

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl bg-slate-950 aspect-[3/4] transition-all duration-300 hover:shadow-xl ${
        isTenthItem ? 'hidden lg:flex' : 'flex'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Element */}
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          loop
          muted={isMuted}
          playsInline
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            isPlaying ? 'opacity-100' : 'opacity-90'
          }`}
        />
      ) : posterSrc ? (
        <Image
          src={posterSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      ) : null}

      {/* Dark Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 transition-opacity duration-300 group-hover:from-black/85" />

      {/* Top Bar: Autoplay indicator badge & Audio Unmute Button */}
      <div className="relative z-10 p-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-white/90">
          <Play className={`size-3 text-pixy-rose ${isPlaying ? 'animate-pulse' : ''}`} />
          <span>{isPlaying ? 'Playing' : 'Hover to play'}</span>
        </div>

        {videoSrc && (
          <button
            type="button"
            onClick={toggleMute}
            className="flex size-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70 hover:text-pixy-rose"
            title={isMuted ? 'Unmute video sound' : 'Mute video sound'}
            aria-label={isMuted ? 'Unmute video sound' : 'Mute video sound'}
          >
            {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
          </button>
        )}
      </div>

      {/* Spacer to push content to bottom */}
      <div className="flex-1" />

      {/* Bottom Floating Product Overlay Card (Matching Reference Design) */}
      <div className="relative z-10 p-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-white/15 backdrop-blur-md p-2 border border-white/20 text-white shadow-lg transition-transform duration-300 group-hover:translate-y-[-2px]">
          {/* Product Thumbnail */}
          {productImageSrc ? (
            <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-white border border-white/40">
              <Image
                src={productImageSrc}
                alt={title}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          ) : (
            <div className="size-12 shrink-0 rounded-md bg-white/20 flex items-center justify-center text-xs font-bold">
              PIXY
            </div>
          )}

          {/* Product Info & CTA */}
          <div className="flex-1 min-w-0">
            <h4 className="line-clamp-1 text-xs font-bold uppercase tracking-wider text-white">
              {title}
            </h4>
            <p className="text-[11px] font-medium text-white/90">{formattedPrice}</p>

            <Link
              href={ctaUrl}
              className="mt-1 inline-block w-full rounded border border-white/80 bg-white/10 px-2 py-1 text-center text-[10px] font-bold tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              SHOP NOW
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

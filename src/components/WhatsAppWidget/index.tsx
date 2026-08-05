'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { SocialIcon } from '@/components/pixy/SocialIcon'

interface PurposeChip {
  id: string
  label: string
  defaultText: string
}

const PURPOSES: PurposeChip[] = [
  {
    id: 'shade',
    label: 'SHADE MATCHING',
    defaultText: 'Hi PIXY! I would like help finding my perfect shade match.',
  },
  {
    id: 'recommendation',
    label: 'PRODUCT RECOMMENDATION',
    defaultText: 'Hi PIXY! I would like product recommendations for my skin type.',
  },
  {
    id: 'promo',
    label: 'PROMO & OFFERS',
    defaultText: 'Hi PIXY! I have a question regarding current promos & offers.',
  },
  {
    id: 'order',
    label: 'ORDER ASSISTANCE',
    defaultText: 'Hi PIXY! I need assistance with my order.',
  },
]

const PHONE_NUMBER = '6281122301000'

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPurpose, setSelectedPurpose] = useState<string>('shade')
  const [message, setMessage] = useState<string>(PURPOSES[0].defaultText)
  const [currentTime, setCurrentTime] = useState<string>('09:41 AM')

  useEffect(() => {
    const now = new Date()
    setCurrentTime(
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    )
  }, [])

  const handleSelectPurpose = (chip: PurposeChip) => {
    setSelectedPurpose(chip.id)
    setMessage(chip.defaultText)
  }

  const handleSend = () => {
    const textToSend = message.trim() || PURPOSES[0].defaultText
    const url = `https://api.whatsapp.com/send/?phone=${PHONE_NUMBER}&text=${encodeURIComponent(
      textToSend,
    )}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* WhatsApp Modal Popup Window */}
      {isOpen && (
        <div className="mb-4 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-stone-200 bg-[#F7F4EE] shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between bg-pixy-rose px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-white text-[#25D366] shadow-md">
                <SocialIcon platform="whatsapp" className="size-6 text-[#25D366]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white">Chat with PIXY</h3>
                <p className="text-[10px] tracking-wider text-pink-100 uppercase">
                  REPLIES MON–FRI · 09:00–17:00 WIB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 space-y-4">
            {/* Welcome Speech Bubble */}
            <div className="relative rounded-2xl rounded-tl-sm border border-stone-200/80 bg-white p-3.5 shadow-sm">
              <p className="text-xs leading-relaxed text-stone-800">
                Halo! 🙏 Selamat datang di <span className="font-bold text-pixy-rose">PIXY</span>.
                Ada yang bisa kami bantu hari ini — rekomendasi produk, shade matching, atau konsultasi promo?
              </p>
              <span className="mt-2 block text-right text-[10px] font-medium text-stone-400">
                {currentTime}
              </span>
            </div>

            {/* Purpose Selection Chips */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">
                Select Purpose:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PURPOSES.map((chip) => {
                  const isSelected = selectedPurpose === chip.id
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => handleSelectPurpose(chip)}
                      className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold tracking-wider transition-all ${
                        isSelected
                          ? 'border-pixy-rose bg-pixy-rose text-white shadow-sm'
                          : 'border-stone-300 bg-stone-100/80 text-stone-700 hover:border-pixy-rose hover:bg-white'
                      }`}
                    >
                      {chip.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Textarea Input */}
            <div className="space-y-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows={3}
                className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs text-stone-800 focus:border-pixy-rose focus:outline-none focus:ring-1 focus:ring-pixy-rose"
              />
            </div>

            {/* Send CTA Button */}
            <div className="space-y-2 text-center">
              <button
                type="button"
                onClick={handleSend}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-pixy-rose px-4 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-md transition-colors hover:bg-pixy-rose-dark"
              >
                <SocialIcon platform="whatsapp" className="size-4 text-white" />
                <span>SEND ON WHATSAPP</span>
              </button>
              <p className="text-[9px] font-medium tracking-widest text-stone-500 uppercase">
                OPENS WHATSAPP — YOU STILL PRESS SEND THERE
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Circular Trigger Button (Elevated position on mobile above sticky bar) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex size-16 sm:size-20 flex-col items-center justify-center rounded-full bg-[#F6DADF] text-pixy-rose shadow-xl shadow-pixy-rose/20 transition-all duration-300 hover:scale-105 hover:bg-[#F2C6CF] hover:text-pixy-rose-dark active:scale-95 border border-white/80 shrink-0"
        aria-label="Chat us on WhatsApp"
      >
        <SocialIcon platform="whatsapp" className="size-5 sm:size-6 text-pixy-rose mb-0.5" />
        <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-pixy-rose uppercase leading-none">
          CHAT US
        </span>
      </button>
    </div>
  )
}

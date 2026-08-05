'use client'

import { ChevronDown, Menu, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import type { Header } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { Wordmark } from '@/components/pixy/Wordmark'
import { cn } from '@/utilities/ui'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Navigating away should always leave the header in its resting state
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setExpanded(null)
  }, [pathname])

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus()
  }, [searchOpen])

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = new FormData(event.currentTarget).get('q')
    router.push(query ? `/search?q=${encodeURIComponent(String(query))}` : '/search')
  }

  const navItems = data?.navItems || []
  const logo = data?.logo

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="container py-3">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-full bg-white/95 px-4 shadow-[0_2px_16px_rgba(181,105,127,0.12)] backdrop-blur-sm md:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex size-9 items-center justify-center rounded-full text-pixy-rose transition-colors hover:bg-pixy-blush-50 lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            <Link
              aria-label="PIXY home"
              className="flex shrink-0 items-center text-pixy-rose"
              href="/"
            >
              {typeof logo === 'object' && logo !== null ? (
                <span className="relative block h-6 w-20">
                  <Media fill imgClassName="object-contain object-left" resource={logo} size="80px" />
                </span>
              ) : (
                <Wordmark className="text-2xl" />
              )}
            </Link>
          </div>

          {/* Centered navigation across the entire header bar */}
          <div className={cn('absolute left-1/2 -translate-x-1/2 hidden lg:block', searchOpen && 'lg:hidden')}>
            <HeaderNav data={data} />
          </div>

          <form
            className={cn(
              'ml-auto flex items-center gap-2',
              searchOpen ? 'flex-1 lg:flex-none lg:w-80' : '',
            )}
            onSubmit={onSearch}
            role="search"
          >
            <input
              aria-label="Search"
              className={cn(
                'h-9 w-full min-w-0 rounded-full bg-pixy-blush-50 px-4 text-sm text-pixy-ink outline-hidden placeholder:text-pixy-muted focus:ring-2 focus:ring-pixy-rose/40',
                !searchOpen && 'hidden',
              )}
              name="q"
              placeholder={data?.searchPlaceholder || 'Search'}
              ref={searchInput}
              type="search"
            />
            <button
              aria-label={searchOpen ? 'Close search' : 'Search'}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-pixy-rose transition-colors hover:bg-pixy-blush-50"
              onClick={(event) => {
                // While closed the button opens the field rather than submitting
                if (!searchOpen) {
                  event.preventDefault()
                  setSearchOpen(true)
                }
              }}
              type={searchOpen ? 'submit' : 'button'}
            >
              <Search className="size-5" />
            </button>
            {searchOpen && (
              <button
                aria-label="Close search"
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-pixy-muted transition-colors hover:bg-pixy-blush-50"
                onClick={() => setSearchOpen(false)}
                type="button"
              >
                <X className="size-5" />
              </button>
            )}
          </form>
        </div>

        {menuOpen && (
          <nav className="mt-2 overflow-hidden rounded-3xl bg-white p-2 shadow-lg lg:hidden">
            <ul className="flex flex-col">
              {navItems.map((item, index) => {
                const subItems = item.subItems ?? []
                const key = item.id ?? String(index)
                const isOpen = expanded === key

                return (
                  <li className="border-b border-pixy-blush-100 last:border-b-0" key={key}>
                    <div className="flex items-center justify-between">
                      <CMSLink
                        {...item.link}
                        className="pixy-eyebrow flex-1 px-4 py-3.5 text-xs text-pixy-rose"
                      />
                      {Boolean(subItems.length) && (
                        <button
                          aria-expanded={isOpen}
                          aria-label={`Toggle ${item.link?.label ?? 'menu'} sub-items`}
                          className="px-4 py-3.5 text-pixy-rose"
                          onClick={() => setExpanded(isOpen ? null : key)}
                          type="button"
                        >
                          <ChevronDown
                            className={cn('size-4 transition-transform', isOpen && 'rotate-180')}
                          />
                        </button>
                      )}
                    </div>

                    {isOpen && (
                      <ul className="flex flex-col pb-2">
                        {subItems.map((subItem, subIndex) => (
                          <li key={subItem.id ?? subIndex}>
                            <CMSLink
                              {...subItem.link}
                              className="block px-8 py-2.5 text-sm text-pixy-ink"
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}

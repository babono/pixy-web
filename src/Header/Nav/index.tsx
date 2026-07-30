'use client'

import { ChevronDown } from 'lucide-react'
import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

/**
 * Desktop navigation. Items with sub-items open a hover/focus dropdown; the
 * group is CSS-driven so it keeps working without JavaScript.
 */
export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="hidden items-center gap-7 lg:flex">
      {navItems.map((item, index) => {
        const subItems = item.subItems ?? []

        if (!subItems.length) {
          return (
            <CMSLink
              {...item.link}
              className="pixy-eyebrow text-[11px] text-pixy-rose transition-colors hover:text-pixy-rose-dark"
              key={item.id ?? index}
            />
          )
        }

        return (
          <div className="group relative" key={item.id ?? index}>
            <CMSLink
              {...item.link}
              className="pixy-eyebrow flex items-center gap-1 text-[11px] text-pixy-rose transition-colors hover:text-pixy-rose-dark"
            >
              <ChevronDown className="size-3" />
            </CMSLink>

            <div className="invisible absolute top-full left-1/2 z-10 min-w-48 -translate-x-1/2 pt-4 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <ul className="flex flex-col gap-1 rounded-2xl bg-white p-3 shadow-lg">
                {subItems.map((subItem, subIndex) => (
                  <li key={subItem.id ?? subIndex}>
                    <CMSLink
                      {...subItem.link}
                      className="block rounded-lg px-3 py-2 text-sm text-pixy-ink transition-colors hover:bg-pixy-blush-50 hover:text-pixy-rose"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}
    </nav>
  )
}

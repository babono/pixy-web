import type { Product } from '@/payload-types'

/**
 * Deliberately not a client module: the product page is a server component and
 * needs `tryOnShades` to decide whether to render the button at all. Keeping it
 * out of ShadeSwatches.tsx (which is `'use client'`) is what makes that legal.
 */

export type TryOnShade = NonNullable<Product['shades']>[number] & { swatch: string }

/**
 * A shade is only usable by the filter if it carries a hex colour — an image
 * alone tells us nothing about what to paint.
 */
export const tryOnShades = (product: Pick<Product, 'shades'>): TryOnShade[] =>
  (product.shades ?? []).filter((shade): shade is TryOnShade =>
    Boolean(shade.swatch && /^#[0-9a-fA-F]{6}$/.test(shade.swatch)),
  )

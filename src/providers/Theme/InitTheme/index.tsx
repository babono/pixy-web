import Script from 'next/script'
import React from 'react'

import { defaultTheme } from '../ThemeSelector/types'

/**
 * The PIXY design is light-only — there is no dark palette in the Figma, and
 * the storefront paints its own backgrounds on every band. Honouring the OS
 * `prefers-color-scheme` therefore turned unpainted sections black, so the
 * theme is pinned to light rather than following the system or localStorage.
 */
export const InitTheme: React.FC = () => {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      dangerouslySetInnerHTML={{
        __html: `
  (function () {
    document.documentElement.setAttribute('data-theme', '${defaultTheme}')
  })();
  `,
      }}
      id="theme-script"
      strategy="beforeInteractive"
    />
  )
}

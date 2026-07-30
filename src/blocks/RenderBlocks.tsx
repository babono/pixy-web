import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { ArticleGridBlock } from '@/blocks/ArticleGrid/Component'
import { BrandValuesBlock } from '@/blocks/BrandValues/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CategoryGridBlock } from '@/blocks/CategoryGrid/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { HeroCarouselBlock } from '@/blocks/HeroCarousel/Component'
import { MarketplaceLinksBlock } from '@/blocks/MarketplaceLinks/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { ProductGridBlock } from '@/blocks/ProductGrid/Component'
import { SocialStripBlock } from '@/blocks/SocialStrip/Component'

const blockComponents = {
  archive: ArchiveBlock,
  articleGrid: ArticleGridBlock,
  brandValues: BrandValuesBlock,
  categoryGrid: CategoryGridBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  heroCarousel: HeroCarouselBlock,
  marketplaceLinks: MarketplaceLinksBlock,
  mediaBlock: MediaBlock,
  productGrid: ProductGridBlock,
  socialStrip: SocialStripBlock,
}

/**
 * PIXY storefront blocks are full-bleed bands that own their vertical rhythm
 * and background colour, so they must not get the generic `my-16` wrapper —
 * that would leave white gaps between adjacent coloured sections.
 */
const bleedBlocks = new Set([
  'articleGrid',
  'brandValues',
  'categoryGrid',
  'heroCarousel',
  'marketplaceLinks',
  'productGrid',
  'socialStrip',
])

export const isBleedBlock = (blockType: string | undefined): boolean =>
  Boolean(blockType && bleedBlocks.has(blockType))

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              if (bleedBlocks.has(blockType)) {
                /* @ts-expect-error there may be some mismatch between the expected types here */
                return <Block {...block} key={index} />
              }

              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}

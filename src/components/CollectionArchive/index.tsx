import { cn } from '@/utilities/ui'
import React from 'react'

import type { Search } from '@/payload-types'

import { Card, CardPostData } from '@/components/Card'

/**
 * Search results carry the collection they came from; posts rendered directly
 * (the /posts archive, the Archive block) don't and are always posts.
 */
export type ArchiveDoc = CardPostData & { doc?: Search['doc'] }

export type Props = {
  posts: ArchiveDoc[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <Card
                    className="h-full"
                    doc={result}
                    relationTo={result.doc?.relationTo === 'products' ? 'products' : 'posts'}
                    showCategories
                  />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import PageTemplate, { generateMetadata as generateSlugMetadata } from '../[slug]/page'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function AboutPage() {
  return PageTemplate({ params: Promise.resolve({ slug: 'about' }) })
}

export async function generateMetadata(): Promise<Metadata> {
  return generateSlugMetadata({ params: Promise.resolve({ slug: 'about' }) })
}

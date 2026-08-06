import type { Metadata } from 'next'
import PageTemplate, { generateMetadata as generateSlugMetadata } from '../[slug]/page'

export default async function AboutUsPage() {
  return PageTemplate({ params: Promise.resolve({ slug: 'about' }) })
}

export async function generateMetadata(): Promise<Metadata> {
  return generateSlugMetadata({ params: Promise.resolve({ slug: 'about' }) })
}

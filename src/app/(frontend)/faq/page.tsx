import type { Metadata } from 'next'
import PageTemplate, { generateMetadata as generateSlugMetadata } from '../[slug]/page'

export default async function FaqPage() {
  return PageTemplate({ params: Promise.resolve({ slug: 'faq' }) })
}

export async function generateMetadata(): Promise<Metadata> {
  return generateSlugMetadata({ params: Promise.resolve({ slug: 'faq' }) })
}

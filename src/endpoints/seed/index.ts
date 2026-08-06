import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest } from 'payload'

import { readdir, rm } from 'fs/promises'
import path from 'path'

import type { Marketplace, Media, Product, ProductCategory } from '@/payload-types'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import {
  asset,
  categoryAssets,
  heroAssets,
  logoAssets,
  marketplaceAssets,
  postAssets,
  productAssets,
  valueAssets,
} from './pixy/assets'
import { packshot, palettes } from './pixy/images'
import { richText } from './pixy/lexical'
import { seedAsSeenOnItems } from './pixy/asSeenOn'
import { seedPosts } from './pixy/posts'
import { seedProducts } from './pixy/products'

const collections: CollectionSlug[] = [
  'as-seen-on',
  'categories',
  'media',
  'pages',
  'posts',
  'products',
  'product-categories',
  'marketplaces',
  'forms',
  'form-submissions',
  'search',
]

const globals: GlobalSlug[] = ['header', 'footer']

/** Shop categories, in the order they appear in "Find What You Need" */
const productCategories = [
  {
    slug: 'base-makeup',
    title: 'Base Makeup',
    tint: 'lavender' as const,
    description:
      'Two way cakes, loose powders and foundations for a bright, even finish that lasts all day.',
    art: { palette: palettes.lavender, shape: 'compact' as const },
  },
  {
    slug: 'decoratives',
    title: 'Decoratives',
    tint: 'sky' as const,
    description: 'Lipsticks, liners and brow pencils to colour, define and finish the look.',
    art: { palette: palettes.sky, shape: 'lipstick' as const },
  },
  {
    slug: 'skin-care',
    title: 'Skin Care',
    tint: 'mint' as const,
    description: 'Serums, moisturisers and essences built around hydration and everyday radiance.',
    art: { palette: palettes.mint, shape: 'bottle' as const },
  },
  {
    slug: 'wellness',
    title: 'Wellness',
    tint: 'pink' as const,
    description: 'Beauty from the inside out — supplements formulated to support skin and hair.',
    art: { palette: palettes.blush, shape: 'bottle' as const },
  },
]

const marketplaces = [
  { name: 'Tokopedia', url: 'https://www.tokopedia.com/', color: '#42B549', initial: 'T' },
  { name: 'Shopee', url: 'https://shopee.co.id/', color: '#EE4D2D', initial: 'S' },
  { name: 'TikTok Shop', url: 'https://www.tiktok.com/shop', color: '#010101', initial: 'd' },
  { name: 'Lazada', url: 'https://www.lazada.co.id/', color: '#F1494E', initial: 'L' },
]

const brandValues = [
  { label: 'Halal Certified', badge: 'H' },
  { label: 'Registered in BPOM', badge: 'B' },
  { label: 'Vegan Friendly', badge: 'V' },
]

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `pnpm seed` locally instead of using the admin UI within an active app
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  payload.logger.info(`— Clearing collections and globals...`)

  for (const global of globals) {
    await payload.updateGlobal({
      slug: global,
      data: {},
      depth: 0,
      context: { disableRevalidate: true },
    })
  }

  for (const collection of collections) {
    await payload.db.deleteMany({ collection, req, where: {} })

    if (payload.collections[collection].config.versions) {
      await payload.db.deleteVersions({ collection, req, where: {} })
    }
  }

  await payload.delete({
    collection: 'users',
    depth: 0,
    where: { email: { equals: 'demo-author@example.com' } },
  })

  // Wiping the media collection leaves the uploaded files behind, and Payload
  // then suffixes re-uploads (`pixy-hero-1-1.webp`). Clearing the upload dir
  // keeps repeated seeds from piling up orphans. Only ever holds seeded uploads.
  await clearUploadDir(payload)

  payload.logger.info(`— Loading Figma artwork...`)

  const [heroFiles, categoryFiles, valueFiles, marketplaceFiles, editorialFiles] =
    await Promise.all([
      Promise.all(
        heroAssets.flatMap((slide) => [
          asset(slide.file, slide.name),
          asset(slide.mobileFile, slide.mobileName),
        ]),
      ),
      Promise.all(
        productCategories.map((category) =>
          asset(categoryAssets[category.slug], `pixy-category-${category.slug}`),
        ),
      ),
      Promise.all(valueAssets.map((file, index) => asset(file, `pixy-value-${index + 1}`))),
      Promise.all(
        marketplaces.map((marketplace) =>
          asset(
            marketplaceAssets[marketplace.name],
            `pixy-marketplace-${marketplace.name.toLowerCase().replace(/\s+/g, '-')}`,
          ),
        ),
      ),
      Promise.all(
        seedPosts.map((post) => asset(postAssets[post.slug], `pixy-post-${post.slug}`)),
      ),
    ])

  payload.logger.info(`— Seeding media...`)

  // Every write shares `req` and therefore one transaction, and MongoDB forbids
  // concurrent operations on a single session — so uploads run one at a time.
  const createMedia = (file: Awaited<ReturnType<typeof asset>>, alt: string) =>
    payload.create({ collection: 'media', data: { alt }, file, req })

  const createMediaBatch = async (
    files: Awaited<ReturnType<typeof asset>>[],
    alt: (index: number) => string,
  ): Promise<Media[]> => {
    const docs: Media[] = []
    for (const [index, file] of files.entries()) {
      docs.push(await createMedia(file, alt(index)))
    }
    return docs
  }

  // `heroFiles` alternates desktop/mobile per slide; pair them back up so the
  // carousel can't accidentally point a slide at the other slide's crop.
  const heroFlat = await createMediaBatch(
    heroFiles,
    (index) => `PIXY campaign banner ${Math.floor(index / 2) + 1}`,
  )
  const heroMedia = heroAssets.map((_, index) => ({
    desktop: heroFlat[index * 2],
    mobile: heroFlat[index * 2 + 1],
  }))
  const categoryMedia = await createMediaBatch(
    categoryFiles,
    (index) => `${productCategories[index].title} category`,
  )
  const valueMedia = await createMediaBatch(valueFiles, (index) => brandValues[index].label)
  const marketplaceMedia = await createMediaBatch(
    marketplaceFiles,
    (index) => `${marketplaces[index].name} logo`,
  )
  const editorialMedia = await createMediaBatch(editorialFiles, (index) => seedPosts[index].title)

  const logoRoseMedia = await createMedia(
    await asset(logoAssets.rose, 'pixy-logo-rose'),
    'PIXY',
  )
  const logoWhiteMedia = await createMedia(
    await asset(logoAssets.white, 'pixy-logo-white'),
    'PIXY',
  )

  payload.logger.info(`— Seeding shop taxonomy...`)

  const demoAuthor = await payload.create({
    collection: 'users',
    data: { name: 'PIXY Editorial', email: 'demo-author@example.com', password: 'password' },
    req,
  })

  const categoryDocs: Record<string, ProductCategory> = {}
  for (const [index, category] of productCategories.entries()) {
    categoryDocs[category.slug] = await payload.create({
      collection: 'product-categories',
      depth: 0,
      context: { disableRevalidate: true },
      data: {
        title: category.title,
        slug: category.slug,
        tint: category.tint,
        description: category.description,
        image: categoryMedia[index].id,
      },
      req,
    })
  }

  const marketplaceDocs: Marketplace[] = []
  for (const [index, marketplace] of marketplaces.entries()) {
    marketplaceDocs.push(
      await payload.create({
        collection: 'marketplaces',
        depth: 0,
        data: {
          name: marketplace.name,
          url: marketplace.url,
          logo: marketplaceMedia[index].id,
        },
        req,
      }),
    )
  }

  // Post taxonomy — drives the "TIPS" / "REVIEW" eyebrow on article cards
  const postCategories: Record<string, string> = {}
  for (const title of ['Tips', 'Review']) {
    const doc = await payload.create({
      collection: 'categories',
      depth: 0,
      data: { title, slug: title.toLowerCase() },
      req,
    })
    postCategories[title] = doc.id
  }

  payload.logger.info(`— Seeding products...`)

  const productDocs: Record<string, Product> = {}
  for (const product of seedProducts) {
    // Only the two products the Figma art-directs have a real key visual. It
    // leads the gallery, with the generated packshots kept behind it so every
    // product still has the multi-image set the design's thumbnail row needs.
    const realArt = productAssets[product.slug]

    // The design's thumbnail row is 4 wide, so the real visual displaces one
    // generated packshot rather than adding a fifth that would wrap.
    const palettes = realArt ? product.art.palettes.slice(0, -1) : product.art.palettes

    const generated = await Promise.all(
      palettes.map((palette, index) =>
        packshot({
          bandLabel: product.art.bandLabel,
          name: `${product.slug}-${index + (realArt ? 2 : 1)}`,
          palette,
          shape: product.art.shape,
          variantLabel: product.art.variantLabel,
        }),
      ),
    )

    const files = realArt
      ? [await asset(realArt, `${product.slug}-1`), ...generated]
      : generated

    const images: Media[] = []
    for (const [index, file] of files.entries()) {
      images.push(await createMedia(file, `${product.title} — image ${index + 1}`))
    }

    productDocs[product.slug] = await payload.create({
      collection: 'products',
      depth: 0,
      context: { disableRevalidate: true },
      data: {
        title: product.title,
        slug: product.slug,
        _status: 'published',
        category: [categoryDocs[product.categorySlug].id],
        price: product.price,
        featured: product.featured,
        shortDescription: product.shortDescription,
        images: images.map((image) => image.id),
        highlights: product.highlights.map((label) => ({ label })),
        actions: product.actions,
        description: richText(product.description),
        howToUse: richText(product.howToUse),
        reviews: product.reviews,
        meta: {
          title: `${product.title} | PIXY`,
          description: product.shortDescription,
          image: images[0].id,
        },
        publishedAt: new Date().toISOString(),
      },
      req,
    })
  }

  // Cross-link products within each category so "Similar Products" is populated
  for (const product of seedProducts) {
    const siblings = seedProducts
      .filter(
        (candidate) =>
          candidate.categorySlug === product.categorySlug && candidate.slug !== product.slug,
      )
      .map((candidate) => productDocs[candidate.slug].id)

    if (!siblings.length) continue

    await payload.update({
      collection: 'products',
      id: productDocs[product.slug].id,
      depth: 0,
      context: { disableRevalidate: true },
      data: { relatedProducts: siblings },
      req,
    })
  }

  payload.logger.info(`— Seeding posts...`)

  const postDocs = []
  for (const [index, post] of seedPosts.entries()) {
    postDocs.push(
      await payload.create({
        collection: 'posts',
        depth: 0,
        context: { disableRevalidate: true },
        data: {
          title: post.title,
          slug: post.slug,
          _status: 'published',
          authors: [demoAuthor.id],
          categories: [postCategories[post.category]],
          heroImage: editorialMedia[index].id,
          content: richText(post.body),
          meta: {
            title: `${post.title} | PIXY`,
            description: post.excerpt,
            image: editorialMedia[index].id,
          },
          publishedAt: new Date().toISOString(),
        },
        req,
      }),
    )
  }

  payload.logger.info(`— Seeding As Seen On feed items...`)

  const asSeenOnDocs = []
  for (const [index, item] of seedAsSeenOnItems.entries()) {
    const thumbMedia = editorialMedia[index % editorialMedia.length]
    const linkedProd = item.productSlug ? productDocs[item.productSlug] : null

    asSeenOnDocs.push(
      await payload.create({
        collection: 'as-seen-on',
        depth: 0,
        context: { disableRevalidate: true },
        data: {
          title: item.title,
          thumbnail: thumbMedia.id,
          videoUrl: item.videoUrl,
          tiktokUrl: item.tiktokUrl,
          sortOrder: item.sortOrder,
          product: linkedProd ? linkedProd.id : undefined,
          customProduct: {
            name: item.customName,
            price: item.customPrice,
            category: item.customCategory,
            url: item.customUrl || (linkedProd ? `/products/${linkedProd.slug}` : '/products'),
          },
        },
        req,
      }),
    )
  }

  payload.logger.info(`— Seeding pages...`)

  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData,
    req,
  })

  const contactPage = await payload.create({
    collection: 'pages',
    depth: 0,
    context: { disableRevalidate: true },
    data: contactPageData({ contactForm }),
    req,
  })

  await payload.create({
    collection: 'pages',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Home',
      slug: 'home',
      _status: 'published',
      hero: { type: 'none' },
      layout: [
        {
          blockType: 'heroCarousel',
          autoplay: true,
          intervalSeconds: 6,
          slides: [
            {
              image: heroMedia[0].desktop.id,
              imageMobile: heroMedia[0].mobile.id,
              headline: "Don't stop\ntill you\nget enough",
              subheadline: 'Get up to 40% discount this July only.',
              link: { type: 'custom', url: '/products', label: 'Get Offer' },
            },
            {
              image: heroMedia[1].desktop.id,
              imageMobile: heroMedia[1].mobile.id,
              headline: 'Mattenetic\nTransferproof\nLipstick',
              subheadline: '12 hours longlasting matte finish, available in 8 shades.',
              link: {
                type: 'reference',
                reference: {
                  relationTo: 'products',
                  value: productDocs['pixy-mattenetic-transferproof-lipstick'].id,
                },
                label: 'Shop the shades',
              },
            },
            {
              image: heroMedia[2].desktop.id,
              imageMobile: heroMedia[2].mobile.id,
              headline: 'Perfect fit,\nall day long',
              subheadline: 'Two way cake with SPF 30 PA+++ and 12 hour coverage.',
              link: {
                type: 'reference',
                reference: {
                  relationTo: 'products',
                  value: productDocs['pixy-twc-perfect-fit-07-cream-beige-refill'].id,
                },
                label: 'Discover TWC',
              },
            },
          ],
        },
        {
          blockType: 'brandValues',
          heading: 'Real beauty,\nrooted in quality',
          body: 'PIXY blends advanced Japanese beauty expertise with effortless modern elegance to celebrate your authentic, everyday glow. Our Halal-certified, high-performance makeup and skincare collections deliver a flawless, chic finish designed to empower your unique beauty.',
          values: brandValues.map((value, index) => ({
            label: value.label,
            icon: valueMedia[index].id,
          })),
        },
        {
          blockType: 'categoryGrid',
          heading: 'Find What You Need',
          categories: productCategories.map((category) => categoryDocs[category.slug].id),
        },
        {
          blockType: 'productGrid',
          heading: 'Popular Products',
          source: 'featured',
          limit: 4,
          cta: { enabled: true, link: { type: 'custom', url: '/products', label: 'See More' } },
        },
        {
          blockType: 'marketplaceLinks',
          heading: 'Shop Now',
          marketplaces: marketplaceDocs.map((marketplace) => marketplace.id),
        },
        {
          blockType: 'asSeenOnFeed',
          heading: 'AS SEEN ON',
          source: 'latest',
          limit: 10,
        },
        {
          blockType: 'socialStrip',
          heading: 'Stay Connected',
        },
      ],
      meta: {
        title: 'PIXY | Real beauty, rooted in quality',
        description:
          'Japanese beauty expertise for your authentic, everyday glow. Halal-certified makeup and skincare from PIXY.',
        image: heroMedia[0].desktop.id,
      },
    },
    req,
  })

  payload.logger.info(`— Seeding globals...`)

  // No `disableRevalidate` here: the header and footer are served from the
  // `global_header` / `global_footer` cache tags, so a running dev server has to
  // be told to drop them or the site keeps rendering the pre-seed navigation.
  await payload.updateGlobal({
    slug: 'header',
    data: {
      logo: logoRoseMedia.id,
      searchPlaceholder: 'Search products, beauty and more',
      navItems: [
        {
          link: { type: 'custom', url: '/products', label: 'Products' },
          subItems: productCategories.map((category) => ({
            link: {
              type: 'reference' as const,
              reference: {
                relationTo: 'product-categories' as const,
                value: categoryDocs[category.slug].id,
              },
              label: category.title,
            },
          })),
        },
        { link: { type: 'custom', url: '/products', label: 'Offers' } },
        { link: { type: 'custom', url: '/posts', label: 'News & Updates' } },
        {
          link: {
            type: 'reference',
            reference: { relationTo: 'pages', value: contactPage.id },
            label: 'About',
          },
        },
      ],
    },
    req,
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      logo: logoWhiteMedia.id,
      tagline:
        'Real beauty, rooted in quality. Japanese beauty expertise for your authentic, everyday glow.',
      columns: [
        {
          title: 'Products',
          navItems: productCategories.map((category) => ({
            link: {
              type: 'reference' as const,
              reference: {
                relationTo: 'product-categories' as const,
                value: categoryDocs[category.slug].id,
              },
              label: category.title,
            },
          })),
        },
        {
          title: 'E-Commerce',
          navItems: marketplaceDocs.map((marketplace) => ({
            link: {
              type: 'custom' as const,
              url: marketplace.url,
              label: marketplace.name,
              newTab: true,
            },
          })),
        },
        {
          title: 'Brand',
          navItems: [
            {
              link: {
                type: 'reference' as const,
                reference: { relationTo: 'pages' as const, value: contactPage.id },
                label: 'About Us',
              },
            },
            { link: { type: 'custom' as const, url: '/products', label: 'Promos & Offers' } },
            { link: { type: 'custom' as const, url: '/posts', label: 'News & Updates' } },
            { link: { type: 'custom' as const, url: '/search', label: 'FAQ' } },
          ],
        },
      ],
      socialLinks: [
        { platform: 'youtube', url: 'https://www.youtube.com/user/PixyIndonesia/videos' },
        { platform: 'facebook', url: 'https://www.facebook.com/PIXYIndonesiaOfficial' },
        { platform: 'x', url: 'https://www.twitter.com/PIXYIndonesia' },
        { platform: 'tiktok', url: 'https://www.tiktok.com/@pixycosmetics_id' },
        { platform: 'instagram', url: 'https://www.instagram.com/pixycosmetics' },
        { platform: 'whatsapp', url: 'http://wa.me/6281122301000' },
      ],
      localeLinks: [
        { link: { type: 'custom', url: '/', label: 'English' } },
        { link: { type: 'custom', url: '/', label: 'Bahasa Indonesia' } },
      ],
      legalLinks: [
        { link: { type: 'custom', url: '/', label: 'Privacy Policy' } },
        { link: { type: 'custom', url: '/', label: 'Terms and Conditions' } },
      ],
      copyright: `© ${new Date().getFullYear()} PIXY. All rights reserved.`,
    },
    req,
  })

  payload.logger.info('Seeded database successfully!')
}

/**
 * Empties the Media collection's `staticDir` (public/media). Scoped to exactly
 * the directory Payload is configured to upload into — never a wider path.
 */
const clearUploadDir = async (payload: Payload): Promise<void> => {
  const staticDir = payload.collections.media?.config.upload?.staticDir

  if (typeof staticDir !== 'string') return

  const entries = await readdir(staticDir).catch(() => [])

  for (const entry of entries) {
    await rm(path.join(staticDir, entry), { force: true, recursive: true })
  }
}

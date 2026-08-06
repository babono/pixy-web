import type { RequiredDataFromCollectionSlug } from 'payload'

type AboutArgs = {
  valueMediaIds?: string[]
}

export const aboutPageData = ({
  valueMediaIds = [],
}: AboutArgs = {}): RequiredDataFromCollectionSlug<'pages'> => {
  return {
    slug: 'about',
    _status: 'published',
    title: 'About Us',
    hero: {
      type: 'none',
    },
    layout: [
      {
        blockType: 'brandProfile',
        title: 'ABOUT US',
        subtitle: 'BRAND PROFILE',
        paragraphs: [
          {
            text: 'Kecantikan bagi perempuan merupakan energi yang dapat meningkatkan kepercayaan diri dan suasana hati. Untuk melengkapinya, PIXY hadir untuk mendukung penampilanmu yang modern, feminine, chic, dan simple.',
          },
          {
            text: 'Bersama PIXY, cantiknya perempuan Asia akan menginspirasi energi positif kepada orang-orang sekitar untuk menggapai mimpi mereka.',
          },
          {
            text: 'Pancarkan energi positif melalui cantikmu.',
          },
          {
            text: 'My Beauty, My Energy.',
          },
        ],
      },
      {
        blockType: 'brandValues',
        heading: 'Real beauty,\nrooted in quality',
        body: 'PIXY blends advanced Japanese beauty expertise with effortless modern elegance to celebrate your authentic, everyday glow. Our Halal-certified, high-performance makeup and skincare collections deliver a flawless, chic finish designed to empower your unique beauty.',
        values: [
          { label: 'Japanese Quality Standard', icon: valueMediaIds[0] },
          { label: 'Halal Certified Formula', icon: valueMediaIds[1] },
          { label: 'Tokyo Chic Aesthetics', icon: valueMediaIds[2] },
        ].filter((v) => Boolean(v.icon)),
      },
      {
        blockType: 'socialStrip',
        heading: 'Stay Connected',
      },
    ],
    meta: {
      // No title: it falls back to the page title, and SITE_NAME is appended.
      description:
        'Ketahui lebih banyak tentang profil brand PIXY, visi, dan filosofi kecantikan kami.',
    },
  }
}

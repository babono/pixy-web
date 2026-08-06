import type { RequiredDataFromCollectionSlug } from 'payload'

export const aboutStatic: RequiredDataFromCollectionSlug<'pages'> = {
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
        { label: 'Japanese Quality Standard' },
        { label: 'Halal Certified Formula' },
        { label: 'Tokyo Chic Aesthetics' },
      ],
    },
    {
      blockType: 'socialStrip',
      heading: 'Stay Connected',
    },
  ],
  meta: {
    title: 'About Us | PIXY',
    description:
      'Ketahui lebih banyak tentang profil brand PIXY, visi, dan filosofi kecantikan kami.',
  },
}

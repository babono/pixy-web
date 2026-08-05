export type SeedAsSeenOnItem = {
  title: string
  productSlug?: string
  customName?: string
  customPrice?: number
  customCategory?: string
  customUrl?: string
  videoUrl: string
  tiktokUrl?: string
  sortOrder: number
}

const sampleVideos = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFocus.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
]

export const seedAsSeenOnItems: SeedAsSeenOnItem[] = [
  {
    title: 'WONDERBALM! Lip & Blush Try On',
    customName: 'WONDERBALM! Lip & Blush',
    customPrice: 119000,
    customCategory: 'Lip Care',
    videoUrl: sampleVideos[0],
    tiktokUrl: 'https://www.tiktok.com/@pixy/video/1',
    sortOrder: 1,
  },
  {
    title: 'Custom WONDERBALM! Solid Perfume Review',
    customName: 'Custom WONDERBALM! Solid Perfume',
    customPrice: 149000,
    customCategory: 'Fragrance',
    videoUrl: sampleVideos[1],
    tiktokUrl: 'https://www.tiktok.com/@pixy/video/2',
    sortOrder: 2,
  },
  {
    title: 'DEWDROP! Tint Hydration Swatch',
    customName: 'DEWDROP! Lip Tint',
    customPrice: 89000,
    customCategory: 'Lip Tint',
    videoUrl: sampleVideos[2],
    tiktokUrl: 'https://www.tiktok.com/@pixy/video/3',
    sortOrder: 3,
  },
  {
    title: 'VELVETDROP! Soft Matte Finish',
    customName: 'VELVETDROP! Lip Velvet',
    customPrice: 59000,
    customCategory: 'Lip Care',
    videoUrl: sampleVideos[3],
    tiktokUrl: 'https://www.tiktok.com/@pixy/video/4',
    sortOrder: 4,
  },
  {
    title: 'GLOWTINT Glossy Everyday Makeup',
    customName: 'GLOWTINT Lip Stain',
    customPrice: 69000,
    customCategory: 'Decoratives',
    videoUrl: sampleVideos[4],
    tiktokUrl: 'https://www.tiktok.com/@pixy/video/5',
    sortOrder: 5,
  },
  {
    title: 'PIXY Mattenetic 12H Wear Wear-Test',
    productSlug: 'pixy-mattenetic-transferproof-lipstick',
    customName: 'PIXY Mattenetic Transferproof Lipstick',
    customPrice: 62100,
    customCategory: 'Decoratives',
    videoUrl: sampleVideos[5],
    tiktokUrl: 'https://www.tiktok.com/@pixy/video/6',
    sortOrder: 6,
  },
  {
    title: 'PIXY Two Way Cake Flawless Coverage',
    customName: 'PIXY UV Whitening Two Way Cake',
    customPrice: 55000,
    customCategory: 'Base Makeup',
    videoUrl: sampleVideos[6],
    tiktokUrl: 'https://www.tiktok.com/@pixy/video/7',
    sortOrder: 7,
  },
  {
    title: 'Quick & Glow Setting Spray Mist Demo',
    customName: 'PIXY Quick & Glow Spray',
    customPrice: 48000,
    customCategory: 'Face Mist',
    videoUrl: sampleVideos[7],
    tiktokUrl: 'https://www.tiktok.com/@pixy/video/8',
    sortOrder: 8,
  },
  {
    title: 'Liquid Foundation All Day Test',
    customName: 'PIXY Perfect Fit Liquid Foundation',
    customPrice: 58000,
    customCategory: 'Base Makeup',
    videoUrl: sampleVideos[8],
    tiktokUrl: 'https://www.tiktok.com/@pixy/video/9',
    sortOrder: 9,
  },
  {
    title: 'Intense Pen Eyeliner Winged Tutorial',
    customName: 'PIXY Intense Pen Eyeliner',
    customPrice: 42000,
    customCategory: 'Eye Makeup',
    videoUrl: sampleVideos[9],
    tiktokUrl: 'https://www.tiktok.com/@pixy/video/10',
    sortOrder: 10,
  },
]

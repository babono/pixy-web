'use client'

import { ChevronDown } from 'lucide-react'
import React, { useState } from 'react'

import { cn } from '@/utilities/ui'

export type FaqItem = {
  answer: string
  id?: string
  listItems?: { text: string }[]
  question: string
}

export type FaqBlockProps = {
  items?: FaqItem[]
  subtitle?: string
  title?: string
}

export const defaultFaqItems: FaqItem[] = [
  {
    question: 'DI MANAKAH PRODUK PIXY BISA DIBELI?',
    answer:
      'Produk PIXY tersedia di minimarket, supermarket, dan hypermarket serta toko kosmetik di kota Anda, seperti Indomaret, Alfamart, Alfamidi, Indogrosir, Lotte Shopping, Dan+dan, Beau, Hypermart, Giant, Lotte Mart, Lulu Hypermart, Ramayana, Lion Superindo, Hero, Guardian, Boston, Foodmart, Farmers Market, AEON, Matahari Department Store, Supermarket dan Department Store lokal serta toko-toko kosmetik tradisional di kota Anda.',
  },
  {
    question: 'BERAPA HARGA PRODUK-PRODUK PIXY?',
    answer:
      'Produk PIXY dijual dengan rentang harga Rp 13.000 s.d Rp 125.000 (menurut Harga Eceran Tertinggi yang disarankan)',
  },
  {
    question: 'BAGAIMANA MENGETAHUI PRODUK PIXY YANG ASLI DAN PALSU?',
    answer:
      'Mohon mengecek nomor notifikasi BPOM yang tercantum pada produk, Periksa kemasan produk apakah terdapat nomor Lot dan Exp Date, Jika mencurigakan lakukan recheck menggunakan produk lama atau jika mencurigai suatu produk PIXY palsu, mohon hubungi customer care kami di nomor 0-800-1-626366 atau email melalui customercare@mandom.co.id',
  },
  {
    question: 'APAKAH PRODUK PIXY BISA DIBELI SECARA ONLINE?',
    answer:
      'Ya, saat ini produk PIXY bisa dibeli online di e-commerce yang telah bekerjasama dengan PIXY secara resmi yaitu www.blibli.com, www.lazada.co.id, www.shopee.co.id',
  },
  {
    question: 'APAKAH PRODUK PIXY AMAN UNTUK IBU HAMIL?',
    answer:
      'Mohon untuk berkonsultasi dengan dokter spesialis, hal ini dikarenakan kondisi kehamilan setiap orang berbeda beda sehingga untuk keamanan penggunaan produk selama kehamilan perlu disesuaikan dengan kondisi ibu dan bayi',
  },
  {
    question: 'APAKAH PRODUK PIXY HALAL?',
    answer:
      'Ya, pada dasarnya sejak dulu formula PIXY halal karena secara internal PT MID sebagai produsen PIXY telah menerapkan Kebijakan Jaminan Halal, dimana semua produk yang diproduksi harus memperhatikan kehalalannya. Artinya sejak dulu produksi PIXY selalu memperhatikan kehalalan produk yang dihasilkan. Namun saat itu, tidak bisa diumumkan secara formal karena PIXY belum disertifikasi Halal oleh LPPOM MUI. Saat ini PIXY telah mendapat sertifikat dan secara formal bisa diumumkan sebagai merek "Halal".',
  },
  {
    question: 'APAKAH PRODUK PIXY COCOK UNTUK KULIT SENSITIVE?',
    answer:
      'Pada dasarnya semua produk yang diproduksi PT. Mandom Indonesia telah lolos uji keamanan produk (safety test), namun kondisi kulit sensitif, penyebab kulit sensitif dan cara penggunaan produk setiap orang berbeda beda, mohon berkonsultasi kepada dermatologis bahan bahan apa yang perlu dihindari oleh pengguna berkulit sensitif. Dan mohon untuk mengecek bahan baku pada back text kemasan sebelum menggunakan produk.',
  },
  {
    question: 'DIMANA SAJAKAH TOKO YANG TERDAFTAR PBC?',
    answer:
      'Total toko yang terdaftar PBC ialah sebanyak 572 toko yang tersebar di Jakarta, Bogor, Tangerang, Karawang, Bandung, Cirebon, Purwokerto, Yogyakarta, Semarang, Surabaya, Malang, Kediri, Jember, Bali, Lombok, Kupang, Lampung, Pangkal Pinang, Bengkulu, Palembang, Jambi, Padang, Medan, Pekanbaru, Lhokseumawe, Batam, Tanjung Pinang, Banjarmasin, Pontianak, Balikpapan, Samarinda, Tarakan, Makasar, Palu, Gorontalo, Manado, dan Sorong.',
  },
  {
    question: 'BAGAIMANA CARA MENDAFTAR PIXY BEAUTY COMMUNITY?',
    answer: '',
    listItems: [
      {
        text: 'Konsumen membeli produk PIXY senilai Rp 50.000 di Toko yang terdaftar PBC. Konsumen mendapatkan kartu member PBC serta mengisi Form kelengkapan data seperti Nama, Alamat, No Telephone Dll.',
      },
      {
        text: 'Untuk mengaktifkan kartu PBC dengan registrasi SMS ke 99333 tarif Rp 550/sms atau ke No 08121267799 (tarif normal) dengan Format : PIXY(spasi)PBC(spasi)kode kota&toko#PBC Number#Nama lengkap#Nomor telepon',
      },
      {
        text: 'Kartu PBC dapat digunakan di toko yang bertanda PBC',
      },
    ],
  },
  {
    question: 'APAKAH PIXY ADALAH LOCAL BRAND?',
    answer:
      'PIXY adalah brand yang didevelop di Indonesia namun di bawah lisensi Mandom Corporation Japan.',
  },
  {
    question: 'APAKAH PRODUK PIXY MENYEBABKAN JERAWAT DAN KOMEDO?',
    answer:
      'Beberapa produk PIXY teruji secara dermatologist tidak menyebabkan kulit berjerawat dan berkomedo, pernyataan ini tercantum pula dalam klaim produk PIXY Compact Powder Pure Finish. Dengan penggunaan yang tepat produk produk PIXY tidak memicu timbulnya jerawat dan komedo. Pastikan wajah dibersihkan dengan benar setelah menggunakan makeup dan gunakan makeup yang tepat (cth: ganti spons bedak secara berkala)',
  },
  {
    question: 'MENGAPA PRODUK PIXY SUSAH DICARI ATAU TIDAK LENGKAP?',
    answer:
      'Sebenarnya produk PIXY tersedia di toko-toko di sekitar Anda. Namun beberapa toko biasanya memiliki ketentuan masing-masing terkait produk yang dijualnya. Untuk mendapatkan produk PIXY dengan seri yang lebih lengkap, Anda dapat mengunjungi toko-toko yang ada Beauty Advisor (BA) PIXY.',
  },
]

export const FaqBlock: React.FC<FaqBlockProps> = ({
  items = defaultFaqItems,
  subtitle = 'FAQ',
  title = 'FREQUENTLY ASKED QUESTIONS',
}) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0])

  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  const renderAnswerWithLinks = (text: string) => {
    if (!text) return null

    // Replace email & URLs with clickable links
    const emailRegex = /customercare@mandom\.co\.id/g
    const urlRegex = /(www\.blibli\.com|www\.lazada\.co\.id|www\.shopee\.co\.id)/g

    const parts = text.split(/(customercare@mandom\.co\.id|www\.blibli\.com|www\.lazada\.co\.id|www\.shopee\.co\.id)/g)

    return (
      <p>
        {parts.map((part, i) => {
          if (part === 'customercare@mandom.co.id') {
            return (
              <a
                className="font-medium text-pixy-rose underline hover:text-pixy-rose-dark"
                href="mailto:customercare@mandom.co.id"
                key={i}
              >
                customercare@mandom.co.id
              </a>
            )
          }
          if (part.startsWith('www.')) {
            const href = `https://${part}`
            return (
              <a
                className="font-medium text-pixy-rose underline hover:text-pixy-rose-dark"
                href={href}
                key={i}
                rel="noreferrer"
                target="_blank"
              >
                {part}
              </a>
            )
          }
          return part
        })}
      </p>
    )
  }

  const faqList = items.length > 0 ? items : defaultFaqItems

  return (
    <section className="w-full bg-white py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        {/* Diamond Ornament Header */}
        <div className="mb-12 flex items-center justify-center gap-2 md:mb-16 md:gap-3">
          <span className="select-none text-[10px] text-[#2b2525] md:text-xs">◆</span>
          <h1 className="font-sans text-xl font-bold tracking-widest text-[#2b2525] uppercase md:text-2xl lg:text-3xl">
            {title}
          </h1>
          <span className="select-none text-[10px] text-[#2b2525] md:text-xs">◆</span>
        </div>

        {/* Accordion Group */}
        <div className="mx-auto max-w-3xl space-y-4">
          {faqList.map((item, index) => {
            const isOpen = openIndexes.includes(index)

            return (
              <div
                className="overflow-hidden rounded-2xl border border-pixy-blush-200/70 bg-white transition-all shadow-xs hover:border-pixy-rose/40"
                key={item.id ?? index}
              >
                <button
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-sans transition-colors hover:bg-pixy-blush-50/50"
                  onClick={() => toggleIndex(index)}
                  type="button"
                >
                  <span className="font-sans text-sm font-bold tracking-wide text-[#2b2525] uppercase md:text-[15px]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-5 shrink-0 text-pixy-rose transition-transform duration-200',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-pixy-blush-100 bg-white px-6 py-5 text-sm leading-relaxed text-[#595959] md:text-[15px]">
                    {item.answer && renderAnswerWithLinks(item.answer)}

                    {item.listItems && item.listItems.length > 0 && (
                      <ul
                        className={cn(
                          'list-disc space-y-2 pl-5 text-[#595959]',
                          item.answer && 'mt-3',
                        )}
                      >
                        {item.listItems.map((bullet, bulletIdx) => (
                          <li key={bulletIdx}>{bullet.text}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

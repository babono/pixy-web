const rupiah = new Intl.NumberFormat('id-ID')

/** 62100 -> "Rp62.100" */
export const formatPrice = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) return ''
  return `Rp${rupiah.format(value)}`
}

/**
 * Average of a product's review ratings, rounded to one decimal.
 * Returns null when a product has no reviews so callers can hide the block.
 */
export const averageRating = (
  reviews: { rating: number }[] | null | undefined,
): number | null => {
  if (!reviews?.length) return null
  const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0)
  return Math.round((total / reviews.length) * 10) / 10
}

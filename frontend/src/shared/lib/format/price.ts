/**
 * 미국 달러(USD) 통화 포맷 ($1,234.50)
 */
export function formatUsd(price: number): string {
  if (isNaN(price) || price === null || price === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

/**
 * 전일대비 변동 금액 및 등락률 포맷 (+$2.50 (+1.98%))
 */
export function formatStockChange(changePrice: number, changeRate: number): string {
  if (changeRate === 0) return '$0.00 (0.00%)'
  const sign = changeRate > 0 ? '+' : '-'
  const absPrice = Math.abs(changePrice).toFixed(2)
  const absRate = Math.abs(changeRate).toFixed(2)
  return `${sign}$${absPrice} (${sign}${absRate}%)`
}

import { TrendingUp, TrendingDown } from 'lucide-react'
import { Badge, type BadgeSize } from '@/shared/ui'
import { formatStockChange } from '@/shared/lib'

interface StockPriceBadgeProps {
  changePrice: number
  changeRate: number
  size?: BadgeSize
  className?: string
}

export function StockPriceBadge({
  changePrice,
  changeRate,
  size = 'md',
  className = '',
}: StockPriceBadgeProps) {
  const isUp = changeRate > 0
  const isDown = changeRate < 0

  const variant = isUp ? 'red' : isDown ? 'blue' : 'slate'
  const formattedChange = formatStockChange(changePrice, changeRate)

  return (
    <Badge variant={variant} size={size} className={className}>
      {isUp && <TrendingUp className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />}
      {isDown && <TrendingDown className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />}
      <span>{formattedChange}</span>
    </Badge>
  )
}

import { Skeleton } from '@/shared/ui'
import { formatUsd } from '@/shared/lib'
import { StockPriceBadge, type StockResponse } from '@/entities/stock'

interface StockHeaderProps {
  stock: StockResponse | null
  isLoading?: boolean
}

export function StockHeader({ stock, isLoading }: StockHeaderProps) {
  if (isLoading || !stock) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
        <div className="flex items-baseline gap-2.5 pt-1">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* 종목명 & 티커 */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">{stock.name}</h1>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
          {stock.ticker}
        </span>
      </div>

      {/* 현재가 & 공통 등락률 뱃지 */}
      <div className="flex items-baseline gap-2.5 pt-0.5">
        <span className="text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
          {formatUsd(stock.currentPrice)}
        </span>

        <StockPriceBadge
          changePrice={stock.changePrice}
          changeRate={stock.changeRate}
        />
      </div>
    </div>
  )
}

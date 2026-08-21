import { Skeleton } from '@/shared/ui'
import { formatUsd } from '@/shared/lib'
import { StockPriceBadge, useRealtimePrice, type StockResponse } from '@/entities/stock'

interface StockHeaderProps {
  stock: StockResponse | null
  isLoading?: boolean
}

export function StockHeader({ stock, isLoading }: StockHeaderProps) {
  // 현재 보고 있는 종목의 실시간 시세만 정밀 구독 (다른 7개 종목 변동 시 리렌더링 0회)
  const realtimeData = useRealtimePrice(stock?.ticker)

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

  const currentPrice = realtimeData ? realtimeData.currentPrice : stock.currentPrice
  const changePrice = realtimeData ? realtimeData.changePrice : stock.changePrice
  const changeRate = realtimeData ? realtimeData.changeRate : stock.changeRate

  return (
    <div className="space-y-1">
      {/* 종목명 & 티커 */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">{stock.name}</h1>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
          {stock.ticker}
        </span>
      </div>

      {/* 현재가 & 공통 등락률 뱃지 (실시간 동기화) */}
      <div className="flex items-baseline gap-2.5 pt-0.5">
        <span className="text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight transition-colors duration-300">
          {formatUsd(currentPrice)}
        </span>

        <StockPriceBadge
          changePrice={changePrice}
          changeRate={changeRate}
        />
      </div>
    </div>
  )
}

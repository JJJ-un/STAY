import { formatUsd } from '@/shared/lib'
import { useRealtimePrice, type StockResponse } from '@/entities/stock'
import { useStockPriceFlash } from '../lib/useStockPriceFlash'

interface StockListItemProps {
  stock: StockResponse
  index?: number
  showRank?: boolean
  onSelect?: (ticker: string) => void
}

/**
 * 개별 종목 카드 렌더링 컴포넌트
 * - useRealtimePrice(stock.ticker): 오직 자기 종목 틱이 올 때만 정밀 렌더링
 * - useStockPriceFlash: 가격 변동 시 0.5초 펄스 애니메이션 분리 훅
 */
export function StockListItem({
  stock,
  index,
  showRank = true,
  onSelect,
}: StockListItemProps) {
  const realtimeData = useRealtimePrice(stock.ticker)

  // 실시간 시세 우선, 없으면 초기 REST API 시세 사용
  const currentPrice = realtimeData?.currentPrice ?? stock.currentPrice
  const changeRate = realtimeData?.changeRate ?? stock.changeRate
  const isUp = changeRate > 0
  const isDown = changeRate < 0

  const isFlashing = useStockPriceFlash(currentPrice)

  return (
    <div
      onClick={() => onSelect?.(stock.ticker)}
      className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-300 active:scale-[0.99] ${isFlashing
        ? isUp
          ? 'bg-red-50/90'
          : 'bg-blue-50/90'
        : 'bg-slate-50/80 hover:bg-slate-100/70'
        }`}
    >
      {/* 좌측: 순위 & 종목명 & 티커 */}
      <div className="flex items-center gap-3">
        {showRank && index !== undefined && (
          <span className="w-5 text-center text-xs font-black text-slate-400 tabular-nums">
            {index + 1}
          </span>
        )}
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">
            {stock.name}
          </h3>
          <span className="text-[11px] font-semibold text-slate-400 mt-0.5 block">
            {stock.ticker}
          </span>
        </div>
      </div>

      {/* 우측: 실시간 현재가 & 등락률 */}
      <div className="text-right space-y-0.5">
        <p
          className={`text-sm font-black tabular-nums transition-all duration-300 ${isFlashing
            ? isUp
              ? 'text-red-600 scale-105 font-black'
              : 'text-blue-600 scale-105 font-black'
            : 'text-slate-900'
            }`}
        >
          {formatUsd(currentPrice)}
        </p>
        <p
          className={`text-xs font-bold tabular-nums ${isUp ? 'text-red-500' : isDown ? 'text-blue-600' : 'text-slate-400'
            }`}
        >
          {isUp ? `+${changeRate.toFixed(2)}%` : `${changeRate.toFixed(2)}%`}
        </p>
      </div>
    </div>
  )
}

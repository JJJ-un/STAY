import { useState, useEffect } from 'react'
import { getStocks, type StockResponse } from '@/entities/stock'
import { useStockPriceSSE } from '@/shared/lib/useStockPriceSSE'

export type StockFilterType = 'RANK' | 'VOLUME' | 'RISING' | 'FALLING'

// 탭 필터 ➔ 백엔드 정렬 파라미터 매핑
const FILTER_TO_SORT_MAP: Record<StockFilterType, 'VOLUME' | 'GAINERS' | 'LOSERS' | 'MARKET_CAP'> = {
  RANK: 'MARKET_CAP',
  VOLUME: 'VOLUME',
  RISING: 'GAINERS',
  FALLING: 'LOSERS',
}

interface StockListProps {
  filter?: StockFilterType
  showRank?: boolean
  onSelectStock?: (ticker: string) => void
}

export function StockList({
  filter = 'RANK',
  showRank = true,
  onSelectStock,
}: StockListProps) {
  const [stocks, setStocks] = useState<StockResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 한국투자증권 실시간 웹소켓 ➔ 백엔드 ➔ 프론트엔드 SSE 수신 훅
  const { realtimePrices, lastUpdatedTicker } = useStockPriceSSE()

  // 1. 탭 필터 변경 시 백엔드 실제 종목 목록 API 호출
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError(null)

    const sortParam = FILTER_TO_SORT_MAP[filter] || 'MARKET_CAP'

    getStocks(sortParam)
      .then((data) => {
        if (isMounted) {
          setStocks(Array.isArray(data) ? data : [])
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('종목 목록 조회 실패:', err)
        if (isMounted) {
          setError('종목 목록을 불러오지 못했습니다.')
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [filter])

  // 2. 로딩 스켈레톤 (회색선 없이 부드러운 펄스)
  if (isLoading) {
    return (
      <div className="space-y-2.5 scrollbar-none">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between animate-pulse"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-5 h-5 bg-slate-200 rounded-md" />
              <div className="space-y-1.5">
                <div className="w-28 h-4 bg-slate-200 rounded-md" />
                <div className="w-12 h-3 bg-slate-200 rounded-md" />
              </div>
            </div>
            <div className="space-y-1.5 text-right">
              <div className="w-16 h-4 bg-slate-200 rounded-md ml-auto" />
              <div className="w-12 h-3 bg-slate-200 rounded-md ml-auto" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 3. 에러 발생 시
  if (error || stocks.length === 0) {
    return (
      <div className="bg-slate-50 rounded-3xl p-8 text-center space-y-2 scrollbar-none">
        <p className="text-xs font-bold text-slate-700">
          {error || '조회된 종목이 없습니다.'}
        </p>
      </div>
    )
  }

  // 4. 실제 실시간 종목 리스트 렌더링
  return (
    <div className="space-y-2 scrollbar-none">
      {stocks.map((item, index) => {
        const upperTicker = item.ticker.toUpperCase()
        const realtimeData = realtimePrices[upperTicker]

        // 실시간 시세가 있으면 최우선 반영, 없으면 초기 API 시세 사용
        const currentPrice = realtimeData ? realtimeData.currentPrice : item.currentPrice
        const changeRate = realtimeData ? realtimeData.changeRate : item.changeRate
        const isUp = changeRate > 0
        const isDown = changeRate < 0

        // 방금 실시간 체결이 발생한 종목인지 확인
        const isJustUpdated = lastUpdatedTicker === upperTicker

        return (
          <div
            key={item.stockId || item.ticker}
            onClick={() => onSelectStock?.(item.ticker)}
            className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all active:scale-[0.99] ${
              isJustUpdated
                ? isUp
                  ? 'bg-red-50/80'
                  : 'bg-blue-50/80'
                : 'bg-slate-50/80 hover:bg-slate-100/70'
            }`}
          >
            {/* 좌측: 순위 & 종목명 & 티커 */}
            <div className="flex items-center gap-3">
              {showRank && (
                <span className="w-5 text-center text-xs font-black text-slate-400 tabular-nums">
                  {index + 1}
                </span>
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {item.name}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400 mt-0.5 block">
                  {item.ticker}
                </span>
              </div>
            </div>

            {/* 우측: 실시간 현재가 & 등락률 (1초마다 깜빡임 애니메이션) */}
            <div className="text-right space-y-0.5">
              <p
                className={`text-sm font-black tabular-nums transition-colors duration-300 ${
                  isJustUpdated
                    ? isUp
                      ? 'text-red-600 font-black scale-105'
                      : 'text-blue-600 font-black scale-105'
                    : 'text-slate-900'
                }`}
              >
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p
                className={`text-xs font-bold tabular-nums ${
                  isUp ? 'text-red-500' : isDown ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                {isUp ? `+${changeRate.toFixed(2)}%` : `${changeRate.toFixed(2)}%`}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

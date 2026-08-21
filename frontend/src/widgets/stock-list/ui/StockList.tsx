import { useStocksQuery, type StockSortType } from '@/entities/stock'
import { StockListItem } from './StockListItem'

export type StockFilterType = 'RANK' | 'VOLUME' | 'RISING' | 'FALLING'

// 탭 필터 ➔ 백엔드 정렬 파라미터 매핑
const FILTER_TO_SORT_MAP: Record<StockFilterType, StockSortType> = {
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
  const sortParam = FILTER_TO_SORT_MAP[filter] || 'MARKET_CAP'

  // TanStack Query 캐싱 적용 (30초 신선도, 10분 gcTime, 탭 전환 시 깜빡임 방지)
  const { data: stocks = [], isLoading, isError } = useStocksQuery(sortParam)

  // 1. 최초 로딩 스켈레톤 (회색선 없이 부드러운 펄스)
  if (isLoading && stocks.length === 0) {
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

  // 2. 에러 발생 시
  if (isError || stocks.length === 0) {
    return (
      <div className="bg-slate-50 rounded-3xl p-8 text-center space-y-2 scrollbar-none">
        <p className="text-xs font-bold text-slate-700">
          {isError ? '종목 목록을 불러오지 못했습니다.' : '조회된 종목이 없습니다.'}
        </p>
      </div>
    )
  }

  // 4. 실제 실시간 종목 리스트 렌더링 (각 카드가 개별 종목 정밀 구독)
  return (
    <div className="space-y-2 scrollbar-none">
      {stocks.map((item, index) => (
        <StockListItem
          key={item.stockId || item.ticker}
          stock={item}
          index={index}
          showRank={showRank}
          onSelect={onSelectStock}
        />
      ))}
    </div>
  )
}

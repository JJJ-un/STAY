import { useStocksQuery, type StockSortType } from '@/entities/stock'
import { StockListItem } from './StockListItem'
import { StockListSkeleton } from './StockListSkeleton'

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

  const { data: stocks = [], isLoading, isError, refetch } = useStocksQuery(sortParam)

  if (isLoading && stocks.length === 0) {
    return <StockListSkeleton count={8} />
  }
  if (isError) {
    return (
      <div className="bg-slate-50 rounded-3xl p-8 text-center space-y-3 scrollbar-none">
        <p className="text-xs font-bold text-slate-700">
          종목 목록을 불러오지 못했습니다.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-xs font-bold text-slate-900 bg-white px-3 py-1.5 rounded-xl shadow-sm hover:bg-slate-100 transition-colors"
        >
          다시 시도
        </button>
      </div>
    )
  }

  // 3. 정상 조회되었으나 목록이 비어있는 경우 (Empty State)
  if (stocks.length === 0) {
    return (
      <div className="bg-slate-50 rounded-3xl p-8 text-center space-y-2 scrollbar-none">
        <p className="text-xs font-bold text-slate-400">
          조회된 종목이 없습니다.
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

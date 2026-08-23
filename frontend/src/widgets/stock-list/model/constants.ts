import type { TabItem } from '@/shared/ui'
import type { StockSortType } from '@/entities/stock'

export type StockFilterType = 'RANK' | 'VOLUME' | 'RISING' | 'FALLING'

export const STOCK_TAB_ITEMS: TabItem<StockFilterType>[] = [
  { id: 'RANK', label: '실시간 순위' },
  { id: 'VOLUME', label: '거래량' },
  { id: 'RISING', label: '급상승' },
  { id: 'FALLING', label: '급하락' },
]

export const VALID_STOCK_FILTERS: readonly StockFilterType[] = [
  'RANK',
  'VOLUME',
  'RISING',
  'FALLING',
] as const

// 탭 필터 ➔ 백엔드 정렬 파라미터 매핑
export const FILTER_TO_SORT_MAP: Record<StockFilterType, StockSortType> = {
  RANK: 'MARKET_CAP',
  VOLUME: 'VOLUME',
  RISING: 'GAINERS',
  FALLING: 'LOSERS',
}

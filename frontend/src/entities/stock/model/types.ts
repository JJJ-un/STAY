// 5대 차트 기간 탭
export type ChartRangeType = 'DAY_1' | 'WEEK_1' | 'MONTH_3' | 'YEAR_1' | 'YEAR_5'

// 타임라인 마커 팝업용 일지 요약 DTO 
export interface JournalMarkerSummary {
  journalId: number
  tradeType: 'BUY' | 'SELL' | 'WATCH'
  emotion: string
  stayMessage: string
  tradeDateTime: string
}

// 차트 하단 X축 타임라인 일지 마커 뱃지 인터페이스
export interface StockTimelineMarker {
  date: string // YYYY-MM-DD
  displayDate: string // 화면 표시용 (MM/DD 또는 YYYY/MM)
  rangeTags: ChartRangeType[] // 이 마커가 노출될 탭 범위 목록
  totalCount: number
  buyCount: number
  sellCount: number
  watchCount: number
  journals: JournalMarkerSummary[]
}

export interface StockResponse {
  stockId: number
  name: string
  ticker: string
  currentPrice: number
  changePrice: number
  changeRate: number
  volume: number
  marketCap: number
}

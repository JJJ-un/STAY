// 매매 유형 (BUY: 매수, SELL: 매도, WATCH: 관망)
export type TradeType = 'BUY' | 'SELL' | 'WATCH'

// 통화 (KRW: 원화, USD: 달러)
export type CurrencyType = 'KRW' | 'USD'

// 목표 보유 기간 (SHORT: 단기, MEDIUM: 중기, LONG: 장기)
export type HoldingPeriod = 'SHORT' | 'MEDIUM' | 'LONG'

// 매매 당시 심리 상태
export type EmotionType = 'CONFIDENCE' | 'FOMO' | 'PANIC' | 'GREED' | 'NONE'

// 원칙 체크리스트 항목 요청 DTO
export interface ChecklistRequest {
  content: string
  isChecked: boolean
}

// 원칙 체크리스트 항목 응답 DTO
export interface ChecklistResponse {
  checklistId: number
  content: string
  isChecked: boolean
}

// 주식일지 작성 요청 DTO (POST /api/v1/journals)
export interface JournalCreateRequest {
  stockId: number
  tradeType: TradeType
  tradeDateTime: string // ISO 포맷: YYYY-MM-DDTHH:mm:ss
  currency: CurrencyType
  price?: number
  quantity?: number
  totalPrice?: number
  targetPrice?: number
  stopLossPrice?: number
  holdingPeriod?: HoldingPeriod
  checklists?: ChecklistRequest[]
  emotion?: EmotionType
  reasonMemo?: string
  stayMessage: string
  chartRangeType?: string
  pricePattern?: number[]
  isTracking?: boolean
}

// 주식일지 수정 요청 DTO (PUT /api/v1/journals/{journalId})
export interface JournalUpdateRequest {
  tradeType: TradeType
  tradeDateTime: string
  currency: CurrencyType
  price: number
  quantity: number
  totalPrice: number
  targetPrice?: number
  stopLossPrice?: number
  holdingPeriod?: HoldingPeriod
  emotion?: EmotionType
  reasonMemo?: string
  stayMessage: string
}

// 주식일지 목록 응답 DTO (GET /api/v1/journals)
export interface JournalResponse {
  journalId: number
  stockId: number
  stockName: string
  stockTicker: string
  tradeType: TradeType
  tradeDateTime: string
  stayMessage: string
  emotion?: EmotionType
  reasonMemo?: string
  price?: number
  quantity?: number
  targetPrice?: number
  stopLossPrice?: number
  holdingPeriod?: HoldingPeriod
  isTracking?: boolean
}

// 주식일지 단건 상세 응답 DTO (GET /api/v1/journals/{journalId})
export interface JournalDetailResponse {
  journalId: number
  author?: {
    userId: number
    nickname: string
    profileImageUrl?: string
  }
  stock?: {
    stockId: number
    name: string
    ticker: string
    currentPrice?: number
  }
  tradeType: TradeType
  tradeDateTime: string
  currency: CurrencyType
  price?: number
  quantity?: number
  totalPrice?: number
  targetPrice?: number
  stopLossPrice?: number
  holdingPeriod?: HoldingPeriod
  emotion?: EmotionType
  reasonMemo?: string
  stayMessage: string
  checklists?: ChecklistResponse[]
  createdAt?: string
  updatedAt?: string
}

// 기존 피드 및 추천 컴포넌트 호환용 인터페이스
export interface MyJournalFeed {
  id: string
  date: string
  stockName: string
  tradeType: '매수' | '매도' | '관망'
  content: string
}

export interface SharedJournalFeed {
  id: string
  author: string
  stockName: string
  category: '노하우' | '원칙' | '복기'
  content: string
  likes: number
}

export interface RecommendedCommitment {
  id: string
  situationTag: string
  stockName: string
  content: string
}

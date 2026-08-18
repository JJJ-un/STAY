export type TradeType = 'BUY' | 'SELL' | 'WATCH'
export type CurrencyType = 'KRW' | 'USD'
export type HoldingPeriodType = 'SHORT' | 'MEDIUM' | 'LONG'
export type EmotionType = 'FOMO' | 'PANIC' | 'CONFIDENCE' | 'GREED' | 'NONE'

export interface StockOption {
  id: string
  name: string
  code: string
  market: 'KOSPI' | 'KOSDAQ' | 'NASDAQ' | 'NYSE'
  currentPrice: number
  currency: CurrencyType
}

export interface RuleChecklistItem {
  id: string
  text: string
  checked: boolean
}

export interface JournalFormState {
  // 1. 기본 매매 데이터
  stockId: string
  stockName: string
  stockCode: string
  tradeType: TradeType
  tradeDateTime: string
  currency: CurrencyType
  price: string
  quantity: string

  // 2. 원칙 및 기준 설정
  targetPrice: string
  stopLossPrice: string
  holdingPeriod: HoldingPeriodType
  checklist: RuleChecklistItem[]

  // 3. 심리 상태 및 매매 이유
  emotion: EmotionType
  reasonMemo: string
  stayMessage: string
}

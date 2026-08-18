export type TradeType = 'BUY' | 'SELL' | 'WATCH'
export type CurrencyType = 'KRW' | 'USD'
export type HoldingPeriodType = 'SHORT' | 'MEDIUM' | 'LONG'
export type EmotionType = 'FOMO' | 'PANIC' | 'CONFIDENCE' | 'GREED' | 'NONE'

export interface StockOption {
  id: string
  name: string
  code: string
  market?: string
  currentPrice?: number
  currency?: CurrencyType
}

export interface RuleChecklistItem {
  id: string
  text: string
  checked: boolean
}

export interface JournalFormState {
  stockId: string
  stockName: string
  stockCode: string
  tradeType: TradeType
  tradeDateTime: string
  currency: CurrencyType
  price: string
  quantity: string
  targetPrice: string
  stopLossPrice: string
  holdingPeriod: HoldingPeriodType
  checklist: RuleChecklistItem[]
  emotion: EmotionType
  reasonMemo: string
  stayMessage: string
}

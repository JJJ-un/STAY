import type { TradeType, CurrencyType, EmotionType, HoldingPeriodType } from '@/features/journal-create'

export type JournalFilterType = 'ALL' | TradeType

export interface JournalListItemData {
  id: string
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
  emotion: EmotionType
  emotionLabel: string
  reasonMemo?: string
  stayMessage: string
  createdAt: string
}

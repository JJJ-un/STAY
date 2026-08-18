import type { JournalResponse, EmotionType } from '@/entities/journal'
import type { HoldingPeriodType } from '@/features/journal-create'
import type { JournalListItemData } from '../model/types'

// 감정 라벨 매핑 테이블
const EMOTION_LABEL_MAP: Record<EmotionType, string> = {
  CONFIDENCE: '자신감',
  FOMO: '조급함/FOMO',
  PANIC: '불안/공포',
  GREED: '욕심/탐욕',
  NONE: '평온/냉정',
}

/**
 * 백엔드 JournalResponse DTO를 프론트엔드 JournalListItemData 카드로 변환하는 순수 매퍼 함수
 */
export function toJournalListItemData(dto: JournalResponse): JournalListItemData {
  const emotion = dto.emotion || 'CONFIDENCE'
  const emotionLabel = EMOTION_LABEL_MAP[emotion] || '자신감'

  // 날짜 포맷팅 (YYYY-MM-DDTHH:mm:ss ➔ YYYY.MM.DD HH:mm)
  let formattedDate = dto.tradeDateTime || ''
  if (formattedDate.includes('T')) {
    const [datePart, timePart] = formattedDate.split('T')
    const cleanTime = timePart?.slice(0, 5) || ''
    formattedDate = `${datePart.replace(/-/g, '.')} ${cleanTime}`
  }

  // 보유 기간 변환
  const holdingPeriod: HoldingPeriodType = dto.holdingPeriod || 'MEDIUM'

  return {
    id: String(dto.journalId),
    stockId: String(dto.stockId),
    stockName: dto.stockName,
    stockCode: dto.stockTicker || '',
    tradeType: dto.tradeType,
    tradeDateTime: formattedDate,
    currency: 'USD',
    price: dto.price ? String(dto.price) : '0',
    quantity: dto.quantity ? String(dto.quantity) : '0',
    targetPrice: dto.targetPrice ? String(dto.targetPrice) : '',
    stopLossPrice: dto.stopLossPrice ? String(dto.stopLossPrice) : '',
    holdingPeriod,
    emotion,
    emotionLabel,
    reasonMemo: dto.reasonMemo || '',
    stayMessage: dto.stayMessage || '나만의 매매 원칙을 지켰습니다.',
    createdAt: dto.tradeDateTime || new Date().toISOString(),
  }
}

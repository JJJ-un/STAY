import { useState } from 'react'
import type { JournalListItemData } from '../model/types'
import type { TradeType } from '@/features/journal-create/model/types'
import { JournalCard } from './JournalCard'

export type JournalFilterType = 'ALL' | TradeType

export const MOCK_JOURNAL_LIST: JournalListItemData[] = [
  {
    id: 'j1',
    stockId: '1',
    stockName: '삼성전자',
    stockCode: '005930',
    tradeType: 'BUY',
    tradeDateTime: '2026.08.12 14:30',
    currency: 'KRW',
    price: '71500',
    quantity: '10',
    targetPrice: '80000',
    stopLossPrice: '68000',
    holdingPeriod: 'MEDIUM',
    emotion: 'CONFIDENCE',
    emotionLabel: '확신 / 냉정',
    reasonMemo: '실적 모멘텀 및 분할 매수 수칙 준수',
    stayMessage: '손절가 68,000원 터치 시 미련 없이 팔자. 원칙 준수가 최고의 방패다.',
    createdAt: '2026.08.12',
  },
  {
    id: 'j2',
    stockId: '2',
    stockName: 'SK하이닉스',
    stockCode: '000660',
    tradeType: 'SELL',
    tradeDateTime: '2026.08.10 10:15',
    currency: 'KRW',
    price: '185000',
    quantity: '5',
    targetPrice: '190000',
    stopLossPrice: '175000',
    holdingPeriod: 'SHORT',
    emotion: 'GREED',
    emotionLabel: '탐욕 경계',
    reasonMemo: '목표가 인근 부분 익절 수행',
    stayMessage: '익절은 항상 옳다. 욕심 부리지 말고 원칙대로 수익을 확정하자.',
    createdAt: '2026.08.10',
  },
  {
    id: 'j3',
    stockId: '3',
    stockName: 'Apple Inc.',
    stockCode: 'AAPL',
    tradeType: 'BUY',
    tradeDateTime: '2026.08.05 23:30',
    currency: 'USD',
    price: '225',
    quantity: '4',
    targetPrice: '250',
    stopLossPrice: '210',
    holdingPeriod: 'LONG',
    emotion: 'NONE',
    emotionLabel: '없음 / 평온',
    reasonMemo: '장기 모멘텀 매수',
    stayMessage: '단기 변동성에 흔들리지 말고 장기 관점을 유지하자.',
    createdAt: '2026.08.05',
  },
]

interface JournalListProps {
  filter?: JournalFilterType
  onCardClick?: (id: string) => void
  onWriteClick?: () => void
}

export function JournalList({ filter = 'ALL', onCardClick, onWriteClick }: JournalListProps) {
  const [journals] = useState<JournalListItemData[]>(MOCK_JOURNAL_LIST)

  const filteredJournals = journals.filter((item) => {
    if (filter === 'ALL') return true
    return item.tradeType === filter
  })

  // 작성된 주식일지가 없을 때의 기존 빈 화면 (Empty State)
  if (filteredJournals.length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl p-8 text-center space-y-3 my-4">
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800">
            {filter === 'ALL'
              ? '아직 작성된 주식일지가 없습니다'
              : '해당 유형의 주식일지가 없습니다'}
          </p>
          <p className="text-xs text-slate-400">
            오늘의 매매 원칙과 감정 상태를 기록해 보세요.
          </p>
        </div>

        {onWriteClick && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onWriteClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              + 첫 일지 작성하기
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredJournals.map((item) => (
        <JournalCard key={item.id} item={item} onCardClick={onCardClick} />
      ))}
    </div>
  )
}

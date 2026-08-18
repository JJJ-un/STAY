import { useState } from 'react'
import type { JournalListItemData, JournalFilterType } from '../model/types'
import { MOCK_JOURNAL_LIST } from '../model/mock'
import { JournalCard } from './JournalCard'

export type { JournalFilterType }
export { MOCK_JOURNAL_LIST }

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

  // 작성된 주식일지가 없을 때의 빈 화면 (Empty State)
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

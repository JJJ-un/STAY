import { useState } from 'react'
import { Tabs, type TabItem } from '@/shared/ui'
import {
  JournalList,
  type JournalFilterType,
} from '@/features/journal-list'

const JOURNAL_TAB_ITEMS: TabItem<JournalFilterType>[] = [
  { id: 'ALL', label: '전체' },
  { id: 'BUY', label: '매수' },
  { id: 'SELL', label: '매도' },
  { id: 'WATCH', label: '관망' },
]

import { useNavigate } from 'react-router-dom'

export function JournalPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<JournalFilterType>('ALL')

  return (
    <div className="flex-1 flex flex-col">
      {/* 헤더 바로 아래 위치하는 주식일지 필터 탭 (sticky 고정) */}
      <div className="sticky top-[48px] z-40 bg-white/95 backdrop-blur-md px-4">
        <Tabs<JournalFilterType>
          items={JOURNAL_TAB_ITEMS}
          activeId={activeFilter}
          onChange={setActiveFilter}
          variant="underline"
          size="sm"
          fullWidth
        />
      </div>

      {/* 저장된 주식일지 리스트 영역 */}
      <div className="flex-1 p-4 pb-20">
        <JournalList
          filter={activeFilter}
          onCardClick={(id) => navigate(`/journal/detail?id=${id}`)}
          onWriteClick={() => navigate('/journal/write')}
          onLoginClick={() => navigate('/login')}
        />
      </div>
    </div>
  )
}

export default JournalPage

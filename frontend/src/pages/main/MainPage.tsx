import { useState } from 'react'
import { MainTab } from '@/widgets/main-tab'
import type { MainTabType } from '@/widgets/main-tab'
import { RecommendedCommitment } from '@/widgets/recommended-commitment'
import { StockList, type StockFilterType } from '@/widgets/stock-list'
import { InsightCarousel } from '@/widgets/insight-carousel'
import { JournalFeed } from '@/widgets/journal-feed'
import { Tabs, type TabItem } from '@/shared/ui'

const STOCK_TAB_ITEMS: TabItem<StockFilterType>[] = [
  { id: 'RANK', label: '실시간 순위' },
  { id: 'VOLUME', label: '거래량' },
  { id: 'RISING', label: '급상승' },
  { id: 'FALLING', label: '급하락' },
]

interface MainPageProps {
  onNavigate?: (path: string) => void
}

export function MainPage({ onNavigate }: MainPageProps) {
  const [activeTab, setActiveTab] = useState<MainTabType>('RECOMMEND')
  const [stockFilter, setStockFilter] = useState<StockFilterType>('RANK')

  return (
    <div className="flex-1 flex flex-col">
      <MainTab activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 p-4 pb-6">
        {activeTab === 'RECOMMEND' ? (
          <div className="space-y-6">
            <RecommendedCommitment onNavigate={onNavigate} />

            {/* 주식 종목 바로 위에 위치하는 기존 언더라인 공통 탭 필터 메뉴 */}
            <div className="space-y-3">
              <Tabs<StockFilterType>
                items={STOCK_TAB_ITEMS}
                activeId={stockFilter}
                onChange={setStockFilter}
                variant="underline"
                size="sm"
                fullWidth
              />
              <StockList
                filter={stockFilter}
                showRank={true}
                onSelectStock={(ticker) => onNavigate?.(`/stock/${ticker}`)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <InsightCarousel />
            <JournalFeed />
          </div>
        )}
      </div>
    </div>
  )
}

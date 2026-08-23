import { useQueryParam } from '@/shared/lib'
import { MainTab, VALID_MAIN_TABS } from '@/widgets/main-tab'
import type { MainTabType } from '@/widgets/main-tab'
import { RecommendedCommitment } from '@/widgets/recommended-commitment'
import {
  StockList,
  STOCK_TAB_ITEMS,
  VALID_STOCK_FILTERS,
  type StockFilterType,
} from '@/widgets/stock-list'
import { InsightCarousel } from '@/widgets/insight-carousel'
import { JournalFeed } from '@/widgets/journal-feed'
import { Tabs } from '@/shared/ui'

export function MainPage() {
  const [activeTab, setActiveTab] = useQueryParam<MainTabType>(
    'tab',
    'RECOMMEND',
    VALID_MAIN_TABS
  )
  const [stockFilter, setStockFilter] = useQueryParam<StockFilterType>(
    'sort',
    'RANK',
    VALID_STOCK_FILTERS
  )

  const handleMainTabChange = (newTab: MainTabType) => {
    setActiveTab(newTab, { cleanupKeys: newTab === 'COMMUNITY' ? ['sort'] : undefined })
  }

  return (
    <div className="flex-1 flex flex-col">
      <MainTab activeTab={activeTab} onTabChange={handleMainTabChange} />

      <div className="flex-1 p-4 pb-6">
        {activeTab === 'RECOMMEND' ? (
          <div className="space-y-6">
            <RecommendedCommitment />

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

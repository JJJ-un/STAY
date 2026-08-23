import { useQueryParam } from '@/shared/lib'
import { Tabs } from '@/shared/ui'
import {
  StockList,
  STOCK_TAB_ITEMS,
  VALID_STOCK_FILTERS,
  type StockFilterType,
} from '@/widgets/stock-list'

export function StockPage() {
  const [activeFilter, setActiveFilter] = useQueryParam<StockFilterType>(
    'tab',
    'RANK',
    VALID_STOCK_FILTERS
  )

  return (
    <div className="flex-1 flex flex-col">
      {/* 헤더 바로 아래 위치하는 관심 종목 필터 탭 (sticky 고정) */}
      <div className="sticky top-[48px] z-40 bg-white/95 backdrop-blur-md px-4">
        <Tabs<StockFilterType>
          items={STOCK_TAB_ITEMS}
          activeId={activeFilter}
          onChange={setActiveFilter}
          variant="underline"
          size="sm"
          fullWidth
        />
      </div>

      {/* 종목 리스트 영역 (showRank={false}로 순위 번호 미노출) */}
      <div className="flex-1 p-4 pb-6">
        <StockList
          filter={activeFilter}
          showRank={false}
        />
      </div>
    </div>
  )
}

export default StockPage

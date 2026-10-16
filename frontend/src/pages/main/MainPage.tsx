import { useQueryParam } from '@/shared/lib'
import { RecommendedCommitment } from '@/widgets/recommended-commitment'
import {
  StockList,
  STOCK_TAB_ITEMS,
  VALID_STOCK_FILTERS,
  type StockFilterType,
} from '@/widgets/stock-list'
import { Tabs } from '@/shared/ui'

export function MainPage() {
  const [stockFilter, setStockFilter] = useQueryParam<StockFilterType>(
    'sort',
    'RANK',
    VALID_STOCK_FILTERS
  )

  return (
    <div className="flex-1 p-4 pb-6 space-y-6">
      <RecommendedCommitment />

      <div className="space-y-3">
        <Tabs<StockFilterType>
          items={STOCK_TAB_ITEMS}
          activeId={stockFilter}
          onChange={setStockFilter}
          variant="underline"
          size="sm"
          fullWidth
        />
        <StockList filter={stockFilter} showRank={true} />
      </div>
    </div>
  )
}

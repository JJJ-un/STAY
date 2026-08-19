import { useQuery } from '@tanstack/react-query'
import { getStockChart, type ChartRangeType, type StockChartItem } from '@/entities/stock'

/**
 * 해외 반도체 종목 5대 기간별 차트 데이터를 조회하는 TanStack Query 훅
 * 과거 일봉(WEEK_1, MONTH_3, YEAR_1, YEAR_5)은 불변 데이터이므로 staleTime: Infinity 적용
 * 당일 5분봉(DAY_1)은 1분 동안 신선도 유지
 */
export function useStockChartQuery(ticker: string, range: ChartRangeType = 'MONTH_3') {
  const isMinute = range === 'DAY_1'

  return useQuery<StockChartItem[]>({
    queryKey: ['stocks', ticker.toUpperCase(), 'charts', range],
    queryFn: () => getStockChart(ticker, range),
    enabled: Boolean(ticker),
    staleTime: isMinute ? 1000 * 60 : Infinity, // 과거 일봉은 무한 캐싱으로 0ms 탭 전환 보장
    gcTime: 1000 * 60 * 30, // 30분 동안 메모리에 캐시 보관
    placeholderData: (prev) => prev, // 탭 전환 시 이전 데이터를 유지하여 UI 깜빡임 방지
  })
}

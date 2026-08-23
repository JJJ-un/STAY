import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getStocks } from './stockApi'
import type { StockResponse, StockSortType } from '../model/types'

/**
 * 해외 반도체 종목 목록을 조회하는 TanStack Query 훅
 * - staleTime: 30초 신선도 유지
 * - gcTime: 10분 메모리 캐싱 (탭 전환 시 0ms 즉시 노출)
 * - placeholderData: keepPreviousData (탭 전환 시 깜빡임 방지 및 부드러운 전환)
 * - refetchOnWindowFocus: false (SSE 실시간 스트림과의 충돌 방지 및 네트워크 절감)
 */
export function useStocksQuery(sort: StockSortType = 'VOLUME', keyword?: string) {
  const normalizedKeyword = keyword?.trim() || undefined

  return useQuery<StockResponse[]>({
    queryKey: ['stocks', 'list', sort, normalizedKeyword],
    queryFn: () => getStocks(sort, normalizedKeyword),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })
}

import { useQuery } from '@tanstack/react-query'
import { getStockDetail } from './stockApi'
import type { StockResponse } from '../model/types'

/**
 * 특정 해외 반도체 종목의 상세 시세를 조회하는 TanStack Query 훅
 * gcTime: 10분을 적용하여 종목 상세 진입/퇴장/재진입 시 스켈레톤 깜빡임 없이 즉시 노출
 */
export function useStockDetailQuery(ticker?: string) {
  const normalizedTicker = ticker?.trim().toUpperCase()

  return useQuery<StockResponse>({
    queryKey: ['stocks', normalizedTicker, 'detail'],
    queryFn: () => getStockDetail(normalizedTicker!),
    enabled: Boolean(normalizedTicker),
    staleTime: 1000 * 30, // 30초 동안 신선도 유지
    gcTime: 1000 * 60 * 10, // 10분 동안 메모리에 보관
  })
}

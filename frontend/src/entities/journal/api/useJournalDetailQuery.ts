import { useQuery } from '@tanstack/react-query'
import { journalApi } from './journalApi'
import type { JournalDetailResponse } from '../model/types'

/**
 * 특정 주식일지 상세 정보를 조회하는 TanStack Query 훅
 * gcTime: 10분, staleTime: 1분을 적용하여 일지 상세 재진입 시 즉시 화면 노출
 */
export function useJournalDetailQuery(journalId?: number | string) {
  return useQuery<JournalDetailResponse>({
    queryKey: ['journals', journalId, 'detail'],
    queryFn: () => journalApi.getJournalDetail(journalId!),
    enabled: Boolean(journalId),
    staleTime: 1000 * 60, // 1분 동안 신선도 유지
    gcTime: 1000 * 60 * 10, // 10분 동안 메모리에 보관
  })
}

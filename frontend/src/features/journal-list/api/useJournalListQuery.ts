import { useState, useEffect, useCallback } from 'react'
import { journalApi, type TradeType } from '@/entities/journal'
import { toJournalListItemData } from '../lib/mapper'
import type { JournalListItemData, JournalFilterType } from '../model/types'

interface UseJournalListQueryProps {
  filter?: JournalFilterType
}

/**
 * 내 주식일지 목록 실시간 조회 및 필터링, 로딩/에러 상태 관리 훅
 */
export function useJournalListQuery({ filter = 'ALL' }: UseJournalListQueryProps = {}) {
  const [journals, setJournals] = useState<JournalListItemData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJournals = useCallback(async () => {
    // 비로그인 상태일 때는 빈 배열 세팅 후 종료
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) {
      setJournals([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 'ALL'일 때는 tradeType 파라미터 제외, 그 외에는 'BUY' | 'SELL' | 'WATCH' 전달
      const tradeTypeParam = filter === 'ALL' ? undefined : (filter as TradeType)
      const data = await journalApi.getMyJournals(tradeTypeParam)

      // DTO ➔ UI 데이터 카드 매핑
      const mappedList = Array.isArray(data) ? data.map(toJournalListItemData) : []
      setJournals(mappedList)
    } catch (err) {
      console.error('일지 목록 조회 실패:', err)
      setError('주식일지 목록을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchJournals()
  }, [fetchJournals])

  return {
    journals,
    isLoading,
    error,
    refetch: fetchJournals,
  }
}

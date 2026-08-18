import { apiClient } from '@/shared/api'
import type {
  JournalCreateRequest,
  JournalResponse,
  TradeType,
} from '../model/types'

export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
}

/**
 * 주식일지(Journal) 관련 백엔드 API 클라이언트
 */
export const journalApi = {
  /**
   * 주식일지 작성 (1~3단계 통합 등록)
   * POST /api/v1/journals
   * @param request 일지 작성 데이터 DTO
   * @returns 생성된 journalId (PK)
   */
  async createJournal(request: JournalCreateRequest): Promise<number> {
    const response = await apiClient.post<ApiResponse<number>>('/journals', request)
    return response.data.data
  },

  /**
   * 내 주식일지 목록 조회 (최신순)
   * GET /api/v1/journals
   * @param tradeType 매매 유형별 필터 (BUY, SELL, WATCH)
   */
  async getMyJournals(tradeType?: TradeType): Promise<JournalResponse[]> {
    const response = await apiClient.get<ApiResponse<JournalResponse[]>>('/journals', {
      params: { tradeType },
    })
    return response.data.data
  },

  /**
   * 특정 주식일지 삭제 (Soft Delete)
   * DELETE /api/v1/journals/{journalId}
   */
  async deleteJournal(journalId: number): Promise<void> {
    await apiClient.delete(`/journals/${journalId}`)
  },
}

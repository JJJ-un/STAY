import { apiClient } from '@/shared/api'
import type { StockResponse } from '../model/types'

export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
}

/**
 * 종목 상세 시세 조회
 */
export async function getStockDetail(ticker: string): Promise<StockResponse> {
  const res = await apiClient.get<ApiResponse<StockResponse>>(`/stocks/ticker/${ticker}`)
  return res.data.data
}

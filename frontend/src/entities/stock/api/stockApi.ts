import { apiClient } from '@/shared/api'
import type { StockResponse, StockChartItem, ChartRangeType } from '../model/types'

export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
}

/**
 * 해외 반도체 종목 목록 조회 (정렬 및 검색어 지원)
 * GET /api/v1/stocks?sort=...&keyword=...
 */
export async function getStocks(
  sort: 'VOLUME' | 'GAINERS' | 'LOSERS' | 'MARKET_CAP' = 'VOLUME',
  keyword?: string
): Promise<StockResponse[]> {
  const params: Record<string, string> = { sort }
  if (keyword && keyword.trim()) params.keyword = keyword.trim()

  const res = await apiClient.get<ApiResponse<StockResponse[]>>('/stocks', { params })
  return res.data.data
}

/**
 * 종목 상세 시세 조회
 */
export async function getStockDetail(ticker: string): Promise<StockResponse> {
  const res = await apiClient.get<ApiResponse<StockResponse>>(`/stocks/ticker/${ticker}`)
  return res.data.data
}

/**
 * 종목 5대 기간별 차트 시세 데이터 조회 (1일/1주/3개월/1년/5년)
 */
export async function getStockChart(
  ticker: string,
  range: ChartRangeType = 'MONTH_3',
  baseDate?: string
): Promise<StockChartItem[]> {
  const params: Record<string, string> = { range }
  if (baseDate) params.baseDate = baseDate

  const res = await apiClient.get<ApiResponse<StockChartItem[]>>(`/stocks/${ticker}/charts`, {
    params,
  })
  return res.data.data
}

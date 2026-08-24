import { apiClient, type ApiResponse } from '@/shared/api'
import type { StockResponse, StockChartItem, ChartRangeType, StockSortType } from '../model/types'


/**
 * 해외 반도체 종목 목록 조회 (정렬 및 검색어 지원)
 * GET /api/v1/stocks?sort=...&keyword=...
 */
export async function getStocks(
  sort: StockSortType = 'VOLUME',
  keyword?: string
): Promise<StockResponse[]> {
  const res = await apiClient.get<ApiResponse<StockResponse[]>>('/stocks', {
    params: { sort, keyword },
  })
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
  const res = await apiClient.get<ApiResponse<StockChartItem[]>>(`/stocks/${ticker}/charts`, {
    params: { range, baseDate },
  })
  return res.data.data
}

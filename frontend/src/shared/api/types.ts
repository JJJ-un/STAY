/**
 * STAY 공통 백엔드 API 응답 규격
 */
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
}

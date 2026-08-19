import { useSSEContext, type RealtimeStockPriceItem } from '@/app/providers/SSEProvider'

export type { RealtimeStockPriceItem }

/**
 * 한국투자증권 ➔ 백엔드 ➔ 프론트엔드로 이어지는 실시간 주가 SSE 스트림 수신 훅
 * 전역 싱글톤 SSEProvider로부터 상태를 공유받아 커넥션 누수와 중복 연결을 100% 방지합니다.
 */
export function useStockPriceSSE() {
  const { realtimePrices, lastUpdatedTicker, isConnected } = useSSEContext()

  return {
    realtimePrices,
    lastUpdatedTicker,
    isConnected,
  }
}

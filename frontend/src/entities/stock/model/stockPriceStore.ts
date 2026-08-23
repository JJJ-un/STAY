import { create } from 'zustand'

export interface RealtimeStockPriceItem {
  ticker: string
  currentPrice: number
  changePrice: number
  changeRate: number
  volume: number
}

interface StockPriceState {
  prices: Record<string, RealtimeStockPriceItem>
  isConnected: boolean
  setConnected: (connected: boolean) => void
  updateSinglePrice: (item: RealtimeStockPriceItem) => void
}

/**
 * Zustand 기반 실시간 주가 고성능 외장 스토어
 * - React Context와 달리 특정 ticker를 구독하는 컴포넌트만 정밀 리렌더링
 */
export const useStockPriceStore = create<StockPriceState>((set) => ({
  prices: {},
  isConnected: false,

  setConnected: (isConnected: boolean) => set({ isConnected }),

  // 단일 종목 실시간 체결가 갱신
  updateSinglePrice: (item: RealtimeStockPriceItem) => {
    if (!item || !item.ticker) return
    const tickerUpper = item.ticker.toUpperCase()

    set((state) => ({
      prices: {
        ...state.prices,
        [tickerUpper]: { ...item, ticker: tickerUpper },
      },
    }))
  },
}))

/**
 * 특정 종목 티커의 실시간 가격 정보만 정밀 구독하는 훅 (Selector)
 * 해당 종목 가격이 변할 때만 해당 컴포넌트가 리렌더링됩니다.
 */
export function useRealtimePrice(ticker?: string): RealtimeStockPriceItem | undefined {
  const normalizedTicker = ticker?.trim().toUpperCase()
  return useStockPriceStore((state) => (normalizedTicker ? state.prices[normalizedTicker] : undefined))
}

/**
 * SSE 실시간 서버 연결 상태만 구독하는 훅
 */
export function useSSEConnectionStatus(): boolean {
  return useStockPriceStore((state) => state.isConnected)
}



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
  lastUpdatedTicker: string | null
  isConnected: boolean
  setConnected: (connected: boolean) => void
  updateSinglePrice: (item: RealtimeStockPriceItem) => void
  setAllPrices: (items: RealtimeStockPriceItem[]) => void
}

/**
 * Zustand 기반 실시간 주가 고성능 외장 스토어
 * - React Context와 달리 특정 ticker를 구독하는 컴포넌트만 정밀 리렌더링
 */
export const useStockPriceStore = create<StockPriceState>((set) => ({
  prices: {},
  lastUpdatedTicker: null,
  isConnected: false,

  setConnected: (isConnected: boolean) => set({ isConnected }),

  // 1. 단일 종목 실시간 체결가 갱신
  updateSinglePrice: (item: RealtimeStockPriceItem) => {
    if (!item || !item.ticker) return
    const tickerUpper = item.ticker.toUpperCase()

    set((state) => ({
      prices: {
        ...state.prices,
        [tickerUpper]: { ...item, ticker: tickerUpper },
      },
      lastUpdatedTicker: tickerUpper,
    }))
  },

  // 2. 전체 종목 일괄 시세 갱신
  setAllPrices: (items: RealtimeStockPriceItem[]) => {
    if (!items || items.length === 0) return

    set((state) => {
      const nextPrices = { ...state.prices }
      for (const item of items) {
        if (item && item.ticker) {
          nextPrices[item.ticker.toUpperCase()] = {
            ...item,
            ticker: item.ticker.toUpperCase(),
          }
        }
      }
      return { prices: nextPrices }
    })
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
 * 전체 실시간 종목 가격 맵을 구독하는 훅
 */
export function useAllRealtimePrices(): Record<string, RealtimeStockPriceItem> {
  return useStockPriceStore((state) => state.prices)
}

/**
 * 가장 최근에 가격이 변동된 종목 티커만 구독하는 훅
 */
export function useLastUpdatedTicker(): string | null {
  return useStockPriceStore((state) => state.lastUpdatedTicker)
}

/**
 * SSE 실시간 서버 연결 상태만 구독하는 훅
 */
export function useSSEConnectionStatus(): boolean {
  return useStockPriceStore((state) => state.isConnected)
}

/**
 * 메인 화면 8대 종목 리스트용 편의 훅 (전체 가격, 최근 변동 종목, 연결 상태 묶음)
 */
export function useStockPriceSSE() {
  const realtimePrices = useStockPriceStore((state) => state.prices)
  const lastUpdatedTicker = useStockPriceStore((state) => state.lastUpdatedTicker)
  const isConnected = useStockPriceStore((state) => state.isConnected)

  return {
    realtimePrices,
    lastUpdatedTicker,
    isConnected,
  }
}


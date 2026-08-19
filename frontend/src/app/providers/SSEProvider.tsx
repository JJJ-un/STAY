import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface RealtimeStockPriceItem {
  ticker: string
  currentPrice: number
  changePrice: number
  changeRate: number
  volume: number
}

interface SSEContextValue {
  realtimePrices: Record<string, RealtimeStockPriceItem>
  lastUpdatedTicker: string | null
  isConnected: boolean
}

const SSEContext = createContext<SSEContextValue>({
  realtimePrices: {},
  lastUpdatedTicker: null,
  isConnected: false,
})

interface SSEProviderProps {
  children: ReactNode
}

/**
 * 앱 전체에서 단 1개의 SSE(Server-Sent Events) 커넥션만 유지하는 싱글톤 프로바이더
 * 어떤 컴포넌트에서 useStockPriceSSE()를 몇 번 호출하든 서버 HTTP 연결은 오직 1개로 고정됩니다.
 */
export function SSEProvider({ children }: SSEProviderProps) {
  const [realtimePrices, setRealtimePrices] = useState<Record<string, RealtimeStockPriceItem>>({})
  const [lastUpdatedTicker, setLastUpdatedTicker] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    // 앱 전역 단일 SSE 스트림 연결 (/api/v1/stocks/stream)
    const eventSource = new EventSource('/api/v1/stocks/stream')

    // 1. 최초 연결 성공 핸들러
    eventSource.addEventListener('connect', () => {
      setIsConnected(true)
    })

    // 2. 전체 종목 일괄 시세 수신 핸들러
    eventSource.addEventListener('stock-prices', (event: MessageEvent) => {
      try {
        const stocks: Array<{
          ticker: string
          currentPrice: number
          changePrice: number
          changeRate: number
          volume: number
        }> = JSON.parse(event.data)

        if (Array.isArray(stocks)) {
          setRealtimePrices((prev) => {
            const next = { ...prev }
            stocks.forEach((s) => {
              if (s && s.ticker) {
                next[s.ticker.toUpperCase()] = {
                  ticker: s.ticker.toUpperCase(),
                  currentPrice: s.currentPrice,
                  changePrice: s.changePrice,
                  changeRate: s.changeRate,
                  volume: s.volume,
                }
              }
            })
            return next
          })
        }
      } catch (err) {
        console.error('SSE 전체 시세 파싱 에러:', err)
      }
    })

    // 3. 단일 종목 실시간 체결 수신 핸들러 (0.001초 실시간 펄스)
    eventSource.addEventListener('stock-price-update', (event: MessageEvent) => {
      try {
        const stock: {
          ticker: string
          currentPrice: number
          changePrice: number
          changeRate: number
          volume: number
        } = JSON.parse(event.data)

        if (stock && stock.ticker) {
          const tickerUpper = stock.ticker.toUpperCase()
          setRealtimePrices((prev) => ({
            ...prev,
            [tickerUpper]: {
              ticker: tickerUpper,
              currentPrice: stock.currentPrice,
              changePrice: stock.changePrice,
              changeRate: stock.changeRate,
              volume: stock.volume,
            },
          }))

          // 방금 가격이 갱신된 종목 티커 기록
          setLastUpdatedTicker(tickerUpper)
        }
      } catch (err) {
        console.error('SSE 실시간 체결 파싱 에러:', err)
      }
    })

    eventSource.onerror = () => {
      setIsConnected(false)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <SSEContext.Provider value={{ realtimePrices, lastUpdatedTicker, isConnected }}>
      {children}
    </SSEContext.Provider>
  )
}

/**
 * 전역 싱글톤 SSE 컨텍스트를 구독하는 훅
 */
export function useSSEContext() {
  return useContext(SSEContext)
}

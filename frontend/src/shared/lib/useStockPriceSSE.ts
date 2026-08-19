import { useEffect, useState } from 'react'

export interface RealtimeStockPriceItem {
  ticker: string
  currentPrice: number
  changePrice: number
  changeRate: number
  volume: number
}

/**
 * 한국투자증권 ➔ 백엔드 ➔ 프론트엔드로 이어지는 실시간 주가 SSE(Server-Sent Events) 스트림 수신 훅
 */
export function useStockPriceSSE() {
  const [realtimePrices, setRealtimePrices] = useState<Record<string, RealtimeStockPriceItem>>({})
  const [lastUpdatedTicker, setLastUpdatedTicker] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    // 백엔드 SSE 스트림 엔드포인트 연결 (Vite 프록시 /api/v1/stocks/stream)
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

          // 방금 가격이 갱신된 종목 티커 기록 (화면 깜빡임 애니메이션용)
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

  return {
    realtimePrices,
    lastUpdatedTicker,
    isConnected,
  }
}

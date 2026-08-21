import {
  useStockPriceStore,
  type RealtimeStockPriceItem,
} from '../model/stockPriceStore'

/**
 * 단일 종목 데이터 검증 및 정규화 순수 함수 (Single Source of Truth)
 */
function normalizeStockPrice(raw: unknown): RealtimeStockPriceItem | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, unknown>

  if (!item.ticker || typeof item.ticker !== 'string') return null

  return {
    ticker: item.ticker.trim().toUpperCase(),
    currentPrice: Number(item.currentPrice) || 0,
    changePrice: Number(item.changePrice) || 0,
    changeRate: Number(item.changeRate) || 0,
    volume: Number(item.volume) || 0,
  }
}

/**
 * 8대 종목 일괄 시세 JSON 파싱 및 정규화 (단일 패스 O(N) 순회)
 */
function parseStockPrices(rawData: string): RealtimeStockPriceItem[] {
  try {
    const parsed = JSON.parse(rawData)
    if (!Array.isArray(parsed)) return []

    const result: RealtimeStockPriceItem[] = []
    for (const item of parsed) {
      const normalized = normalizeStockPrice(item)
      if (normalized) {
        result.push(normalized)
      }
    }
    return result
  } catch (err) {
    console.error('SSE 전체 시세 파싱 에러:', err)
    return []
  }
}

/**
 * 단일 종목 실시간 체결 JSON 파싱 및 정규화
 */
function parseSingleStockPrice(rawData: string): RealtimeStockPriceItem | null {
  try {
    return normalizeStockPrice(JSON.parse(rawData))
  } catch (err) {
    console.error('SSE 실시간 체결 파싱 에러:', err)
    return null
  }
}

let eventSource: EventSource | null = null
let timeoutId: ReturnType<typeof setTimeout> | null = null
let retryCount = 0
let isManualClosed = false

/**
 * 순수 TypeScript 기반 실시간 주가 SSE 스트림 싱글톤 매니저
 * React JSX 트리에 의존하지 않고 전역에서 단 1개의 연결을 맺고 관리합니다.
 */
export function connectStockSSE(): () => void {
  isManualClosed = false

  const initConnection = () => {
    if (isManualClosed) return

    if (eventSource) {
      eventSource.close()
      eventSource = null
    }

    eventSource = new EventSource('/api/v1/stocks/stream')

    // 1. 최초 연결 성공
    eventSource.addEventListener('connect', () => {
      retryCount = 0
      useStockPriceStore.getState().setConnected(true)
    })

    // 2. 8대 종목 일괄 시세 수신
    eventSource.addEventListener('stock-prices', (event: MessageEvent) => {
      const stocks = parseStockPrices(event.data)
      if (stocks.length > 0) {
        useStockPriceStore.getState().setAllPrices(stocks)
      }
    })

    // 3. 단일 종목 실시간 체결 수신
    eventSource.addEventListener('stock-price-update', (event: MessageEvent) => {
      const stock = parseSingleStockPrice(event.data)
      if (stock) {
        useStockPriceStore.getState().updateSinglePrice(stock)
      }
    })

    // 4. 에러 발생 및 지수 백오프 자동 재연결
    eventSource.onerror = () => {
      useStockPriceStore.getState().setConnected(false)
      if (eventSource) {
        eventSource.close()
        eventSource = null
      }

      if (isManualClosed) return

      // 지수 백오프: 1s, 2s, 4s, 8s, 16s... (최대 30s)
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)
      retryCount += 1

      timeoutId = setTimeout(() => {
        initConnection()
      }, delay)
    }
  }

  initConnection()

  // 클린업 함수 반환
  return () => {
    disconnectStockSSE()
  }
}

/**
 * SSE 스트림 연결 종료 및 자원 해제
 */
export function disconnectStockSSE(): void {
  isManualClosed = true
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
  useStockPriceStore.getState().setConnected(false)
}

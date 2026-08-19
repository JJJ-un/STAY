import { useEffect, useRef, useState } from 'react'
import { createChart, type IChartApi, type ISeriesApi, type IPriceLine, AreaSeries, type Time, LineStyle } from 'lightweight-charts'
import { getStockChart, type ChartRangeType } from '@/entities/stock'
import { useStockPriceSSE } from '@/shared/lib/useStockPriceSSE'
import { MOCK_CHART_SERIES, toChartTime } from '../model/mock'

interface StockChartCanvasProps {
  ticker: string
  range: ChartRangeType
  selectedPoint?: { date: string; price: number } | null
  onPointClick?: (date: string, price: number) => void
}

export function StockChartCanvas({
  ticker,
  range,
  selectedPoint,
  onPointClick,
}: StockChartCanvasProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const priceLineRef = useRef<IPriceLine | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // 부모 리렌더링 시 차트 인스턴스가 파괴되는 것을 방지하기 위한 Ref 패턴
  const onPointClickRef = useRef(onPointClick)
  useEffect(() => {
    onPointClickRef.current = onPointClick
  }, [onPointClick])

  // 한투 실시간 체결 SSE 수신
  const { realtimePrices } = useStockPriceSSE()

  // 1. 차트 인스턴스 생성 및 캔버스 초기화 (오직 최초 1회만 생성하여 깜빡임 방지)
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 340,
      height: 180,
      layout: {
        background: { color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 10,
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.15, bottom: 0.15 },
      },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        vertLine: { color: '#cbd5e1', width: 1, style: 2 },
        horzLine: { color: '#cbd5e1', width: 1, style: 2 },
      },
      handleScroll: false,
      handleScale: false,
    })

    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: 'rgba(239, 68, 68, 0.28)',
      bottomColor: 'rgba(239, 68, 68, 0.0)',
      lineColor: '#ef4444',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    })

    chartRef.current = chart
    seriesRef.current = areaSeries

    // 차트 특정 캔들/포인트 클릭 리스너 등록
    chart.subscribeClick((param) => {
      if (!param || !param.time || !seriesRef.current) return

      try {
        const seriesData = param.seriesData.get(seriesRef.current) as { value?: number }
        const price = seriesData?.value || 0
        const dateStr = String(param.time)

        if (price > 0 && onPointClickRef.current) {
          onPointClickRef.current(dateStr, price)
        }
      } catch (err) {
        // 안전 방어
      }
    })

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  // 2. 탭 전환 또는 ticker 변경 시 실제 API 데이터 페칭 및 캔버스 갱신
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return

    const isMinute = range === 'DAY_1'
    chartRef.current.applyOptions({
      timeScale: {
        timeVisible: isMinute,
        secondsVisible: false,
      },
    })

    let isMounted = true
    setIsLoading(true)

    getStockChart(ticker, range)
      .then((items) => {
        if (!isMounted || !seriesRef.current || !chartRef.current) return

        if (items && items.length > 0) {
          const chartData = items.map((item) => ({
            time: toChartTime(item.dateTime, isMinute),
            value: item.price,
          }))
          seriesRef.current.setData(chartData)
        } else {
          // 데이터가 없을 경우 Mock 폴백
          seriesRef.current.setData(MOCK_CHART_SERIES[range] as { time: Time; value: number }[])
        }
        chartRef.current.timeScale().fitContent()
      })
      .catch(() => {
        if (!isMounted || !seriesRef.current || !chartRef.current) return
        // API 에러 시에도 안전하게 Mock 폴백
        seriesRef.current.setData(MOCK_CHART_SERIES[range] as { time: Time; value: number }[])
        chartRef.current.timeScale().fitContent()
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [ticker, range])

  // 3. 차트에서 특정 날짜 클릭 시 시각적 프라이스 라인(Price Line) 고정!
  useEffect(() => {
    if (!seriesRef.current) return

    // 이전 고정 라인이 있으면 먼저 제거
    if (priceLineRef.current) {
      seriesRef.current.removePriceLine(priceLineRef.current)
      priceLineRef.current = null
    }

    // 선택된 날짜와 가격이 있으면 해당 가격에 시각적 블루 핀 라인 고정
    if (selectedPoint && selectedPoint.price > 0) {
      try {
        const line = seriesRef.current.createPriceLine({
          price: selectedPoint.price,
          color: '#2563eb', // 시각적 블루 핀 라인
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `${selectedPoint.date} ($${selectedPoint.price.toFixed(2)})`,
        })
        priceLineRef.current = line
      } catch (err) {
        // 안전 방어
      }
    }
  }, [selectedPoint])

  // 4. SSE로 실시간 주가 수신 시 차트 맨 오른쪽 끝 점 실시간 꿀렁임 (DAY_1 당일 차트 모드일 때)
  useEffect(() => {
    if (!seriesRef.current || range !== 'DAY_1') return

    const tickerUpper = ticker.toUpperCase()
    const realtimeData = realtimePrices[tickerUpper]
    if (realtimeData && realtimeData.currentPrice > 0) {
      try {
        const nowInSeconds = Math.floor(Date.now() / 1000) as Time
        seriesRef.current.update({
          time: nowInSeconds,
          value: realtimeData.currentPrice,
        })
      } catch (err) {
        // time scale 충돌 방어
      }
    }
  }, [realtimePrices, ticker, range])

  return (
    <div className="relative pt-1 w-full overflow-hidden">
      <div
        ref={chartContainerRef}
        className={`w-full transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
      />
    </div>
  )
}

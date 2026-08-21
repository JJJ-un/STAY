import { useEffect, useRef } from 'react'
import { createChart, type IChartApi, type ISeriesApi, type IPriceLine, AreaSeries, type Time, LineStyle } from 'lightweight-charts'
import { useRealtimePrice, type ChartRangeType } from '@/entities/stock'
import { useStockChartQuery } from '../model/useStockChartQuery'
import { MOCK_CHART_SERIES, toChartTime } from '../model/mock'
import { formatChartTimeToString } from '../lib/chartTimeFormatter'

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

  // 1. TanStack Query를 통한 차트 데이터 캐싱 계층화 (staleTime: Infinity로 탭 재전환 시 0ms 즉시 노출)
  const { data: chartItems, isLoading: isFirstLoading, isFetching } = useStockChartQuery(ticker, range)

  // 부모 리렌더링 시 차트 인스턴스가 파괴되는 것을 방지하기 위한 Ref 패턴
  const onPointClickRef = useRef(onPointClick)
  useEffect(() => {
    onPointClickRef.current = onPointClick
  }, [onPointClick])

  // 현재 차트 종목의 실시간 체결가만 정밀 구독
  const realtimeData = useRealtimePrice(ticker)

  // 2. 차트 인스턴스 생성 및 캔버스 초기화 (오직 최초 1회만 생성하여 깜빡임 방지)
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
        const dateStr = formatChartTimeToString(param.time)

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

  // 3. 탭 전환 또는 쿼리 데이터 갱신 시 캔버스에 즉시 데이터 주입
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return

    const isMinute = range === 'DAY_1'
    chartRef.current.applyOptions({
      timeScale: {
        timeVisible: isMinute,
        secondsVisible: false,
      },
    })

    if (chartItems && chartItems.length > 0) {
      const chartData = chartItems.map((item) => ({
        time: toChartTime(item.dateTime, isMinute),
        value: item.price,
      }))
      seriesRef.current.setData(chartData)
    } else {
      // 데이터가 없거나 첫 로딩 중일 경우 Mock 폴백
      seriesRef.current.setData(MOCK_CHART_SERIES[range] as { time: Time; value: number }[])
    }
    chartRef.current.timeScale().fitContent()
  }, [chartItems, range])

  // 4. 차트에서 특정 날짜 클릭 시 시각적 프라이스 라인(Price Line) 고정!
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

  // 5. SSE 실시간 주가 수신 시 당일 차트(DAY_1)일 때만 Ref 기반 직접 캔버스 갱신 (컴포넌트 리렌더링 0회)
  useEffect(() => {
    if (!seriesRef.current || range !== 'DAY_1') return

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
  }, [realtimeData, range])

  return (
    <div className="relative pt-1 w-full overflow-hidden">
      <div
        ref={chartContainerRef}
        className={`w-full transition-opacity duration-200 ${isFirstLoading && isFetching ? 'opacity-50' : 'opacity-100'}`}
      />
    </div>
  )
}

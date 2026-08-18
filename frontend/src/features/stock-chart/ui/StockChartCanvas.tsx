import { useEffect, useRef, useState } from 'react'
import { createChart, type IChartApi, type ISeriesApi, AreaSeries, type Time } from 'lightweight-charts'
import { getStockChart, type ChartRangeType } from '@/entities/stock'
import { MOCK_CHART_SERIES, toChartTime } from '../model/mock'

interface StockChartCanvasProps {
  ticker?: string
  range: ChartRangeType
}

export function StockChartCanvas({ ticker = 'NVDA', range }: StockChartCanvasProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // 1. 차트 인스턴스 생성 및 캔버스 초기화
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

  return (
    <div className="relative pt-1 w-full overflow-hidden">
      <div
        ref={chartContainerRef}
        className={`w-full transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
      />
    </div>
  )
}

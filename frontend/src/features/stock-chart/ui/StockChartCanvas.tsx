import { useEffect, useRef } from 'react'
import { createChart, type IChartApi, type ISeriesApi, AreaSeries, type Time } from 'lightweight-charts'
import type { ChartRangeType } from '@/entities/stock'
import { MOCK_CHART_SERIES } from '../model/mock'

interface StockChartCanvasProps {
  range: ChartRangeType
}

export function StockChartCanvas({ range }: StockChartCanvasProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)

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

  // 2. 탭 전환 시 시세 데이터 및 시간축 포맷 갱신
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return

    const isMinute = range === 'DAY_1'
    chartRef.current.applyOptions({
      timeScale: {
        timeVisible: isMinute,
        secondsVisible: false,
      },
    })

    const data = MOCK_CHART_SERIES[range]
    seriesRef.current.setData(data as { time: Time; value: number }[])
    chartRef.current.timeScale().fitContent()
  }, [range])

  return (
    <div className="relative pt-1 w-full overflow-hidden">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  )
}

import { useState, useEffect, useRef, useMemo } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { Tabs } from '@/shared/ui'
import { createChart, type IChartApi, type ISeriesApi, AreaSeries } from 'lightweight-charts'
import type { ChartRangeType, StockTimelineMarker } from '@/entities/stock'
import { CHART_RANGE_ITEMS, MOCK_CHART_SERIES, ALL_MOCK_TIMELINE_MARKERS } from '../model/mock'

interface StockChartProps {
  onJournalClick?: (journalId: number) => void
}

export function StockChart({ onJournalClick }: StockChartProps) {
  const [range, setRange] = useState<ChartRangeType>('MONTH_3')
  const [selectedMarker, setSelectedMarker] = useState<StockTimelineMarker | null>(ALL_MOCK_TIMELINE_MARKERS[1])
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)

  // 현재 선택된 탭 기간에 속한 마커들만 필터링!
  const visibleMarkers = useMemo(() => {
    return ALL_MOCK_TIMELINE_MARKERS.filter((m) => m.rangeTags.includes(range))
  }, [range])

  // TradingView Lightweight Charts 캔버스 초기화 및 데이터 연동
  useEffect(() => {
    if (!chartContainerRef.current) return

    // 1. 차트 인스턴스 생성 (워터마크 제거 & 회색선 0% 규칙 완벽 준수!)
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 340,
      height: 180,
      layout: {
        background: { color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 10,
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
        attributionLogo: false, // 워터마크 비활성화
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

    // 2. 에어리어 파동 시리즈 추가
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

    // 리사이즈 옵저버
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

  // 탭 변경 시 차트 데이터 및 시간축 포맷 갱신 (5분봉 시간축 완벽 지원!)
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
    seriesRef.current.setData(data as any)
    chartRef.current.timeScale().fitContent()
  }, [range])

  return (
    <div className="space-y-4">
      {/* 1. 전문 금융 차트 & X축 타임라인 뱃지 카드 */}
      <div className="bg-slate-50/80 p-4 rounded-3xl space-y-3">
        {/* 5대 기간 탭 바 */}
        <Tabs<ChartRangeType>
          items={CHART_RANGE_ITEMS}
          activeId={range}
          onChange={(newRange) => {
            setRange(newRange)
            const nextVisible = ALL_MOCK_TIMELINE_MARKERS.filter((m) => m.rangeTags.includes(newRange))
            if (nextVisible.length > 0) {
              setSelectedMarker(nextVisible[0])
            } else {
              setSelectedMarker(null)
            }
          }}
          variant="segmented"
          size="sm"
        />

        {/* 📈 차트 영역 */}
        <div className="relative pt-1 w-full overflow-hidden">
          <div ref={chartContainerRef} className="w-full" />
        </div>

        {/* 📍 차트 하단 타임라인 마커 뱃지 선택 레일 (스크롤바 100% 숨김!) */}
        <div className="pt-1">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {visibleMarkers.length > 0 ? (
              visibleMarkers.map((marker) => {
                const isSelected = selectedMarker?.date === marker.date
                return (
                  <button
                    key={marker.date}
                    type="button"
                    onClick={() => setSelectedMarker(isSelected ? null : marker)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm scale-105'
                        : 'bg-white text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{marker.displayDate}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {marker.totalCount}
                    </span>
                  </button>
                )
              })
            ) : (
              <span className="text-xs text-slate-400 py-1">이 기간에 작성된 일지가 없습니다.</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. 마커 뱃지 클릭 시 열리는 [나의 다짐 팝업 카드] */}
      {selectedMarker && (
        <div className="bg-blue-50/60 p-4 rounded-3xl space-y-3 transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-xs font-bold text-blue-900 tracking-tight">
                {selectedMarker.date} 작성한 다짐 ({selectedMarker.totalCount}건)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMarker(null)}
              className="w-5 h-5 rounded-full bg-blue-100/70 text-blue-700 flex items-center justify-center hover:bg-blue-200 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {selectedMarker.journals.map((journal) => (
              <div
                key={journal.journalId}
                onClick={() => onJournalClick?.(journal.journalId)}
                className="bg-white p-3 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        journal.tradeType === 'BUY'
                          ? 'bg-emerald-50 text-emerald-600'
                          : journal.tradeType === 'SELL'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {journal.tradeType === 'BUY' ? '매수' : journal.tradeType === 'SELL' ? '매도' : '관망'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 tabular-nums">
                      {journal.tradeDateTime}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    "{journal.stayMessage}"
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

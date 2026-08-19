import { useState, useMemo } from 'react'
import { Tabs } from '@/shared/ui'
import type { ChartRangeType, StockTimelineMarker } from '@/entities/stock'
import { StockChartCanvas, CHART_RANGE_ITEMS } from '@/features/stock-chart'
import {
  TimelineMarkerRail,
  TimelineJournalCard,
  ALL_MOCK_TIMELINE_MARKERS,
} from '@/features/timeline-markers'

interface StockChartProps {
  ticker: string
  selectedPoint?: { date: string; price: number } | null
  onJournalClick?: (journalId: number) => void
  onSelectPoint?: (date: string, price: number) => void
}

export function StockChart({
  ticker,
  selectedPoint,
  onJournalClick,
  onSelectPoint,
}: StockChartProps) {
  const [range, setRange] = useState<ChartRangeType>('MONTH_3')
  const [selectedMarker, setSelectedMarker] = useState<StockTimelineMarker | null>(
    ALL_MOCK_TIMELINE_MARKERS[1]
  )

  // 현재 선택된 탭 기간에 속한 마커들만 필터링
  const visibleMarkers = useMemo(() => {
    return ALL_MOCK_TIMELINE_MARKERS.filter((m) => m.rangeTags.includes(range))
  }, [range])

  const handleRangeChange = (newRange: ChartRangeType) => {
    setRange(newRange)
    const nextVisible = ALL_MOCK_TIMELINE_MARKERS.filter((m) => m.rangeTags.includes(newRange))
    setSelectedMarker(nextVisible.length > 0 ? nextVisible[0] : null)
  }

  return (
    <div className="space-y-4">
      {/* 1. 전문 금융 차트 & X축 타임라인 뱃지 카드 */}
      <div className="bg-slate-50/80 p-4 rounded-3xl space-y-3">
        <Tabs<ChartRangeType>
          items={CHART_RANGE_ITEMS}
          activeId={range}
          onChange={handleRangeChange}
          variant="segmented"
          size="sm"
        />

        {/* 📈 [Feature 1] 캔버스 차트 영역 (선택된 날짜/가격 핀 라인 고정) */}
        <StockChartCanvas
          ticker={ticker}
          range={range}
          selectedPoint={selectedPoint}
          onPointClick={onSelectPoint}
        />

        {/* 📍 [Feature 2] 차트 하단 타임라인 마커 뱃지 레일 */}
        <TimelineMarkerRail
          markers={visibleMarkers}
          selectedMarker={selectedMarker}
          onSelectMarker={setSelectedMarker}
        />
      </div>

      {/* 2. [Feature 3] 마커 뱃지 클릭 시 열리는 [나의 다짐 팝업 카드] */}
      {selectedMarker && (
        <TimelineJournalCard
          marker={selectedMarker}
          onClose={() => setSelectedMarker(null)}
          onJournalClick={onJournalClick}
        />
      )}
    </div>
  )
}

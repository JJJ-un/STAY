import type { StockTimelineMarker } from '@/entities/stock'

interface TimelineMarkerRailProps {
  markers: StockTimelineMarker[]
  selectedMarker: StockTimelineMarker | null
  onSelectMarker: (marker: StockTimelineMarker | null) => void
}

export function TimelineMarkerRail({
  markers,
  selectedMarker,
  onSelectMarker,
}: TimelineMarkerRailProps) {
  return (
    <div className="pt-1">
      <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden py-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {markers.length > 0 ? (
          markers.map((marker) => {
            const isSelected = selectedMarker?.date === marker.date
            return (
              <button
                key={marker.date}
                type="button"
                onClick={() => onSelectMarker(isSelected ? null : marker)}
                className={`text-action px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{marker.displayDate}</span>
                <span
                  className={`text-badge px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {marker.totalCount}
                </span>
              </button>
            )
          })
        ) : (
          <span className="text-caption text-slate-500 py-1">이 기간에 작성된 일지가 없습니다.</span>
        )}
      </div>
    </div>
  )
}

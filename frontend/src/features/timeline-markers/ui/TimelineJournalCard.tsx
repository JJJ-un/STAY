import { ChevronRight, X } from 'lucide-react'
import type { StockTimelineMarker } from '@/entities/stock'

interface TimelineJournalCardProps {
  marker: StockTimelineMarker
  onClose: () => void
  onJournalClick?: (journalId: number) => void
}

export function TimelineJournalCard({
  marker,
  onClose,
  onJournalClick,
}: TimelineJournalCardProps) {
  return (
    <div className="bg-blue-50/60 p-4 rounded-3xl space-y-3 transition-all animate-in fade-in slide-in-from-top-2">
      {/* 팝업 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <h2 className="text-xs font-bold text-blue-900 tracking-tight">
            {marker.date} 작성한 다짐 ({marker.totalCount}건)
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-5 h-5 rounded-full bg-blue-100/70 text-blue-700 flex items-center justify-center hover:bg-blue-200 cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* 일지 목록 카드들 */}
      <div className="space-y-2">
        {marker.journals.map((journal) => {
          const isBuy = journal.tradeType === 'BUY'
          const isSell = journal.tradeType === 'SELL'

          return (
            <div
              key={journal.journalId}
              onClick={() => onJournalClick?.(journal.journalId)}
              className="bg-white p-3 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isBuy
                        ? 'bg-red-50 text-red-600'
                        : isSell
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {isBuy ? '매수' : isSell ? '매도' : '관망'}
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
          )
        })}
      </div>
    </div>
  )
}

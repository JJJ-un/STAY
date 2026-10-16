import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { StockHeader } from '@/widgets/stock-header'
import { StockChart } from '@/widgets/stock-chart'
import { useStockDetailQuery } from '@/entities/stock'

export function StockDetailPage() {
  const { ticker = '' } = useParams<{ ticker: string }>()
  const navigate = useNavigate()

  // TanStack Query를 통한 종목 상세 캐싱 (뒤로가기 후 재진입 시 0ms 즉시 노출)
  const { data: stock, isLoading } = useStockDetailQuery(ticker)

  // 차트에서 클릭하여 선택된 특정 일자 및 당시 종가 상태
  const [selectedPoint, setSelectedPoint] = useState<{ date: string; price: number } | null>(null)

  const handleWriteJournal = () => {
    if (!stock) return

    // 차트에서 특정 날짜를 클릭했으면 해당 날짜와 가격으로, 없으면 실시간 현재가로 이동!
    const targetPrice = selectedPoint ? selectedPoint.price : stock.currentPrice
    const dateParam = selectedPoint ? `&date=${selectedPoint.date}` : ''

    navigate(
      `/journal/write?stockId=${stock.stockId}&stockName=${encodeURIComponent(
        stock.name
      )}&stockCode=${stock.ticker}&price=${targetPrice}${dateParam}`
    )
  }

  const handleJournalClick = (journalId: number) => {
    navigate(`/journal/detail?id=${journalId}`)
  }

  return (
    <div className="flex-1 p-4 space-y-5 bg-white">
      {/* 1. 종목명 & 실시간 현재가 & 등락률 뱃지 */}
      <StockHeader stock={stock || null} isLoading={isLoading} />

      {/* 2. 전문 금융 차트 & 타임라인 마커 위젯 */}
      <StockChart
        ticker={ticker}
        selectedPoint={selectedPoint}
        onSelectPoint={(date, price) => {
          if (!date) {
            setSelectedPoint(null)
          } else {
            setSelectedPoint({ date, price: price || 0 })
          }
        }}
        onJournalClick={handleJournalClick}
      />

      {/* 3. 선택한 차트 시점으로 일지 작성 */}
      <div className="pt-2 pb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={handleWriteJournal}
          disabled={!stock}
          className={`text-action flex-1 py-4 px-4 active:scale-[0.99] text-white rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed ${
            selectedPoint
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <span>
            {selectedPoint ? `${selectedPoint.date} 일지 작성하기` : '주식일지 작성하기'}
          </span>
        </button>

        {/* 차트 선택 지점 취소(리셋) 버튼 */}
        {selectedPoint && (
          <button
            type="button"
            onClick={() => setSelectedPoint(null)}
            className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl transition-all active:scale-95 cursor-pointer"
            title="차트 선택 취소"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

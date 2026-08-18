import { useState, useEffect } from 'react'
import { Search, X, Check } from 'lucide-react'
import { getStocks } from '@/entities/stock'
import type { StockResponse } from '@/entities/stock'
import type { StockOption } from '../types'

interface StockSelectBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (stock: StockOption) => void
  selectedStockId: string
}

export function StockSelectBottomSheet({
  isOpen,
  onClose,
  onSelect,
  selectedStockId,
}: StockSelectBottomSheetProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stocks, setStocks] = useState<StockResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 바텀시트가 열리거나 검색어가 바뀔 때 백엔드 실제 종목 API 호출
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    const fetchStocks = async () => {
      setIsLoading(true)
      try {
        const data = await getStocks('VOLUME', searchQuery)
        if (isMounted) {
          setStocks(data || [])
        }
      } catch (error) {
        console.error('종목 목록 로드 실패:', error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchStocks()

    return () => {
      isMounted = false
    }
  }, [isOpen, searchQuery])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      {/* 배경 클릭 닫기 */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 바텀시트 컨테이너 */}
      <div className="relative z-10 w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-8 space-y-4 max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* 상단 핸들 드래그 바 */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto" />

        {/* 바텀시트 헤더 */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-base font-bold text-slate-900">종목 선택</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 검색창 */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="종목명 또는 티커 검색 (예: NVDA, AMD)"
            className="w-full bg-slate-100 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-slate-50 focus:ring-2 focus:ring-blue-600 transition-all"
          />
        </div>

        {/* 종목 리스트 (실제 백엔드 API 데이터) */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pt-1 pr-1 scrollbar-none">
          {isLoading ? (
            <div className="py-10 text-center text-xs text-slate-400">
              종목을 불러오는 중입니다...
            </div>
          ) : stocks.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              검색 결과가 없습니다.
            </div>
          ) : (
            stocks.map((stock) => {
              const isSelected = String(stock.stockId) === selectedStockId
              return (
                <div
                  key={stock.stockId}
                  onClick={() => {
                    onSelect({
                      id: String(stock.stockId),
                      name: stock.name,
                      code: stock.ticker,
                      market: 'NASDAQ',
                      currentPrice: stock.currentPrice,
                      currency: 'USD',
                    })
                    onClose()
                  }}
                  className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{stock.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold">
                        US
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{stock.ticker}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold tabular-nums">
                      ${stock.currentPrice.toLocaleString()}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

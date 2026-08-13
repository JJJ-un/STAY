import { useState } from 'react'
import { Search, X, Check } from 'lucide-react'
import type { StockOption } from '../model/types'

interface StockSelectBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (stock: StockOption) => void
  selectedStockId: string
}

export const POPULAR_STOCKS: StockOption[] = [
  { id: '1', name: '삼성전자', code: '005930', market: 'KOSPI', currentPrice: 71500, currency: 'KRW' },
  { id: '2', name: 'SK하이닉스', code: '000660', market: 'KOSPI', currentPrice: 192000, currency: 'KRW' },
  { id: '3', name: '한미반도체', code: '042700', market: 'KOSPI', currentPrice: 104500, currency: 'KRW' },
  { id: '4', name: '현대차', code: '005380', market: 'KOSPI', currentPrice: 245000, currency: 'KRW' },
  { id: '5', name: 'NAVER', code: '035420', market: 'KOSPI', currentPrice: 172400, currency: 'KRW' },
  { id: '6', name: '카카오', code: '035720', market: 'KOSPI', currentPrice: 38900, currency: 'KRW' },
  { id: '7', name: '엔비디아 (NVIDIA)', code: 'NVDA', market: 'NASDAQ', currentPrice: 128, currency: 'USD' },
  { id: '8', name: '애플 (Apple)', code: 'AAPL', market: 'NASDAQ', currentPrice: 224, currency: 'USD' },
  { id: '9', name: '테슬라 (Tesla)', code: 'TSLA', market: 'NASDAQ', currentPrice: 215, currency: 'USD' },
]

export function StockSelectBottomSheet({
  isOpen,
  onClose,
  onSelect,
  selectedStockId,
}: StockSelectBottomSheetProps) {
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  const filteredStocks = POPULAR_STOCKS.filter(
    (stock) =>
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            placeholder="종목명 또는 종목코드 검색"
            className="w-full bg-slate-100 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-slate-50 focus:ring-2 focus:ring-blue-600 transition-all"
          />
        </div>

        {/* 종목 리스트 */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pt-1 pr-1 scrollbar-none">
          {filteredStocks.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              검색 결과가 없습니다.
            </div>
          ) : (
            filteredStocks.map((stock) => {
              const isSelected = stock.id === selectedStockId
              return (
                <div
                  key={stock.id}
                  onClick={() => {
                    onSelect(stock)
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
                        {stock.market}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{stock.code}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold tabular-nums">
                      {stock.currency === 'KRW'
                        ? `${stock.currentPrice.toLocaleString()}원`
                        : `$${stock.currentPrice}`}
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

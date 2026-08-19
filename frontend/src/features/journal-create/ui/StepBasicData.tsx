import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Tabs, type TabItem } from '@/shared/ui'
import CalculationIcon from '@/shared/assets/calculation.svg?react'
import type { JournalFormState, StockOption, TradeType, CurrencyType } from '../types'
import { StockSelectBottomSheet } from './StockSelectBottomSheet'

const CURRENCY_TAB_ITEMS: TabItem<CurrencyType>[] = [
  { id: 'KRW', label: '원화(₩)' },
  { id: 'USD', label: '달러($)' },
]

interface StepBasicDataProps {
  form: JournalFormState
  onChange: (updates: Partial<JournalFormState>) => void
}

export function StepBasicData({ form, onChange }: StepBasicDataProps) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  // 총 매매 금액 자동 계산 (매수/매도 시)
  const parsedPrice = parseFloat(form.price.replace(/,/g, '')) || 0
  const parsedQty = parseFloat(form.quantity.replace(/,/g, '')) || 0
  const totalPrice = parsedPrice * parsedQty

  const isWatch = form.tradeType === 'WATCH'

  // 종목 선택 시 해당 종목의 현재가를 매매단가(또는 관망시세)로 자동 주입
  const handleSelectStock = (stock: StockOption) => {
    onChange({
      stockId: stock.id,
      stockName: stock.name,
      stockCode: stock.code,
      currency: stock.currency,
      price: stock.currentPrice ? String(stock.currentPrice) : form.price,
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 질문형 상단 타이틀 */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 leading-snug">
          어떤 종목을 얼마에 <br />
          매매하셨나요?
        </h2>
        <p className="text-xs text-slate-400">
          오늘의 객관적인 매매 사실 데이터를 입력해 주세요.
        </p>
      </div>

      {/* 1. 종목 선택 (토스 스타일 클릭 바텀시트) */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 block">종목명 / 티커</label>
        <button
          type="button"
          onClick={() => setIsBottomSheetOpen(true)}
          className="w-full bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-4 flex items-center justify-between transition-colors cursor-pointer text-left"
        >
          <div>
            <div className="text-base font-bold text-slate-900">{form.stockName}</div>
            <div className="text-xs text-slate-400">{form.stockCode}</div>
          </div>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* 2. 기록 시간 선택 */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700 block">기록 시간</label>
        <input
          type="datetime-local"
          value={form.tradeDateTime}
          onChange={(e) => onChange({ tradeDateTime: e.target.value })}
          className="w-full bg-slate-50 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:bg-slate-100 focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
        />
      </div>

      {/* 3. 매매 유형 선택 (매수 / 매도 / 관망) */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 block">매매 유형</label>
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
          {(['BUY', 'SELL', 'WATCH'] as TradeType[]).map((type) => {
            const isSelected = form.tradeType === type
            const labelMap: Record<TradeType, string> = {
              BUY: '매수',
              SELL: '매도',
              WATCH: '관망',
            }
            const colorMap: Record<TradeType, string> = {
              BUY: 'bg-red-500 text-white shadow-sm',
              SELL: 'bg-blue-600 text-white shadow-sm',
              WATCH: 'bg-slate-800 text-white shadow-sm',
            }

            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ tradeType: type })}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected ? colorMap[type] : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {labelMap[type]}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. 관망(WATCH)일 때: 관망 시점 시세 참고 뱃지 */}
      {isWatch ? (
        <div className="bg-slate-50 rounded-2xl p-4 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400">관망 기록 시점 시세</span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-slate-900 tabular-nums">
              {form.currency === 'KRW' ? '₩' : '$'}{' '}
              {form.price ? Number(form.price).toLocaleString() : '시세 정보 없음'}
            </span>
            <span className="text-xs font-bold text-slate-400">
              관망 일지는 매매수량을 입력하지 않습니다
            </span>
          </div>
        </div>
      ) : (
        /* 매수/매도일 때: 통화 선택 & 매매 단가 & 매매 수량 */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-700">단가 및 수량</label>
            {/* 통화 탭 */}
            <Tabs<CurrencyType>
              items={CURRENCY_TAB_ITEMS}
              activeId={form.currency}
              onChange={(curr) => onChange({ currency: curr })}
              variant="segmented"
              size="sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 매매 단가 */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">매매 단가</span>
              <div className="relative">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => onChange({ price: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-50 rounded-2xl px-4 py-3.5 text-base font-bold tabular-nums text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-slate-100 focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <span className="absolute right-3.5 top-4 text-xs font-bold text-slate-400">
                  {form.currency === 'KRW' ? '원' : '$'}
                </span>
              </div>
            </div>

            {/* 매매 수량 */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">매매 수량</span>
              <div className="relative">
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => onChange({ quantity: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-50 rounded-2xl px-4 py-3.5 text-base font-bold tabular-nums text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-slate-100 focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <span className="absolute right-3.5 top-4 text-xs font-bold text-slate-400">주</span>
              </div>
            </div>
          </div>

          {/* 총 매매 금액 (자동 계산) */}
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <CalculationIcon className="w-4 h-4 text-slate-400" />
              <span>총 매매 금액</span>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-slate-900 tabular-nums">
                {form.currency === 'KRW' ? '₩' : '$'} {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 종목 선택 바텀시트 모달 */}
      <StockSelectBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onSelect={handleSelectStock}
        selectedStockId={form.stockId}
      />
    </div>
  )
}

import type { JournalListItemData } from '../model/types'
import type { TradeType } from '@/features/journal-create'

interface JournalCardProps {
  item: JournalListItemData
  onCardClick?: (id: string) => void
}

export function JournalCard({ item, onCardClick }: JournalCardProps) {
  const parsedPrice = parseFloat(item.price.replace(/,/g, '')) || 0
  const parsedQty = parseFloat(item.quantity.replace(/,/g, '')) || 0
  const totalPrice = parsedPrice * parsedQty
  const currencySymbol = item.currency === 'KRW' ? '원' : '$'

  const tradeTypeColorMap: Record<TradeType, { bg: string; text: string; label: string }> = {
    BUY: { bg: 'bg-red-50', text: 'text-red-600', label: '매수' },
    SELL: { bg: 'bg-blue-50', text: 'text-blue-600', label: '매도' },
    WATCH: { bg: 'bg-slate-200/80', text: 'text-slate-800', label: '관망' },
  }

  const tradeTypeInfo = tradeTypeColorMap[item.tradeType]

  return (
    <div
      onClick={() => onCardClick?.(item.id)}
      className="bg-slate-50 hover:bg-slate-100/70 rounded-2xl p-5 space-y-4 cursor-pointer transition-all active:scale-[0.99]"
    >
      {/* 1. 상단: 매매 유형 뱃지 & 종목명/티커 & 매매 일시 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          {/* 매매 유형 뱃지 */}
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${tradeTypeInfo.bg} ${tradeTypeInfo.text}`}
          >
            {tradeTypeInfo.label}
          </span>

          {/* 종목명 & 티커 */}
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-none">
              {item.stockName}
            </h3>
            <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
              {item.stockCode}
            </span>
          </div>
        </div>

        {/* 매매 일시 */}
        <span className="text-xs font-medium text-slate-400 tabular-nums">
          {item.tradeDateTime}
        </span>
      </div>

      {/* 2. 중앙: 매매 사실 데이터 (단가, 수량, 총 금액, 익절/손절가) */}
      <div className="space-y-2 pt-1">
        {/* 단가 및 수량 ➔ 총 매매 금액 */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            {parsedPrice.toLocaleString()} {currencySymbol} · {parsedQty.toLocaleString()}주
          </span>
          <span className="text-sm font-bold text-slate-900 tabular-nums">
            {totalPrice.toLocaleString()} {currencySymbol}
          </span>
        </div>

        {/* 익절가 & 손절가 정보 */}
        {(item.targetPrice || item.stopLossPrice) && (
          <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-slate-500">
            {item.targetPrice && (
              <span>
                목표가 <strong className="text-red-500 font-bold">{parseFloat(item.targetPrice).toLocaleString()}{currencySymbol}</strong>
              </span>
            )}
            {item.stopLossPrice && (
              <span>
                손절가 <strong className="text-blue-600 font-bold">{parseFloat(item.stopLossPrice).toLocaleString()}{currencySymbol}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. 하단: 이모지 없는 감정 상태 텍스트 칩 & 나만의 STAY 다짐 메시지 */}
      <div className="bg-white/80 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          {/* 이모지 없는 감정 상태 텍스트 칩 */}
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
            {item.emotionLabel}
          </span>
        </div>

        {/* 나만의 STAY 메시지 */}
        <p className="text-xs font-semibold text-blue-950 leading-relaxed">
          "{item.stayMessage}"
        </p>
      </div>
    </div>
  )
}

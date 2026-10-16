import { ChevronRight } from 'lucide-react'
import type { JournalListItemData } from '../model/types'
import type { TradeType } from '@/entities/journal'

interface JournalCardProps {
  item: JournalListItemData
  onCardClick?: (id: string) => void
}

const TRADE_TYPE_STYLES: Record<TradeType, { className: string; label: string }> = {
  BUY: { className: 'bg-red-50 text-red-600', label: '매수' },
  SELL: { className: 'bg-blue-50 text-blue-600', label: '매도' },
  WATCH: { className: 'bg-slate-100 text-slate-600', label: '관망' },
}

export function JournalCard({ item, onCardClick }: JournalCardProps) {
  const tradeTypeInfo = TRADE_TYPE_STYLES[item.tradeType]
  const isWatch = item.tradeType === 'WATCH'
  const price = Number(item.price.replace(/,/g, ''))
  const quantity = Number(item.quantity.replace(/,/g, ''))
  const hasPrice = Number.isFinite(price) && price > 0
  const hasQuantity = Number.isFinite(quantity) && quantity > 0
  const formattedPrice = hasPrice
    ? new Intl.NumberFormat(item.currency === 'KRW' ? 'ko-KR' : 'en-US', {
        style: 'currency',
        currency: item.currency,
        minimumFractionDigits: item.currency === 'USD' ? 2 : 0,
        maximumFractionDigits: 4,
      }).format(price)
    : '미기록'
  const formattedQuantity = hasQuantity
    ? `${new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 4 }).format(quantity)}주`
    : '수량 미기록'

  return (
    <button
      type="button"
      onClick={() => onCardClick?.(item.id)}
      className="group block w-full rounded-2xl bg-slate-50 p-card space-y-3 text-left transition-colors hover:bg-slate-100/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer"
    >
      <span className="block space-y-1">
        <span className="flex items-start gap-3">
          <span className="text-item-title min-w-0 flex-1 break-words text-slate-900">
            {item.stockName}
          </span>
          <span className={`text-badge shrink-0 rounded-full px-2 py-0.5 ${tradeTypeInfo.className}`}>
            {tradeTypeInfo.label}
          </span>
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-slate-600" aria-hidden="true" />
        </span>

        <span className="text-caption flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-500">
          <span className="tabular-nums">{item.tradeDateTime}</span>
          {item.stockCode && (
            <>
              <span aria-hidden="true">·</span>
              <span>{item.stockCode}</span>
            </>
          )}
        </span>
      </span>

      <span className="text-label flex flex-wrap items-baseline gap-x-2 gap-y-1 text-slate-700 tabular-nums">
        <span>{isWatch ? '참고 시세' : '체결가'} {formattedPrice}</span>
        {!isWatch && (
          <>
            <span className="text-slate-400" aria-hidden="true">·</span>
            <span>{formattedQuantity}</span>
          </>
        )}
      </span>

      <span className="block space-y-1">
        <span className="text-caption block text-slate-500">당시 감정 · {item.emotionLabel}</span>
        <span className="text-body line-clamp-2 break-words text-slate-700">
          {item.stayMessage}
        </span>
      </span>
    </button>
  )
}

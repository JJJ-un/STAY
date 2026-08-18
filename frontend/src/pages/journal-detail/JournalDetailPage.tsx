import { useSearchParams } from 'react-router-dom'
import { CheckSquare, Calculator, ShieldAlert, Target } from 'lucide-react'
import type { JournalListItemData } from '@/features/journal-list'
import { MOCK_JOURNAL_LIST } from '@/features/journal-list'
import type { TradeType } from '@/entities/journal'

export function JournalDetailPage() {
  const [searchParams] = useSearchParams()
  const journalId = searchParams.get('id') || 'j1'

  // 해당 ID의 일지 데이터 조회 (없을 경우 첫 번째 MOCK 데이터 사용)
  const journal: JournalListItemData =
    MOCK_JOURNAL_LIST.find((item) => item.id === journalId) || MOCK_JOURNAL_LIST[0]

  const parsedPrice = parseFloat(journal.price.replace(/,/g, '')) || 0
  const parsedQty = parseFloat(journal.quantity.replace(/,/g, '')) || 0
  const totalPrice = parsedPrice * parsedQty
  const currencySymbol = journal.currency === 'KRW' ? '원' : '$'

  const targetPriceNum = parseFloat(journal.targetPrice.replace(/,/g, '')) || 0
  const stopLossNum = parseFloat(journal.stopLossPrice.replace(/,/g, '')) || 0

  const targetRate =
    parsedPrice > 0 && targetPriceNum > 0
      ? (((targetPriceNum - parsedPrice) / parsedPrice) * 100).toFixed(1)
      : null

  const stopLossRate =
    parsedPrice > 0 && stopLossNum > 0
      ? (((stopLossNum - parsedPrice) / parsedPrice) * 100).toFixed(1)
      : null

  const tradeTypeColorMap: Record<TradeType, { bg: string; text: string; label: string }> = {
    BUY: { bg: 'bg-red-50', text: 'text-red-600', label: '매수' },
    SELL: { bg: 'bg-blue-50', text: 'text-blue-600', label: '매도' },
    WATCH: { bg: 'bg-slate-200/80', text: 'text-slate-800', label: '관망' },
  }

  const tradeTypeInfo = tradeTypeColorMap[journal.tradeType as TradeType]

  return (
    <div className="flex-1 p-4 pb-24 space-y-5 animate-in fade-in duration-300">
      {/* 1. 상단 요약 카드: 종목 정보 & 매매 일시 (이모지 및 border 미사용) */}
      <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${tradeTypeInfo.bg} ${tradeTypeInfo.text}`}
            >
              {tradeTypeInfo.label}
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-none">
                {journal.stockName}
              </h2>
              <span className="text-xs font-semibold text-slate-400 mt-1 block">
                {journal.stockCode}
              </span>
            </div>
          </div>

          <span className="text-xs font-medium text-slate-400 tabular-nums">
            {journal.tradeDateTime}
          </span>
        </div>
      </div>

      {/* 2. 매매 사실 데이터 (단가, 수량, 총 매매 금액) */}
      <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">매매 사실 데이터</label>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            {journal.currency === 'KRW' ? '원화 (KRW)' : '달러 (USD)'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">매매 단가</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {parsedPrice.toLocaleString()} {currencySymbol}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">매매 수량</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {parsedQty.toLocaleString()} 주
            </span>
          </div>
        </div>

        {/* 총 매매 금액 */}
        <div className="bg-white p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700">총 매매 금액</span>
          </div>
          <span className="text-base font-bold text-slate-900 tabular-nums">
            {totalPrice.toLocaleString()} {currencySymbol}
          </span>
        </div>
      </div>

      {/* 3. 나만의 매매 기준 & 원칙 (익절/손절가 & 체크리스트) */}
      <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
        <label className="text-sm font-bold text-slate-700 block">매매 기준 및 원칙</label>

        <div className="grid grid-cols-2 gap-3">
          {/* 목표가 */}
          <div className="bg-white p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-red-500" />
                <span>목표가</span>
              </span>
              {targetRate !== null && (
                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.2 rounded-full">
                  +{targetRate}%
                </span>
              )}
            </div>
            <span className="text-sm font-bold text-slate-900 tabular-nums block">
              {targetPriceNum > 0 ? `${targetPriceNum.toLocaleString()} ${currencySymbol}` : '미설정'}
            </span>
          </div>

          {/* 손절가 */}
          <div className="bg-white p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                <span>손절가</span>
              </span>
              {stopLossRate !== null && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full">
                  {stopLossRate}%
                </span>
              )}
            </div>
            <span className="text-sm font-bold text-slate-900 tabular-nums block">
              {stopLossNum > 0 ? `${stopLossNum.toLocaleString()} ${currencySymbol}` : '미설정'}
            </span>
          </div>
        </div>

        {/* 매수 전 체크리스트 달성 현황 */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>매수 전 원칙 준수 여부</span>
          </span>

          <div className="space-y-1.5">
            <div className="bg-white p-3 rounded-xl flex items-center gap-2.5 text-xs font-bold text-blue-900">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
              <span>매수 전 24시간 동안 충분히 고민했는가?</span>
            </div>
            <div className="bg-white p-3 rounded-xl flex items-center gap-2.5 text-xs font-bold text-blue-900">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
              <span>해당 기업의 실적/모멘텀을 확인했는가?</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 심리 상태 & 나만의 STAY 다짐 메시지 하이라이트 박스 (이모지 미사용) */}
      <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">매매 당시 심리 & STAY 다짐</label>
          {/* 이모지 없는 감정 상태 텍스트 칩 */}
          <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 text-xs font-bold text-slate-800">
            {journal.emotionLabel}
          </span>
        </div>

        {/* 진입/청산 이유 메모 */}
        {journal.reasonMemo && (
          <div className="bg-white p-3.5 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">진입 / 청산 근거</span>
            <p className="text-xs font-medium text-slate-800 leading-relaxed">
              {journal.reasonMemo}
            </p>
          </div>
        )}

        {/* 미래의 나에게 보내는 STAY 다짐 메시지 하이라이트 */}
        <div className="bg-blue-50/70 rounded-2xl p-4 space-y-1.5">
          <span className="text-[11px] font-bold text-blue-600 block">
            미래의 나에게 보내는 STAY 한마디
          </span>
          <p className="text-sm font-bold text-blue-950 leading-relaxed">
            "{journal.stayMessage}"
          </p>
        </div>
      </div>
    </div>
  )
}

export default JournalDetailPage

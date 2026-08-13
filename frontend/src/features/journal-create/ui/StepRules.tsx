import { CheckSquare } from 'lucide-react'
import type { JournalFormState, HoldingPeriodType } from '../model/types'

interface StepRulesProps {
  form: JournalFormState
  onChange: (updates: Partial<JournalFormState>) => void
}

export function StepRules({ form, onChange }: StepRulesProps) {
  const currentPriceNum = parseFloat(form.price.replace(/,/g, '')) || 0
  const targetPriceNum = parseFloat(form.targetPrice.replace(/,/g, '')) || 0
  const stopLossNum = parseFloat(form.stopLossPrice.replace(/,/g, '')) || 0

  // 목표가 대비 예상 수익률
  const targetRate =
    currentPriceNum > 0 && targetPriceNum > 0
      ? (((targetPriceNum - currentPriceNum) / currentPriceNum) * 100).toFixed(1)
      : null

  // 손절가 대비 예상 손실률
  const stopLossRate =
    currentPriceNum > 0 && stopLossNum > 0
      ? (((stopLossNum - currentPriceNum) / currentPriceNum) * 100).toFixed(1)
      : null

  // 체크리스트 토글
  const handleToggleChecklist = (id: string) => {
    const nextChecklist = form.checklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    )
    onChange({ checklist: nextChecklist })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 질문형 상단 타이틀 */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 leading-snug">
          나만의 매매 기준과 <br />
          원칙을 세워주세요
        </h2>
        <p className="text-xs text-slate-400">
          뇌동매매 방지를 위해 익절선과 손절선을 명확히 잡습니다.
        </p>
      </div>

      {/* 1. 익절가 & 손절가 설정 */}
      <div className="space-y-4">
        {/* 목표가 (Target Price) */}
        <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <span>목표가 (Target Price)</span>
            </div>
            {targetRate !== null && (
              <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                목표 수익률 +{targetRate}%
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              value={form.targetPrice}
              onChange={(e) => onChange({ targetPrice: e.target.value })}
              placeholder="목표가 입력"
              className="w-full bg-white rounded-xl px-3.5 py-3 text-sm font-bold tabular-nums text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-xs"
            />
            <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
              {form.currency === 'KRW' ? '원' : '$'}
            </span>
          </div>
        </div>

        {/* 손절가 (Stop-Loss Price) */}
        <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <span>손절가 (Stop-Loss Price)</span>
            </div>
            {stopLossRate !== null && (
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                허용 손실률 {stopLossRate}%
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              value={form.stopLossPrice}
              onChange={(e) => onChange({ stopLossPrice: e.target.value })}
              placeholder="손절가 입력"
              className="w-full bg-white rounded-xl px-3.5 py-3 text-sm font-bold tabular-nums text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-xs"
            />
            <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
              {form.currency === 'KRW' ? '원' : '$'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 목표 보유 기간 (단기 / 중기 / 장기 칩) */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <span>목표 보유 기간</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'SHORT', title: '단기 (스캘핑/데이)', desc: '1일 ~ 1주' },
            { id: 'MEDIUM', title: '중기 (스윙)', desc: '1주 ~ 1달' },
            { id: 'LONG', title: '장기 투자', desc: '1달 이상' },
          ].map((item) => {
            const isSelected = form.holdingPeriod === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange({ holdingPeriod: item.id as HoldingPeriodType })}
                className={`p-3 rounded-2xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold">{item.title}</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {item.desc}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. 매수 전 원칙 준수 여부 체크리스트 */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-blue-600" />
          <span>매수 전 원칙 준수 여부 체크</span>
        </label>

        <div className="space-y-2">
          {form.checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleChecklist(item.id)}
              className={`p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                item.checked
                  ? 'bg-blue-50 text-blue-900 font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                  item.checked ? 'bg-blue-600 text-white' : 'bg-slate-200 text-transparent'
                }`}
              >
                ✓
              </div>
              <span className="text-xs">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

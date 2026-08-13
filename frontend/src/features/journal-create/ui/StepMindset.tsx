import type { JournalFormState, EmotionType } from '../model/types'
import EmotionIcon from '@/shared/assets/emotion.svg?react'

interface StepMindsetProps {
  form: JournalFormState
  onChange: (updates: Partial<JournalFormState>) => void
}

const EMOTION_ITEMS: {
  id: EmotionType
  label: string
  desc: string
}[] = [
  {
    id: 'FOMO',
    label: 'FOMO (조바심)',
    desc: '남들 다 사서 마음이 급함',
  },
  {
    id: 'PANIC',
    label: '공포 / 패닉',
    desc: '더 떨어질까 봐 무서움',
  },
  {
    id: 'CONFIDENCE',
    label: '확신 / 냉정',
    desc: '분석에 기반한 원칙 매매',
  },
  {
    id: 'GREED',
    label: '탐욕',
    desc: '목표가 왔지만 더 오를 것 같음',
  },
  {
    id: 'NONE',
    label: '없음 / 평온',
    desc: '특별한 감정 변화 없음',
  },
]

export function StepMindset({ form, onChange }: StepMindsetProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 질문형 상단 타이틀 */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 leading-snug">
          매매 당시의 마음과 <br />
          미래의 다짐을 적어보세요
        </h2>
        <p className="text-xs text-slate-400">
          뇌동매매를 방지하는 나만의 감정 기록과 STAY 메시지를 남깁니다.
        </p>
      </div>

      {/* 1. 매매 당시 감정 상태 (emotion.svg 아이콘 적용) */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <span>매매 당시 감정 상태</span>
        </label>

        <div className="grid grid-cols-1 gap-2">
          {EMOTION_ITEMS.map((item) => {
            const isSelected = form.emotion === item.id
            return (
              <div
                key={item.id}
                onClick={() => onChange({ emotion: item.id })}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'bg-slate-200/60 text-slate-700'
                    }`}
                  >
                    <EmotionIcon
                      className={`w-5 h-5 ${
                        isSelected
                          ? 'stroke-white [&>path]:stroke-white'
                          : 'stroke-slate-700 [&>path]:stroke-slate-700'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{item.label}</div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        isSelected ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      "{item.desc}"
                    </div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-transparent'
                  }`}
                >
                  ✓
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. 매매 이유 메모 */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <span>매매 이유 (진입/청산 근거)</span>
        </label>
        <textarea
          rows={3}
          value={form.reasonMemo}
          onChange={(e) => onChange({ reasonMemo: e.target.value })}
          placeholder="아이디어, 차트 패턴, 호재/악재 등 구체적인 이유를 자유롭게 적어주세요."
          className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-slate-100 focus:ring-2 focus:ring-blue-600 transition-all resize-none"
        />
      </div>

      {/* 3. 미래의 나에게 보내는 메시지 (S-T-A-Y 한마디) */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <span>미래의 나에게 보내는 메시지 (S-T-A-Y 한마디)</span>
        </label>
        <div className="relative">
          <textarea
            rows={3}
            value={form.stayMessage}
            onChange={(e) => onChange({ stayMessage: e.target.value })}
            placeholder='예: "손절가 터치하면 미련 없이 팔아라. 나중에 후회하지 말고!"&#10;예: "지금 매수 버튼 누르고 싶지? 차트 끄고 30분 뒤에 다시 봐라."'
            className="w-full bg-blue-50/60 rounded-2xl p-4 text-xs font-semibold text-blue-950 placeholder:text-blue-300 focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-600 transition-all resize-none"
          />
        </div>
      </div>
    </div>
  )
}

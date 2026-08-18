import { TOTAL_JOURNAL_STEPS } from '../constants'

interface JournalStepIndicatorProps {
  currentStep: number
  totalSteps?: number
}

export function JournalStepIndicator({
  currentStep,
  totalSteps = TOTAL_JOURNAL_STEPS,
}: JournalStepIndicatorProps) {
  const progressPercent = (currentStep / totalSteps) * 100

  return (
    <div className="space-y-3">
      {/* 상단 스텝 뱃지 */}
      <div className="flex justify-end">
        <span className="text-xs font-bold text-blue-600 tabular-nums bg-blue-50 px-2.5 py-0.5 rounded-full">
          {currentStep} / {totalSteps} 단계
        </span>
      </div>

      {/* 진행 바 */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}

import { Loader2 } from 'lucide-react'
import { Toast, useToast } from '@/shared/ui'
import {
  StepBasicData,
  StepRules,
  StepMindset,
  JournalStepIndicator,
  JournalSuccessView,
  useJournalForm,
  useStepNavigation,
  useCreateJournalMutation,
  TOTAL_JOURNAL_STEPS,
} from '@/features/journal-create'

export function JournalWritePage() {
  // 모던 플로팅 토스트 훅
  const { toastState, showToast } = useToast()

  // 1. 단계(Step) 이동 및 뒤로가기 전담 훅 (URL SearchParams 기반 표준 퍼널)
  const { currentStep, nextStep } = useStepNavigation({
    totalSteps: TOTAL_JOURNAL_STEPS,
  })

  // 2. 폼 데이터(State) 및 유효성 검증 전담 훅 (URL editId 지원)
  const {
    formState,
    updateForm,
    getValidationError,
    isEditMode,
    editId,
    isLoadingDetail,
  } = useJournalForm()

  // 3. 백엔드 API 제출 및 Mutation 전담 훅 (수정 및 생성 분기 지원)
  const { mutate: saveJournal, isSubmitting, isSuccess } = useCreateJournalMutation({
    editId,
    onError: (msg) => showToast(msg, 'error'),
  })

  // 다음 버튼 클릭 시 처리 (유효성 검증 실패 시 토스트 알림, 통과 시 1~2단계 nextStep / 마지막 단계 saveJournal)
  const onNextClick = () => {
    const errorMsg = getValidationError(currentStep)
    if (errorMsg) {
      showToast(errorMsg, 'error')
      return
    }

    if (currentStep < TOTAL_JOURNAL_STEPS) {
      nextStep()
    } else {
      saveJournal(formState)
    }
  }

  // 저장 성공 시 축하 화면 렌더링
  if (isSuccess) {
    return <JournalSuccessView />
  }

  // 수정 모드 데이터 로딩 중
  if (isLoadingDetail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">수정할 일지 정보를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-4 pb-24 space-y-6 relative">
      {/* 상단 플로팅 토스트 알림 */}
      <Toast
        message={toastState.message}
        type={toastState.type}
        isVisible={toastState.isVisible}
      />

      {/* 1. 스텝 진행률 바 */}
      <JournalStepIndicator currentStep={currentStep} totalSteps={TOTAL_JOURNAL_STEPS} />

      {/* 2. 현재 스텝 본문 콘텐츠 */}
      <div className="flex-1">
        {currentStep === 1 && (
          <StepBasicData form={formState} onChange={updateForm} />
        )}
        {currentStep === 2 && (
          <StepRules form={formState} onChange={updateForm} />
        )}
        {currentStep === 3 && (
          <StepMindset form={formState} onChange={updateForm} />
        )}
      </div>

      {/* 3. 하단 고정 CTA 버튼 */}
      <div className="fixed bottom-16 left-0 right-0 p-4 max-w-[430px] mx-auto bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none">
        <button
          type="button"
          onClick={onNextClick}
          disabled={isSubmitting}
          className="pointer-events-auto w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-2xl shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <span>
              {currentStep === TOTAL_JOURNAL_STEPS
                ? isEditMode
                  ? '주식일지 수정 완료'
                  : '주식일지 저장하기'
                : '다음'}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

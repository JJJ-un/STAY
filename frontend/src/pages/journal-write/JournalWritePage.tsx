import { useState, useEffect } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { journalApi } from '@/entities/journal'
import {
  StepBasicData,
  StepRules,
  StepMindset,
  type JournalFormState,
} from '@/features/journal-create'

interface JournalWritePageProps {
  onNavigate?: (path: string) => void
  initialStockId?: string
  initialStockName?: string
  initialStockCode?: string
  onRegisterBackHandler?: (fn: () => void) => void
}

export function JournalWritePage({
  onNavigate,
  initialStockId = '',
  initialStockName = '',
  initialStockCode = '',
  onRegisterBackHandler,
}: JournalWritePageProps) {
  // 스텝 관리 (1: 기본 매매 데이터, 2: 원칙 및 기준 설정, 3: 심리 상태 & STAY 메시지)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 일지 폼 상태 클린 초기값 (하드코딩 제거)
  const [formState, setFormState] = useState<JournalFormState>({
    stockId: initialStockId,
    stockName: initialStockName || '종목을 선택해 주세요',
    stockCode: initialStockCode,
    tradeType: 'BUY',
    tradeDateTime: new Date().toISOString().slice(0, 16),
    currency: 'USD',
    price: '',
    quantity: '',
    targetPrice: '',
    stopLossPrice: '',
    holdingPeriod: 'MEDIUM',
    checklist: [
      { id: 'c1', text: '매수 전 24시간 동안 충분히 고민했는가?', checked: false },
      { id: 'c2', text: '해당 기업의 실적과 모멘텀을 확인했는가?', checked: false },
      { id: 'c3', text: '분할 매수 및 손절 원칙을 세웠는가?', checked: false },
    ],
    emotion: 'CONFIDENCE',
    reasonMemo: '',
    stayMessage: '',
  })

  const updateForm = (updates: Partial<JournalFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }))
  }

  // 스텝별 유효성 검사
  const isStepValid = () => {
    if (currentStep === 1) {
      if (!formState.stockId) return false
      if (formState.tradeType !== 'WATCH') {
        const parsedPrice = parseFloat(formState.price.replace(/,/g, ''))
        const parsedQty = parseFloat(formState.quantity.replace(/,/g, ''))
        if (!parsedPrice || parsedPrice <= 0 || !parsedQty || parsedQty <= 0) {
          return false
        }
      }
      return true
    }
    if (currentStep === 3) {
      return formState.stayMessage.trim().length > 0
    }
    return true
  }

  // 이전 스텝 이동
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else {
      onNavigate?.('/journal')
    }
  }

  // 최상단 Header 전담 백 핸들러 등록
  useEffect(() => {
    onRegisterBackHandler?.(handlePrevStep)
  }, [currentStep, onRegisterBackHandler])

  // 다음 스텝 이동 및 최종 백엔드 API 제출
  const handleNextStep = async () => {
    if (!isStepValid()) {
      if (currentStep === 1) {
        if (!formState.stockId) {
          alert('종목을 선택해 주세요.')
          return
        }
        if (formState.tradeType !== 'WATCH') {
          alert('매매 단가와 수량을 올바르게 입력해 주세요.')
          return
        }
      }
      if (currentStep === 3) {
        alert('STAY 다짐 메시지를 입력해 주세요.')
        return
      }
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3)
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else {
      // 3단계 완료 ➔ 실제 백엔드 API 호출!
      if (isSubmitting) return
      setIsSubmitting(true)

      try {
        const parsedPrice = formState.price ? parseFloat(formState.price.replace(/,/g, '')) : undefined
        const parsedQty = formState.quantity ? parseFloat(formState.quantity.replace(/,/g, '')) : undefined
        const totalPrice = parsedPrice && parsedQty ? parsedPrice * parsedQty : undefined

        await journalApi.createJournal({
          stockId: parseInt(formState.stockId, 10),
          tradeType: formState.tradeType,
          tradeDateTime: formState.tradeDateTime.length === 16 ? `${formState.tradeDateTime}:00` : formState.tradeDateTime,
          currency: formState.currency,
          price: parsedPrice,
          quantity: parsedQty,
          totalPrice: totalPrice,
          targetPrice: formState.targetPrice ? parseFloat(formState.targetPrice.replace(/,/g, '')) : undefined,
          stopLossPrice: formState.stopLossPrice ? parseFloat(formState.stopLossPrice.replace(/,/g, '')) : undefined,
          holdingPeriod: formState.holdingPeriod,
          checklists: formState.checklist.map((c) => ({
            content: c.text,
            isChecked: c.checked,
          })),
          emotion: formState.emotion,
          reasonMemo: formState.reasonMemo || undefined,
          stayMessage: formState.stayMessage.trim(),
        })

        setIsSuccess(true)
        setTimeout(() => {
          onNavigate?.('/journal')
        }, 1500)
      } catch (error) {
        console.error('일지 저장 실패:', error)
        alert('일지 저장에 실패했습니다. 다시 시도해 주세요.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // 성공 축하 뷰
  if (isSuccess) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">주식일지가 저장되었습니다!</h2>
          <p className="text-xs text-slate-400">
            원칙을 지킨 매매 기록이 뇌동매매를 막아주는 든든한 방패가 됩니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-4 pb-24 space-y-6 relative">
      {/* 1. 상단 토스 스타일 진행률 바 (Step Indicator) */}
      <div className="space-y-3">
        <div className="flex justify-end">
          <span className="text-xs font-bold text-blue-600 tabular-nums bg-blue-50 px-2.5 py-0.5 rounded-full">
            {currentStep} / 3 단계
          </span>
        </div>

        {/* 진행 바 */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

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

      {/* 3. 하단 고정 토스 스타일 블루 CTA 버튼 */}
      <div className="fixed bottom-16 left-0 right-0 p-4 max-w-[430px] mx-auto bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none">
        <button
          type="button"
          onClick={handleNextStep}
          disabled={isSubmitting || !isStepValid()}
          className="pointer-events-auto w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-2xl shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <span>{currentStep === 3 ? '주식일지 저장하기' : '다음'}</span>
          )}
        </button>
      </div>
    </div>
  )
}

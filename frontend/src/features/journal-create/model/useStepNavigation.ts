import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOTAL_JOURNAL_STEPS } from '../constants'

interface UseStepNavigationProps {
  totalSteps?: number
}

/**
 * 일지 작성 1~3단계(Funnel Step) 이동, 화면 최상단 스크롤, 뒤로가기 전담 훅
 */
export function useStepNavigation({
  totalSteps = TOTAL_JOURNAL_STEPS,
}: UseStepNavigationProps = {}) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

  // 이전 스텝 이동 (1단계일 때는 직전 페이지로 복귀)
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else {
      navigate(-1)
    }
  }

  // 다음 스텝 이동
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  // 스텝 1단계로 초기화
  const resetStep = () => {
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return {
    currentStep,
    nextStep,
    prevStep,
    resetStep,
  }
}

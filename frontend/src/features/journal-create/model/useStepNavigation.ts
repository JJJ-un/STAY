import { useSearchParams, useNavigate } from 'react-router-dom'
import { TOTAL_JOURNAL_STEPS } from '../constants'

interface UseStepNavigationProps {
  totalSteps?: number
}

/**
 * 일지 작성 1~3단계(Funnel Step) 이동 및 뒤로가기 전담 훅
 * React Router의 URL SearchParams(?step=1,2,3)를 활용하여
 * 브라우저 히스토리와 상단 헤더 뒤로가기(navigate(-1))를 100% 표준으로 완벽 연동합니다.
 */
export function useStepNavigation({
  totalSteps = TOTAL_JOURNAL_STEPS,
}: UseStepNavigationProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // URL에서 현재 스텝 읽기 (기본값: 1)
  const rawStep = Number(searchParams.get('step')) || 1
  const currentStep = (rawStep >= 1 && rawStep <= totalSteps ? rawStep : 1) as 1 | 2 | 3

  // 다음 스텝으로 이동 (기존 URL 쿼리를 보존한 채 step 번호만 업데이트)
  const nextStep = () => {
    if (currentStep < totalSteps) {
      const next = currentStep + 1
      const newParams = new URLSearchParams(searchParams)
      newParams.set('step', String(next))
      setSearchParams(newParams)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  // 이전 스텝으로 이동 (React Router 표준 히스토리 뒤로가기)
  const prevStep = () => {
    navigate(-1)
  }

  // 1단계로 리셋
  const resetStep = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('step')
    setSearchParams(newParams)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return {
    currentStep,
    nextStep,
    prevStep,
    resetStep,
  }
}

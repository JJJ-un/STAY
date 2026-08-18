import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { journalApi } from '@/entities/journal'
import type { JournalFormState } from '../types'
import { createInitialJournalFormState } from '../constants'
import { isJournalStepValid, getStepValidationError } from '../lib/validation'
import { fromDetailResponseToFormState } from '../lib/mapper'

/**
 * 주식일지 폼 데이터(State) 및 입력값 유효성 검증(Validation), 수정 모드(Edit) 전담 훅
 */
export function useJournalForm() {
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('editId') || ''
  const urlStockId = searchParams.get('stockId') || ''
  const urlStockName = searchParams.get('stockName') || ''
  const urlStockCode = searchParams.get('stockCode') || ''

  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false)

  // 폼 초기 상태를 URL 파라미터 기반으로 깔끔하게 초기화
  const [formState, setFormState] = useState<JournalFormState>(() =>
    createInitialJournalFormState({
      stockId: urlStockId,
      stockName: urlStockName || '종목을 선택해 주세요',
      stockCode: urlStockCode,
    })
  )

  // 수정 모드: editId가 있을 때 기존 일지 데이터 로딩
  useEffect(() => {
    if (!editId) return

    let isMounted = true
    setIsLoadingDetail(true)

    journalApi
      .getJournalDetail(editId)
      .then((detail) => {
        if (isMounted) {
          const loadedState = fromDetailResponseToFormState(detail)
          setFormState(loadedState)
          setIsLoadingDetail(false)
        }
      })
      .catch((err) => {
        console.error('수정용 일지 상세 데이터 로드 실패:', err)
        if (isMounted) {
          setIsLoadingDetail(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [editId])

  // 1. 폼 초기화 메서드
  const resetForm = (customInitial?: Partial<JournalFormState>) => {
    setFormState(
      createInitialJournalFormState({
        stockId: urlStockId,
        stockName: urlStockName,
        stockCode: urlStockCode,
        ...customInitial,
      })
    )
  }

  // 2. URL 파라미터 변경 시 반응형 동기화 (신규 작성 시)
  useEffect(() => {
    if (!editId && urlStockId) {
      setFormState((prev) => ({
        ...prev,
        stockId: urlStockId,
        stockName: urlStockName || prev.stockName,
        stockCode: urlStockCode || prev.stockCode,
      }))
    }
  }, [editId, urlStockId, urlStockName, urlStockCode])

  const updateForm = (updates: Partial<JournalFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }))
  }

  return {
    formState,
    updateForm,
    resetForm,
    isEditMode: !!editId,
    editId,
    isLoadingDetail,
    isStepValid: (step: number) => isJournalStepValid(step, formState),
    getValidationError: (step: number) => getStepValidationError(step, formState),
  }
}

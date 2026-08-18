import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { journalApi } from '@/entities/journal'
import { toJournalCreateRequest } from '../lib/mapper'
import type { JournalFormState } from '../types'

interface UseCreateJournalMutationProps {
  onError?: (errorMessage: string) => void
}

/**
 * 주식일지 생성 API 통신, 로딩/성공 상태, 딜레이 화면 전환 전담 Mutation 훅
 */
export function useCreateJournalMutation({
  onError,
}: UseCreateJournalMutationProps = {}) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const mutate = async (formState: JournalFormState) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const payload = toJournalCreateRequest(formState)
      await journalApi.createJournal(payload)

      setIsSuccess(true)
      setTimeout(() => {
        navigate('/journal')
      }, 1500)
    } catch (error) {
      console.error('일지 저장 실패:', error)
      const errorMsg = '일지 저장에 실패했습니다. 다시 시도해 주세요.'
      onError?.(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    mutate,
    isSubmitting,
    isSuccess,
  }
}

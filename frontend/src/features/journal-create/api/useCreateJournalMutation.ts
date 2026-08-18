import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { journalApi } from '@/entities/journal'
import { toJournalCreateRequest, toJournalUpdateRequest } from '../lib/mapper'
import type { JournalFormState } from '../types'

interface UseSaveJournalMutationProps {
  editId?: string
  onError?: (errorMessage: string) => void
}

/**
 * 주식일지 생성/수정 API 통신, 로딩/성공 상태, 딜레이 화면 전환 전담 Mutation 훅
 */
export function useCreateJournalMutation({
  editId,
  onError,
}: UseSaveJournalMutationProps = {}) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const mutate = async (formState: JournalFormState) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      if (editId) {
        // 수정 모드: PUT /api/v1/journals/{journalId}
        const updatePayload = toJournalUpdateRequest(formState)
        await journalApi.updateJournal(editId, updatePayload)
        setIsSuccess(true)
        setTimeout(() => {
          navigate(`/journal/detail?id=${editId}`, { replace: true })
        }, 1200)
      } else {
        // 신규 작성 모드: POST /api/v1/journals
        const createPayload = toJournalCreateRequest(formState)
        await journalApi.createJournal(createPayload)
        setIsSuccess(true)
        setTimeout(() => {
          navigate('/journal')
        }, 1500)
      }
    } catch (error) {
      console.error('일지 저장/수정 실패:', error)
      const errorMsg = editId
        ? '일지 수정에 실패했습니다. 다시 시도해 주세요.'
        : '일지 저장에 실패했습니다. 다시 시도해 주세요.'
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

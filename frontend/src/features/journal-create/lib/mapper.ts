import type { JournalCreateRequest } from '@/entities/journal'
import type { JournalFormState } from '../types'

/**
 * 콤마 제거 및 부동소수점 변환 유틸
 */
function parseNumericInput(val?: string): number | undefined {
  if (!val || !val.trim()) return undefined
  const parsed = parseFloat(val.replace(/,/g, ''))
  return isNaN(parsed) ? undefined : parsed
}

/**
 * 초 단위 ISO 날짜 보정 (:00)
 */
function formatIsoDateTime(dateTime: string): string {
  if (!dateTime) return new Date().toISOString().slice(0, 19)
  return dateTime.length === 16 ? `${dateTime}:00` : dateTime
}

/**
 * 폼 상태(JournalFormState)를 백엔드 API 요청 DTO(JournalCreateRequest)로 변환하는 순수 매퍼 함수
 */
export function toJournalCreateRequest(form: JournalFormState): JournalCreateRequest {
  const price = parseNumericInput(form.price)
  const quantity = parseNumericInput(form.quantity)
  const totalPrice = price && quantity ? price * quantity : undefined

  return {
    stockId: parseInt(form.stockId, 10) || 1,
    tradeType: form.tradeType,
    tradeDateTime: formatIsoDateTime(form.tradeDateTime),
    currency: form.currency,
    price,
    quantity,
    totalPrice,
    targetPrice: parseNumericInput(form.targetPrice),
    stopLossPrice: parseNumericInput(form.stopLossPrice),
    holdingPeriod: form.holdingPeriod,
    checklists: form.checklist.map((c) => ({
      content: c.text,
      isChecked: c.checked,
    })),
    emotion: form.emotion,
    reasonMemo: form.reasonMemo?.trim() || undefined,
    stayMessage: form.stayMessage.trim(),
  }
}

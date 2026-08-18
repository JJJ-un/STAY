import type { JournalCreateRequest, JournalUpdateRequest, JournalDetailResponse } from '@/entities/journal'
import type { JournalFormState } from '../types'
import { DEFAULT_RULE_CHECKLIST } from '../constants'

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
 * 폼 상태(JournalFormState)를 백엔드 API 요청 DTO(JournalCreateRequest)로 변환
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

/**
 * 폼 상태(JournalFormState)를 백엔드 수정 요청 DTO(JournalUpdateRequest)로 변환
 */
export function toJournalUpdateRequest(form: JournalFormState): JournalUpdateRequest {
  const price = parseNumericInput(form.price) || 0
  const quantity = parseNumericInput(form.quantity) || 0
  const totalPrice = price * quantity

  return {
    tradeType: form.tradeType,
    tradeDateTime: formatIsoDateTime(form.tradeDateTime),
    currency: form.currency,
    price,
    quantity,
    totalPrice,
    targetPrice: parseNumericInput(form.targetPrice),
    stopLossPrice: parseNumericInput(form.stopLossPrice),
    holdingPeriod: form.holdingPeriod,
    emotion: form.emotion,
    reasonMemo: form.reasonMemo?.trim() || undefined,
    stayMessage: form.stayMessage.trim(),
  }
}

/**
 * 상세 조회 DTO(JournalDetailResponse)를 수정용 폼 상태(JournalFormState)로 역변환
 */
export function fromDetailResponseToFormState(detail: JournalDetailResponse): JournalFormState {
  const checklist = detail.checklists && detail.checklists.length > 0
    ? detail.checklists.map((c) => ({
        id: String(c.checklistId),
        text: c.content,
        checked: c.isChecked,
      }))
    : DEFAULT_RULE_CHECKLIST

  let tradeDateFormatted = detail.tradeDateTime || new Date().toISOString()
  if (tradeDateFormatted.length > 16) {
    tradeDateFormatted = tradeDateFormatted.slice(0, 16)
  }

  return {
    stockId: String(detail.stock?.stockId || ''),
    stockName: detail.stock?.name || '종목명',
    stockCode: detail.stock?.ticker || '',
    tradeType: detail.tradeType || 'BUY',
    tradeDateTime: tradeDateFormatted,
    currency: detail.currency || 'USD',
    price: detail.price ? String(detail.price) : '',
    quantity: detail.quantity ? String(detail.quantity) : '',
    targetPrice: detail.targetPrice ? String(detail.targetPrice) : '',
    stopLossPrice: detail.stopLossPrice ? String(detail.stopLossPrice) : '',
    holdingPeriod: detail.holdingPeriod || 'MEDIUM',
    checklist,
    emotion: detail.emotion || 'CONFIDENCE',
    reasonMemo: detail.reasonMemo || '',
    stayMessage: detail.stayMessage || '',
  }
}

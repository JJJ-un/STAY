import type { JournalFormState } from '../types'

export interface StepValidationResult {
  isValid: boolean
  errorMessage?: string
}

/**
 * 1단계: 기본 매매 데이터 유효성 검증 (종목 선택, 단가/수량 입력 여부)
 */
export function validateStep1(form: JournalFormState): StepValidationResult {
  if (!form.stockId) {
    return { isValid: false, errorMessage: '종목을 선택해 주세요.' }
  }
  if (form.tradeType !== 'WATCH') {
    const parsedPrice = parseFloat(form.price.replace(/,/g, ''))
    const parsedQty = parseFloat(form.quantity.replace(/,/g, ''))
    if (!parsedPrice || parsedPrice <= 0 || !parsedQty || parsedQty <= 0) {
      return { isValid: false, errorMessage: '매매 단가와 수량을 올바르게 입력해 주세요.' }
    }
  }
  return { isValid: true }
}

/**
 * 2단계: 원칙 및 기준 설정 검증 (체크리스트 등)
 */
export function validateStep2(_form: JournalFormState): StepValidationResult {
  return { isValid: true }
}

/**
 * 3단계: 심리 상태 & STAY 메시지 유효성 검증
 */
export function validateStep3(form: JournalFormState): StepValidationResult {
  if (!form.stayMessage.trim()) {
    return { isValid: false, errorMessage: 'STAY 다짐 메시지를 입력해 주세요.' }
  }
  return { isValid: true }
}

/**
 * 특정 스텝의 유효성 통과 여부 (boolean)
 */
export function isJournalStepValid(step: number, form: JournalFormState): boolean {
  switch (step) {
    case 1:
      return validateStep1(form).isValid
    case 2:
      return validateStep2(form).isValid
    case 3:
      return validateStep3(form).isValid
    default:
      return true
  }
}

/**
 * 특정 스텝의 검증 실패 에러 메시지 추출
 */
export function getStepValidationError(step: number, form: JournalFormState): string | null {
  switch (step) {
    case 1:
      return validateStep1(form).errorMessage || null
    case 2:
      return validateStep2(form).errorMessage || null
    case 3:
      return validateStep3(form).errorMessage || null
    default:
      return null
  }
}

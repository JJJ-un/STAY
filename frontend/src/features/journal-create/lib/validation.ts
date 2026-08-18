import type { JournalFormState } from '../types'

export interface StepValidationResult {
  isValid: boolean
  errorMessage?: string
}

export type StepValidatorFn = (form: JournalFormState) => StepValidationResult

/**
 * 1. 엄격하고 안전한 양의 실수 검증 헬퍼 (런타임 타입가드 + 100abc 등 파싱 버그 방지)
 */
export function isValidPositiveNumber(value?: unknown): boolean {
  if (typeof value !== 'string') return false
  const cleanValue = value.replace(/,/g, '').trim()
  if (!cleanValue) return false

  // 순수 양의 정수 또는 소수점 형식인지 정규식으로 엄격 검사
  const positiveNumberRegex = /^\d+(\.\d+)?$/
  if (!positiveNumberRegex.test(cleanValue)) return false

  const num = Number(cleanValue)
  return Number.isFinite(num) && num > 0
}

/**
 * 2. 스텝별 검증 전략 맵 (Strategy Pattern 적용으로 OCP 준수 & 무제한 스텝 확장 용이)
 */
export const stepValidators: Record<number, StepValidatorFn> = {
  // 1단계: 기본 매매 데이터 유효성 검증 (종목 선택, 단가/수량 입력 여부)
  1: (form: JournalFormState) => {
    if (!form.stockId || !form.stockId.trim()) {
      return { isValid: false, errorMessage: '종목을 선택해 주세요.' }
    }
    if (form.tradeType !== 'WATCH') {
      if (!isValidPositiveNumber(form.price) || !isValidPositiveNumber(form.quantity)) {
        return { isValid: false, errorMessage: '매매 단가와 수량을 올바른 숫자로 입력해 주세요.' }
      }
    }
    return { isValid: true }
  },

  // 2단계: 매매 원칙 및 기준 설정 검증
  2: () => ({ isValid: true }),

  // 3단계: 심리 상태 & STAY 메시지 유효성 검증
  3: (form: JournalFormState) => {
    if (typeof form.stayMessage !== 'string' || !form.stayMessage.trim()) {
      return { isValid: false, errorMessage: 'STAY 다짐 메시지를 입력해 주세요.' }
    }
    return { isValid: true }
  },
}

/**
 * 3. 단일 검증 진입점 함수 (중복 연산 방지)
 */
export function validateJournalStep(step: number, form: JournalFormState): StepValidationResult {
  const validator = stepValidators[step]
  return validator ? validator(form) : { isValid: true }
}

/**
 * 특정 스텝의 유효성 통과 여부 (boolean)
 */
export function isJournalStepValid(step: number, form: JournalFormState): boolean {
  return validateJournalStep(step, form).isValid
}

/**
 * 특정 스텝의 검증 실패 에러 메시지 추출
 */
export function getStepValidationError(step: number, form: JournalFormState): string | null {
  return validateJournalStep(step, form).errorMessage || null
}

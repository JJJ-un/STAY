import type { JournalFormState, RuleChecklistItem } from '../types'

// 주식일지 작성 전체 단계 수 (1단계: 매매 사실 ➔ 2단계: 매매 원칙 ➔ 3단계: STAY 다짐)
export const TOTAL_JOURNAL_STEPS = 3

// 기본 매매 원칙 체크리스트 목록
export const DEFAULT_RULE_CHECKLIST: RuleChecklistItem[] = [
  { id: 'c1', text: '매수 전 24시간 동안 충분히 고민했는가?', checked: false },
  { id: 'c2', text: '해당 기업의 실적과 모멘텀을 확인했는가?', checked: false },
  { id: 'c3', text: '분할 매수 및 손절 원칙을 세웠는가?', checked: false },
]

/**
 * 일지 폼 초기 상태를 반환하는 순수 팩토리 함수
 */
export function createInitialJournalFormState(
  initial?: Partial<JournalFormState>
): JournalFormState {
  return {
    stockId: initial?.stockId || '',
    stockName: initial?.stockName || '종목을 선택해 주세요',
    stockCode: initial?.stockCode || '',
    tradeType: initial?.tradeType || 'BUY',
    tradeDateTime: initial?.tradeDateTime || new Date().toISOString().slice(0, 16),
    currency: initial?.currency || 'USD',
    price: initial?.price || '',
    quantity: initial?.quantity || '',
    targetPrice: initial?.targetPrice || '',
    stopLossPrice: initial?.stopLossPrice || '',
    holdingPeriod: initial?.holdingPeriod || 'MEDIUM',
    checklist: initial?.checklist || DEFAULT_RULE_CHECKLIST,
    emotion: initial?.emotion || 'CONFIDENCE',
    reasonMemo: initial?.reasonMemo || '',
    stayMessage: initial?.stayMessage || '',
  }
}

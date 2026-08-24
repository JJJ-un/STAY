/**
 * STAY 알림 유형 열거형 (백엔드 NotificationType과 1:1 매핑)
 * - PATTERN_MATCHED: 과거 뇌동매매 주가 흐름 재현 알림 (다짐 멘탈 관리)
 * - TARGET_PRICE_HIT: 익절 목표가 도달 알림 (원칙 매도)
 * - STOP_LOSS_HIT: 손절 기준가 도달 알림 (원칙 손절)
 */
export type NotificationType = 'PATTERN_MATCHED' | 'TARGET_PRICE_HIT' | 'STOP_LOSS_HIT'

/**
 * 알림 목록 탭 필터 유형 (화면 [전체] 탭 포함)
 */
export type NotificationFilterType = 'ALL' | NotificationType

/**
 * 알림 단건/목록 응답 DTO (백엔드 NotificationResponse와 1:1 매핑)
 */
export interface NotificationResponse {
  notificationId: number
  journalId: number
  ticker: string
  type: NotificationType
  stayMessage: string
  currentPrice: number
  targetPrice: number
  isRead: boolean
  createdAt: string
}

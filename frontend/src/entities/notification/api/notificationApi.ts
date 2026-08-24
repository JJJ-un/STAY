import { apiClient, type ApiResponse } from '@/shared/api'
import type { NotificationResponse, NotificationType } from '../model/types'

export interface GetNotificationsParams {
  unreadOnly?: boolean
  type?: NotificationType
}

/**
 * 내 알림 목록 조회 (최신순, 안읽음만, 유형별 필터 지원)
 * GET /api/v1/notifications
 */
export async function getNotifications(
  params?: GetNotificationsParams
): Promise<NotificationResponse[]> {
  const res = await apiClient.get<ApiResponse<NotificationResponse[]>>('/notifications', {
    params,
  })
  return res.data.data
}

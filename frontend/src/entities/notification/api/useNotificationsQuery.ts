import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getNotifications, type GetNotificationsParams } from './notificationApi'
import type { NotificationResponse } from '../model/types'

/**
 * 내 알림 목록을 조회하는 TanStack Query 훅
 * - staleTime: 30초 (탭 전환 시 API 중복 호출 차단)
 * - gcTime: 10분 메모리 캐시 보존
 * - placeholderData: keepPreviousData (탭 전환 시 깜빡임 없는 부드러운 전환)
 */
export function useNotificationsQuery(params?: GetNotificationsParams) {
  const normalizedParams = {
    unreadOnly: params?.unreadOnly ? true : undefined,
    type: params?.type || undefined,
  }

  return useQuery<NotificationResponse[]>({
    queryKey: ['notifications', 'list', normalizedParams],
    queryFn: () => getNotifications(normalizedParams),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
  })
}

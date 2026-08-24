import {
  useNotificationsQuery,
  type NotificationFilterType,
} from '@/entities/notification'
import { NotificationItem } from './NotificationItem'
import { NotificationListSkeleton } from './NotificationListSkeleton'

interface NotificationListProps {
  filter: NotificationFilterType
  unreadOnly?: boolean
}

export function NotificationList({ filter, unreadOnly }: NotificationListProps) {
  // 'ALL' 필터일 땐 type을 undefined로 보내서 전체 조회
  const queryType = filter === 'ALL' ? undefined : filter

  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useNotificationsQuery({
    unreadOnly,
    type: queryType,
  })

  // 1. 로딩 상태 ➔ 스켈레톤 표시
  if (isLoading) {
    return <NotificationListSkeleton count={6} />
  }

  // 2. 에러 상태 ➔ 에러 메시지 및 재시도 버튼
  if (isError) {
    return (
      <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
        <p className="text-xs text-red-500 font-medium">알림 목록을 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
        >
          다시 시도
        </button>
      </div>
    )
  }

  // 3. 빈 데이터 상태
  if (notifications.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-1.5">
        <p className="text-xs font-medium text-slate-400">도착한 알림이 없습니다.</p>
      </div>
    )
  }

  // 4. 정상 목록 렌더링
  return (
    <div className="flex flex-col space-y-3">
      {notifications.map((item) => (
        <NotificationItem
          key={item.notificationId}
          item={item}
        />
      ))}
    </div>
  )
}

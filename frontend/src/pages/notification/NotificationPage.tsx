import { Tabs } from '@/shared/ui'
import { useQueryParam } from '@/shared/lib'
import type { NotificationFilterType } from '@/entities/notification'
import {
  NotificationList,
  NOTIFICATION_TAB_ITEMS,
  VALID_NOTIFICATION_FILTERS,
} from '@/features/notification-list'

export function NotificationPage() {
  // URL 쿼리 파라미터(?filter=...)와 완벽 동기화 (뒤로가기/새로고침 보존)
  const [activeFilter, setActiveFilter] = useQueryParam<NotificationFilterType>(
    'filter',
    'ALL',
    VALID_NOTIFICATION_FILTERS
  )

  return (
    <div className="flex-1 flex flex-col">
      {/* 상단 알림 필터 탭바 */}
      <div className="sticky top-[48px] z-40 bg-white/95 backdrop-blur-md px-4">
        <Tabs<NotificationFilterType>
          items={NOTIFICATION_TAB_ITEMS}
          activeId={activeFilter}
          onChange={setActiveFilter}
          variant="underline"
          size="sm"
          fullWidth
        />
      </div>

      {/* 알림 리스트 영역 */}
      <div className="flex-1 px-4 py-4 pb-6">
        <NotificationList filter={activeFilter} />
      </div>
    </div>
  )
}

export default NotificationPage

import { useState } from 'react'
import { Tabs, type TabItem } from '@/shared/ui'
import {
  NotificationList,
  type NotificationFilterType,
} from '@/features/notification-list'

const NOTIFICATION_TAB_ITEMS: TabItem<NotificationFilterType>[] = [
  { id: 'ALL', label: '전체' },
  { id: 'LIKE', label: '공감' },
  { id: 'MENTAL', label: '멘탈' },
  { id: 'RULE', label: '원칙' },
]

export function NotificationPage() {
  const [activeFilter, setActiveFilter] = useState<NotificationFilterType>('ALL')

  return (
    <div className="flex-1 flex flex-col">
      {/* 헤더 바로 아래 위치하는 알림 필터 탭 (섹션 전체 꽉 차게 렌더링) */}
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

      {/* 알림 리스트 영역 (테두리 없음, 하단 회색선 구분) */}
      <div className="flex-1 px-4 pb-6">
        <NotificationList filter={activeFilter} />
      </div>
    </div>
  )
}

export default NotificationPage

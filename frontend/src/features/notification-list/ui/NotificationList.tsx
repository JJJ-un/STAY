import { useState } from 'react'
import type { NotificationItemData, NotificationFilterType } from '../model/types'
import { NotificationItem } from './NotificationItem'

export const MOCK_NOTIFICATIONS: NotificationItemData[] = [
  {
    id: 'n1',
    category: 'MENTAL',
    badgeLabel: '멘탈 알림',
    badgeBgColor: 'bg-blue-50',
    badgeTextColor: 'text-blue-600',
    message: '장 마감 전 조급한 뇌동매수에 주의하세요. 설정한 수칙을 재확인하세요.',
    createdAt: '10분 전',
    isRead: false,
  },
  {
    id: 'n2',
    category: 'LIKE',
    badgeLabel: '피드 공감',
    badgeBgColor: 'bg-rose-50',
    badgeTextColor: 'text-rose-600',
    message: '@반도체고수 님이 나의 매매 원칙에 공감을 표시했습니다.',
    createdAt: '2시간 전',
    isRead: false,
  },
  {
    id: 'n3',
    category: 'RULE',
    badgeLabel: '원칙 경고',
    badgeBgColor: 'bg-amber-50',
    badgeTextColor: 'text-amber-700',
    message: '삼성전자 손절가(68,000원)에 근접했습니다. 뇌동매도를 방지하고 원칙을 체크하세요.',
    createdAt: '어제 15:20',
    isRead: true,
  },
  {
    id: 'n4',
    category: 'LIKE',
    badgeLabel: '피드 공감',
    badgeBgColor: 'bg-rose-50',
    badgeTextColor: 'text-rose-600',
    message: '@멘탈마스터 님이 작성하신 STAY 한마디에 공감했습니다.',
    createdAt: '2026.08.10',
    isRead: true,
  },
  {
    id: 'n5',
    category: 'RULE',
    badgeLabel: '원칙 달성',
    badgeBgColor: 'bg-emerald-50',
    badgeTextColor: 'text-emerald-700',
    message: 'SK하이닉스 목표 보유 기간(중기 1달)을 지킨 원칙 매매가 달성되었습니다.',
    createdAt: '2026.08.08',
    isRead: true,
  },
]

interface NotificationListProps {
  filter: NotificationFilterType
}

export function NotificationList({ filter }: NotificationListProps) {
  const [notifications, setNotifications] = useState<NotificationItemData[]>(MOCK_NOTIFICATIONS)

  const handleItemClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    )
  }

  // 탭 필터 적용
  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'ALL') return true
    return item.category === filter
  })

  if (filteredNotifications.length === 0) {
    return (
      <div className="py-16 text-center text-xs text-slate-400">
        해당 카테고리의 알림이 없습니다.
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {filteredNotifications.map((item) => (
        <NotificationItem
          key={item.id}
          item={item}
          onItemClick={handleItemClick}
        />
      ))}
    </div>
  )
}

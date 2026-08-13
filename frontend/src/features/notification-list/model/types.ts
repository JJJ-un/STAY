export type NotificationFilterType = 'ALL' | 'LIKE' | 'MENTAL' | 'RULE'

export type NotificationCategory = 'LIKE' | 'MENTAL' | 'RULE'

export interface NotificationItemData {
  id: string
  category: NotificationCategory
  badgeLabel: string
  badgeBgColor: string
  badgeTextColor: string
  message: string
  createdAt: string
  isRead: boolean
}

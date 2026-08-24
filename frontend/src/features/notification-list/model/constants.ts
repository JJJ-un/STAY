import type { TabItem } from '@/shared/ui'
import type { NotificationFilterType } from '@/entities/notification'

export const NOTIFICATION_TAB_ITEMS: TabItem<NotificationFilterType>[] = [
  { id: 'ALL', label: '전체' },
  { id: 'PATTERN_MATCHED', label: '다짐' },
  { id: 'TARGET_PRICE_HIT', label: '목표가' },
  { id: 'STOP_LOSS_HIT', label: '손절가' },
]

export const VALID_NOTIFICATION_FILTERS: readonly NotificationFilterType[] = [
  'ALL',
  'PATTERN_MATCHED',
  'TARGET_PRICE_HIT',
  'STOP_LOSS_HIT',
] as const

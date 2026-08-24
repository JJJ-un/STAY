import { useNavigate } from 'react-router-dom'
import type { NotificationResponse, NotificationType } from '@/entities/notification'
import { formatUsd } from '@/shared/lib'

export interface NotificationTypeConfig {
  label: string
  badgeClassName: string
}

// 🛡️ 알림 유형별 스타일 설정 (완성형 단일 클래스)
export const NOTIFICATION_TYPE_CONFIGS: Record<NotificationType, NotificationTypeConfig> = {
  PATTERN_MATCHED: {
    label: 'STAY 다짐',
    badgeClassName: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
  },
  TARGET_PRICE_HIT: {
    label: '목표가 도달',
    badgeClassName: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
  },
  STOP_LOSS_HIT: {
    label: '손절가 도달',
    badgeClassName: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  },
}

export const DEFAULT_NOTIFICATION_CONFIG: NotificationTypeConfig = {
  label: '알림',
  badgeClassName: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

interface NotificationItemProps {
  item: NotificationResponse
  onItemClick?: (id: number) => void
}

export function NotificationItem({ item, onItemClick }: NotificationItemProps) {
  const navigate = useNavigate()
  const config = NOTIFICATION_TYPE_CONFIGS[item.type] ?? DEFAULT_NOTIFICATION_CONFIG

  const hasCurrentPrice = typeof item.currentPrice === 'number' && item.currentPrice > 0
  const hasTargetPrice = typeof item.targetPrice === 'number' && item.targetPrice > 0
  const hasPriceInfo = hasCurrentPrice || hasTargetPrice

  const handleClick = () => {
    onItemClick?.(item.notificationId)
    if (item.journalId) {
      navigate(`/journal/${item.journalId}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-xl transition-all cursor-pointer hover:bg-slate-50 active:scale-[0.99] flex flex-col space-y-2.5 ${
        item.isRead ? 'opacity-60 bg-slate-50/40' : 'opacity-100 bg-white shadow-xs'
      }`}
    >
      {/* 1. 상단 라인: 뱃지 + 티커 + 발생 일시 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!item.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
          )}

          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${config.badgeClassName}`}
          >
            {config.label}
          </span>

          <span className="text-xs font-bold text-slate-900 tracking-tight">
            {item.ticker}
          </span>
        </div>

        <span className="text-[11px] text-slate-400 font-medium tabular-nums">
          {item.createdAt ? item.createdAt.replace('T', ' ').slice(0, 16) : ''}
        </span>
      </div>

      {/* 2. 본문: 다짐 메시지 */}
      {item.stayMessage && (
        <p className="text-sm font-semibold text-slate-800 leading-snug">
          "{item.stayMessage}"
        </p>
      )}

      {/* 3. 하단 라인: 가격 정보 */}
      {hasPriceInfo && (
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          {hasCurrentPrice && (
            <span>
              당시 체결가: <strong className="text-slate-900 font-bold">{formatUsd(item.currentPrice)}</strong>
            </span>
          )}
          {hasTargetPrice && (
            <span>
              기준가: <strong className="text-slate-700 font-semibold">{formatUsd(item.targetPrice)}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

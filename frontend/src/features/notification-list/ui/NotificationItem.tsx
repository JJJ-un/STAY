import type { NotificationItemData } from '../model/types'

interface NotificationItemProps {
  item: NotificationItemData
  onItemClick?: (id: string) => void
}

export function NotificationItem({ item, onItemClick }: NotificationItemProps) {
  return (
    <div
      onClick={() => onItemClick?.(item.id)}
      className={`py-6 flex flex-col space-y-3 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50/60 ${
        item.isRead ? 'opacity-70' : 'opacity-100'
      }`}
    >
      {/* 1. 상단 라인: 뱃지 및 생성 날짜/시간 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 읽지 않음 표식 인디케이터 점 */}
          {!item.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
          )}

          {/* 알림 카테고리 뱃지 */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${item.badgeBgColor} ${item.badgeTextColor}`}
          >
            {item.badgeLabel}
          </span>
        </div>

        {/* 날짜 / 시간 */}
        <span className="text-xs text-slate-400 font-medium tabular-nums">
          {item.createdAt}
        </span>
      </div>

      {/* 2. 본문: 알림 메시지 */}
      <p className="text-sm font-medium text-slate-800 leading-relaxed pl-0.5">
        {item.message}
      </p>
    </div>
  )
}

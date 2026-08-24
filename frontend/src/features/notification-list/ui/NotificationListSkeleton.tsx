import { Skeleton } from '@/shared/ui'

interface NotificationListSkeletonProps {
  count?: number
}

export function NotificationListSkeleton({ count = 6 }: NotificationListSkeletonProps) {
  return (
    <div className="flex flex-col space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="p-4 rounded-xl bg-slate-50/50 flex flex-col space-y-2.5">
          {/* 상단: 뱃지 + 날짜 */}
          <div className="flex items-center justify-between">
            <Skeleton className="w-20 h-5 rounded-full" />
            <Skeleton className="w-14 h-3.5 rounded-md" />
          </div>

          {/* 본문: 알림 메시지 2줄 */}
          <Skeleton className="w-3/4 h-4 rounded-md" />
          <Skeleton className="w-1/2 h-3.5 rounded-md" />
        </div>
      ))}
    </div>
  )
}

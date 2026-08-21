import { Skeleton } from '@/shared/ui'

interface StockListSkeletonProps {
  count?: number
}

/**
 * 종목 목록 로딩 스켈레톤 컴포넌트
 * - count에 따라 가변적으로 스켈레톤 카드 개수를 렌더링
 * - 메인 StockList의 가독성과 단일 책임을 지키기 위해 분리
 */
export function StockListSkeleton({ count = 8 }: StockListSkeletonProps) {
  const items = Array.from({ length: count }, (_, index) => index)

  return (
    <div className="space-y-2.5 scrollbar-none">
      {items.map((idx) => (
        <div
          key={idx}
          className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <Skeleton className="w-5 h-5 rounded-md" />
            <div className="space-y-1.5">
              <Skeleton className="w-28 h-4 rounded-md" />
              <Skeleton className="w-12 h-3 rounded-md" />
            </div>
          </div>
          <div className="space-y-1.5 text-right">
            <Skeleton className="w-16 h-4 rounded-md ml-auto" />
            <Skeleton className="w-12 h-3 rounded-md ml-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}

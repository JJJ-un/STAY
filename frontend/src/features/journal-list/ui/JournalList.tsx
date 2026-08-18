import { LogIn, Plus } from 'lucide-react'
import type { JournalListItemData, JournalFilterType } from '../model/types'
import { useJournalListQuery } from '../api/useJournalListQuery'
import { JournalCard } from './JournalCard'

export type { JournalFilterType }

interface JournalListProps {
  filter?: JournalFilterType
  onCardClick?: (id: string) => void
  onWriteClick?: () => void
  onLoginClick?: () => void
}

export function JournalList({
  filter = 'ALL',
  onCardClick,
  onWriteClick,
  onLoginClick,
}: JournalListProps) {
  // 실제 백엔드 API 연동 훅
  const { journals, isLoading, error, refetch } = useJournalListQuery({ filter })

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  const isLoggedIn = !!token

  // 1. 로딩 상태 스켈레톤 UI (회색선 없이 부드러운 펄스 카드)
  if (isLoading) {
    return (
      <div className="space-y-4 scrollbar-none">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="bg-slate-50 rounded-2xl p-5 space-y-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-6 bg-slate-200 rounded-full" />
                <div className="space-y-1.5">
                  <div className="w-24 h-4 bg-slate-200 rounded-md" />
                  <div className="w-12 h-3 bg-slate-200 rounded-md" />
                </div>
              </div>
              <div className="w-20 h-3 bg-slate-200 rounded-md" />
            </div>
            <div className="w-full h-12 bg-slate-200/60 rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  // 2. 비로그인 상태일 때의 안내 화면
  if (!isLoggedIn) {
    return (
      <div className="bg-slate-50 rounded-3xl p-8 text-center space-y-4 my-4 scrollbar-none">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
          <LogIn className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900">
            로그인 후 내 주식일지를 확인하세요
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            나만의 매매 사실과 원칙, STAY 다짐을 안전하게 기록하고 모아볼 수 있습니다.
          </p>
        </div>
        {onLoginClick && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onLoginClick}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs font-bold rounded-2xl transition-all shadow-md cursor-pointer"
            >
              로그인하러 가기
            </button>
          </div>
        )}
      </div>
    )
  }

  // 3. 에러 발생 시의 재시도 화면
  if (error) {
    return (
      <div className="bg-slate-50 rounded-3xl p-8 text-center space-y-3 my-4 scrollbar-none">
        <p className="text-xs font-semibold text-slate-600">{error}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          다시 불러오기
        </button>
      </div>
    )
  }

  // 4. 작성된 주식일지가 없을 때의 빈 화면 (Empty State)
  if (journals.length === 0) {
    return (
      <div className="bg-slate-50 rounded-3xl p-8 text-center space-y-3.5 my-4 scrollbar-none">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900">
            {filter === 'ALL'
              ? '아직 작성된 주식일지가 없습니다'
              : '해당 유형의 주식일지가 없습니다'}
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            오늘의 매매 사실과 원칙, STAY 다짐을 첫 일지로 기록해 보세요.
          </p>
        </div>

        {onWriteClick && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onWriteClick}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>첫 주식일지 작성하기</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  // 5. 실제 주식일지 카드 목록 렌더링
  return (
    <div className="space-y-4 scrollbar-none">
      {journals.map((item: JournalListItemData) => (
        <JournalCard key={item.id} item={item} onCardClick={onCardClick} />
      ))}
    </div>
  )
}

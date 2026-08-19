import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckSquare, ShieldAlert, Target, Loader2, Edit3, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { journalApi, useJournalDetailQuery, type EmotionType, type TradeType, type ChecklistResponse } from '@/entities/journal'
import { Toast, useToast } from '@/shared/ui'

// 감정 라벨 매핑
const EMOTION_LABEL_MAP: Record<EmotionType, string> = {
  CONFIDENCE: '자신감',
  FOMO: '조급함/FOMO',
  PANIC: '불안/공포',
  GREED: '욕심/탐욕',
  NONE: '평온/냉정',
}

const TRADE_TYPE_COLOR_MAP: Record<TradeType, { bg: string; text: string; label: string }> = {
  BUY: { bg: 'bg-red-50', text: 'text-red-600', label: '매수' },
  SELL: { bg: 'bg-blue-50', text: 'text-blue-600', label: '매도' },
  WATCH: { bg: 'bg-slate-200/80', text: 'text-slate-800', label: '관망' },
}

export function JournalDetailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const journalId = searchParams.get('id')
  const { toastState, showToast } = useToast()

  const [isDeleting, setIsDeleting] = useState(false)

  // TanStack Query 기반 일지 상세 캐싱 훅
  const { data: journal, isLoading, isError } = useJournalDetailQuery(journalId || undefined)

  // 수정 페이지로 이동
  const handleEdit = () => {
    if (journalId) {
      navigate(`/journal/write?editId=${journalId}`)
    }
  }

  // 삭제 처리
  const handleDelete = async () => {
    if (!journalId || isDeleting) return
    if (!window.confirm('정말로 이 주식일지를 삭제하시겠습니까?')) return

    setIsDeleting(true)
    try {
      await journalApi.deleteJournal(journalId)
      // 일지 목록 및 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['journals'] })
      showToast('주식일지가 삭제되었습니다.', 'info')
      setTimeout(() => {
        navigate('/journal', { replace: true })
      }, 500)
    } catch (err) {
      console.error('일지 삭제 실패:', err)
      showToast('일지 삭제에 실패했습니다. 다시 시도해 주세요.', 'error')
      setIsDeleting(false)
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">일지 불러오는 중...</p>
      </div>
    )
  }

  // 에러 상태
  if (isError || !journal) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[50vh]">
        <p className="text-sm font-bold text-slate-800">일지를 찾을 수 없습니다.</p>
        <button
          type="button"
          onClick={() => navigate('/journal')}
          className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer"
        >
          일지 목록으로 돌아가기
        </button>
      </div>
    )
  }

  const stockName = journal.stock?.name || '종목명'
  const stockTicker = journal.stock?.ticker || ''
  const tradeType = (journal.tradeType || 'BUY') as TradeType
  const tradeTypeInfo = TRADE_TYPE_COLOR_MAP[tradeType] || TRADE_TYPE_COLOR_MAP.BUY

  const price = journal.price || 0
  const quantity = journal.quantity || 0
  const totalPrice = journal.totalPrice || price * quantity
  const currencySymbol = journal.currency === 'KRW' ? '원' : '$'

  const targetPrice = journal.targetPrice || 0
  const stopLossPrice = journal.stopLossPrice || 0

  const emotion = (journal.emotion || 'CONFIDENCE') as EmotionType
  const emotionLabel = EMOTION_LABEL_MAP[emotion] || '자신감'

  // 날짜 포맷
  let formattedDate = journal.tradeDateTime || ''
  if (formattedDate.includes('T')) {
    const [datePart, timePart] = formattedDate.split('T')
    const cleanTime = timePart?.slice(0, 5) || ''
    formattedDate = `${datePart.replace(/-/g, '.')} ${cleanTime}`
  }

  return (
    <div className="flex-1 p-4 pb-20 space-y-5 bg-white scrollbar-none relative">
      <Toast
        message={toastState.message}
        type={toastState.type}
        isVisible={toastState.isVisible}
      />

      {/* 1. 상단: 종목 정보 & 매매 유형 뱃지 */}
      <div className="bg-slate-50 rounded-3xl p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${tradeTypeInfo.bg} ${tradeTypeInfo.text}`}
            >
              {tradeTypeInfo.label}
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                {stockName}
              </h2>
              {stockTicker && (
                <span className="text-[11px] font-semibold text-slate-400 mt-0.5 block">
                  {stockTicker}
                </span>
              )}
            </div>
          </div>

          <span className="text-xs font-medium text-slate-400 tabular-nums">
            {formattedDate}
          </span>
        </div>

        {/* 매매 수치 데이터 요약 */}
        <div className="bg-white rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {price.toLocaleString()} {currencySymbol} · {quantity.toLocaleString()}주
            </span>
            <span className="text-base font-black text-slate-900 tabular-nums">
              {totalPrice.toLocaleString()} {currencySymbol}
            </span>
          </div>

          {(targetPrice > 0 || stopLossPrice > 0) && (
            <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-slate-600">
              {targetPrice > 0 && (
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-red-500" />
                  <span>목표가 <strong className="text-red-500 font-bold">{targetPrice.toLocaleString()}{currencySymbol}</strong></span>
                </div>
              )}
              {stopLossPrice > 0 && (
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  <span>손절가 <strong className="text-blue-600 font-bold">{stopLossPrice.toLocaleString()}{currencySymbol}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. 원칙 체크리스트 */}
      {journal.checklists && journal.checklists.length > 0 && (
        <div className="bg-slate-50 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-900">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-black text-slate-900">매수 전 원칙 체크리스트</h3>
          </div>
          <div className="space-y-2">
            {journal.checklists.map((c: ChecklistResponse) => (
              <div
                key={c.checklistId}
                className="bg-white p-3.5 rounded-2xl flex items-center gap-2.5 text-xs"
              >
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center ${
                    c.isChecked ? 'bg-blue-600 text-white' : 'bg-slate-200 text-transparent'
                  }`}
                >
                  ✓
                </div>
                <span className={`font-semibold ${c.isChecked ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                  {c.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 심리 상태 & STAY 다짐 메시지 */}
      <div className="bg-slate-50 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">매매 당시 심리 상태</span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
            {emotionLabel}
          </span>
        </div>

        {journal.reasonMemo && (
          <div className="bg-white rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-400">매매 근거 메모</span>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">
              {journal.reasonMemo}
            </p>
          </div>
        )}

        <div className="bg-blue-600 text-white rounded-2xl p-4 space-y-1.5 shadow-md">
          <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">
            STAY 다짐 메시지
          </span>
          <p className="text-xs font-bold leading-relaxed">
            "{journal.stayMessage}"
          </p>
        </div>
      </div>

      {/* 4. 하단 수정 및 삭제 버튼 영역 */}
      <div className="pt-3 pb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleEdit}
          className="flex-1 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>수정하기</span>
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="py-3.5 px-4 bg-rose-50 hover:bg-rose-100 active:scale-[0.99] text-rose-600 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          <span>삭제</span>
        </button>
      </div>
    </div>
  )
}

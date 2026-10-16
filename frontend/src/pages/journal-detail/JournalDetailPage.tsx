import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, Loader2, Edit3, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { journalApi, useJournalDetailQuery, type CurrencyType, type EmotionType, type HoldingPeriod, type TradeType } from '@/entities/journal'
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

const HOLDING_PERIOD_LABELS: Record<HoldingPeriod, string> = {
  SHORT: '단기 · 1일~1주',
  MEDIUM: '중기 · 1주~1개월',
  LONG: '장기 · 1개월 이상',
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function formatMoney(value: number | null | undefined, currency: CurrencyType): string {
  if (!isPositiveNumber(value)) return '미기록'
  return new Intl.NumberFormat(currency === 'KRW' ? 'ko-KR' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
    maximumFractionDigits: 4,
  }).format(value)
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
        <p className="text-body text-slate-500">일지 불러오는 중...</p>
      </div>
    )
  }

  // 에러 상태
  if (isError || !journal) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[50vh]">
        <p className="text-body text-slate-800">일지를 찾을 수 없습니다.</p>
        <button
          type="button"
          onClick={() => navigate('/journal')}
          className="text-action px-5 py-2.5 bg-slate-900 text-white rounded-2xl shadow-md cursor-pointer"
        >
          일지 목록으로 돌아가기
        </button>
      </div>
    )
  }

  const stockName = journal.stock?.name || '종목명 미기록'
  const stockTicker = journal.stock?.ticker || ''
  const tradeTypeInfo = TRADE_TYPE_COLOR_MAP[journal.tradeType]
  const isWatch = journal.tradeType === 'WATCH'
  const emotionLabel = journal.emotion ? EMOTION_LABEL_MAP[journal.emotion] : '미기록'
  const checklists = journal.checklists || []
  const checkedCount = checklists.filter((item) => item.isChecked).length

  const tradeMetrics = isWatch
    ? [{ label: '참고 시세', value: formatMoney(journal.price, journal.currency) }]
    : [
        { label: '체결가', value: formatMoney(journal.price, journal.currency) },
        {
          label: '수량',
          value: isPositiveNumber(journal.quantity)
            ? `${new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 4 }).format(journal.quantity)}주`
            : '미기록',
        },
      ]
  const ruleMetrics = [
    isPositiveNumber(journal.targetPrice)
      ? { label: '목표가', value: formatMoney(journal.targetPrice, journal.currency) }
      : null,
    isPositiveNumber(journal.stopLossPrice)
      ? { label: '손절가', value: formatMoney(journal.stopLossPrice, journal.currency) }
      : null,
    journal.holdingPeriod
      ? { label: '목표 보유 기간', value: HOLDING_PERIOD_LABELS[journal.holdingPeriod] }
      : null,
  ].filter((metric) => metric !== null)
  const formattedDate = journal.tradeDateTime
    ? journal.tradeDateTime.replace('T', ' ').slice(0, 16).replace(/-/g, '.')
    : '일시 미기록'

  return (
    <div className="flex-1 p-4 pb-6 space-y-6 bg-white relative">
      <Toast
        message={toastState.message}
        type={toastState.type}
        isVisible={toastState.isVisible}
      />

      <section className="rounded-2xl bg-slate-50 p-card space-y-4" aria-labelledby="journal-stock-heading">
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <h1 id="journal-stock-heading" className="text-page-title min-w-0 flex-1 break-words text-slate-900">
              {stockName}
            </h1>
            <span className={`text-badge mt-1 shrink-0 rounded-full px-2 py-0.5 ${tradeTypeInfo.bg} ${tradeTypeInfo.text}`}>
              {tradeTypeInfo.label}
            </span>
          </div>
          <p className="text-caption flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-500">
            {stockTicker && <span>{stockTicker}</span>}
            {stockTicker && <span aria-hidden="true">·</span>}
            <span>{isWatch ? '관망 기록' : '거래 일시'}</span>
            <time dateTime={journal.tradeDateTime || undefined} className="tabular-nums">{formattedDate}</time>
          </p>
        </div>

        <dl className={`grid gap-4 border-t border-slate-200/70 pt-4 ${isWatch ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {tradeMetrics.map((metric) => (
            <div key={metric.label} className="min-w-0 space-y-1">
              <dt className="text-caption text-slate-500">{metric.label}</dt>
              <dd className="text-price break-words text-slate-900 tabular-nums">{metric.value}</dd>
            </div>
          ))}
          {!isWatch && (
            <div className="col-span-2 flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-200/70 pt-3">
              <dt className="text-label text-slate-600">거래금액</dt>
              <dd className="text-price break-words text-slate-900 tabular-nums">
                {formatMoney(journal.totalPrice, journal.currency)}
              </dd>
            </div>
          )}
        </dl>
        {isWatch && <p className="text-caption text-slate-500">매매하지 않고 관찰한 기록입니다.</p>}
      </section>

      <section className="rounded-2xl bg-slate-50 p-card space-y-4" aria-labelledby="journal-reason-heading">
        <h2 id="journal-reason-heading" className="text-section-title text-slate-900">당시의 판단</h2>
        <dl>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-label text-slate-600">당시 감정</dt>
            <dd className="text-label text-slate-900">{emotionLabel}</dd>
          </div>
        </dl>
        <div className="space-y-2">
          <h3 className="text-label text-slate-600">{isWatch ? '관망 이유' : '매매 이유'}</h3>
          {journal.reasonMemo?.trim() ? (
            <p className="text-body break-words whitespace-pre-wrap text-slate-700">{journal.reasonMemo}</p>
          ) : (
            <p className="text-body text-slate-500">기록한 이유가 없습니다.</p>
          )}
        </div>
      </section>

      {ruleMetrics.length > 0 && (
        <section className="rounded-2xl bg-slate-50 p-card space-y-4" aria-labelledby="journal-rules-heading">
          <h2 id="journal-rules-heading" className="text-section-title text-slate-900">기록한 매매 기준</h2>
          <dl className="grid grid-cols-2 gap-4">
            {ruleMetrics.map((metric) => (
              <div key={metric.label} className="min-w-0 space-y-1">
                <dt className="text-caption text-slate-500">{metric.label}</dt>
                <dd className="text-label break-words text-slate-900 tabular-nums">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {checklists.length > 0 && (
        <section className="rounded-2xl bg-slate-50 p-card space-y-3" aria-labelledby="journal-checklist-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="journal-checklist-heading" className="text-section-title text-slate-900">원칙 준수 기록</h2>
            <span className="text-caption text-slate-500">{checkedCount}/{checklists.length} 항목 준수</span>
          </div>
          <ul className="divide-y divide-slate-200/70">
            {checklists.map((item) => (
              <li key={item.checklistId} className="flex items-start gap-3 py-3">
                {item.isChecked ? (
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                ) : (
                  <Circle className="mt-1 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                )}
                <p className="text-body min-w-0 flex-1 break-words text-slate-700">{item.content}</p>
                <span className={`text-caption mt-0.5 shrink-0 ${item.isChecked ? 'text-blue-600' : 'text-slate-500'}`}>
                  {item.isChecked ? '준수' : '미준수'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl bg-blue-600 p-card space-y-3 text-white" aria-labelledby="journal-commitment-heading">
        <h2 id="journal-commitment-heading" className="text-section-title">미래의 나에게</h2>
        <p className="text-body break-words whitespace-pre-wrap">
          {journal.stayMessage?.trim() ? journal.stayMessage : '아직 다짐 메시지를 남기지 않았습니다.'}
        </p>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleEdit}
          disabled={isDeleting}
          className="text-action flex-1 rounded-2xl bg-slate-900 px-4 py-3.5 text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer disabled:opacity-50"
        >
          <span className="flex items-center justify-center gap-2">
            <Edit3 className="h-4 w-4" aria-hidden="true" />
            일지 수정
          </span>
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-label flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 cursor-pointer disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          )}
          삭제
        </button>
      </div>
    </div>
  )
}

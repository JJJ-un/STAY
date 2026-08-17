import { TrendingUp, Edit3, ShieldAlert } from 'lucide-react'
import { StockChart } from '@/widgets/stock-chart'

interface StockDetailPageProps {
  stockId: string
  onNavigate?: (path: string) => void
}

export function StockDetailPage({ stockId, onNavigate }: StockDetailPageProps) {
  const handleWriteJournal = () => {
    if (onNavigate) {
      onNavigate(`/journal/write?stockId=${stockId}&stockName=${encodeURIComponent('엔비디아')}`)
    }
  }

  const handleJournalClick = (journalId: number) => {
    if (onNavigate) {
      onNavigate(`/journal/detail?id=${journalId}`)
    }
  }

  return (
    <div className="flex-1 p-4 space-y-5 bg-white">
      {/* 1. 상단 현재가 & 실시간 등락률 헤더 */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">NVIDIA</h1>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">NVDA</span>
        </div>
        <div className="flex items-baseline gap-2.5 pt-0.5">
          <span className="text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">$128.30</span>
          <div className="flex items-center text-xs font-bold tabular-nums text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
            <span>+$2.50 (+1.98%)</span>
          </div>
        </div>
      </div>

      {/* 2. [위젯 조립] 차트 & 타임라인 마커 뱃지 위젯 */}
      <StockChart onJournalClick={handleJournalClick} />

      {/* 3. 이 종목 나만의 매매 원칙 */}
      <div className="bg-slate-50/80 p-4 rounded-3xl space-y-3">
        <div className="flex items-center gap-1.5 text-blue-600">
          <ShieldAlert className="w-4 h-4" />
          <h2 className="text-xs font-black text-slate-900">엔비디아 나만의 원칙 체크</h2>
        </div>
        <ul className="space-y-2">
          {['목표가 $150 전까지 뇌동매도 금지', '3% 이상 급락 시 분할 매수로 접근'].map((rule, idx) => (
            <li key={idx} className="text-xs text-slate-700 bg-white p-3 rounded-2xl shadow-xs flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="font-semibold">{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 4. 하단 일지 작성 액션 버튼 */}
      <div className="pt-2 pb-6">
        <button
          type="button"
          onClick={handleWriteJournal}
          className="w-full py-4 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          엔비디아 주식일지 작성하기
        </button>
      </div>
    </div>
  )
}

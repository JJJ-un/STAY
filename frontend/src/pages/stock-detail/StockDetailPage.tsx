import { useState, useEffect } from 'react'
import { Edit3, ShieldAlert } from 'lucide-react'
import { StockHeader } from '@/widgets/stock-header'
import { StockChart } from '@/widgets/stock-chart'
import { getStockDetail, type StockResponse } from '@/entities/stock'

interface StockDetailPageProps {
  stockId: string
  onNavigate?: (path: string) => void
}

export function StockDetailPage({ stockId, onNavigate }: StockDetailPageProps) {
  const [stock, setStock] = useState<StockResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // 실제 백엔드 종목 상세 API 연동 (티커 기준 또는 기본 NVDA)
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    // stockId가 숫자 1 등인 경우 기본 NVDA, 문자열이면 해당 티커로 호출
    const targetTicker = (!stockId || stockId === '1') ? 'NVDA' : stockId

    getStockDetail(targetTicker)
      .then((data) => {
        if (isMounted) {
          setStock(data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('Failed to load stock detail from API, fallback to mock:', err)
        if (isMounted) {
          // 백엔드 미실행 시 안전한 기본 시세 세팅
          setStock({
            stockId: 1,
            name: '엔비디아',
            ticker: 'NVDA',
            currentPrice: 128.3,
            changePrice: 2.5,
            changeRate: 1.98,
            volume: 45120300,
            marketCap: 3150000000000,
          })
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [stockId])

  const handleWriteJournal = () => {
    if (onNavigate && stock) {
      onNavigate(`/journal/write?stockId=${stock.stockId}&stockName=${encodeURIComponent(stock.name)}`)
    }
  }

  const handleJournalClick = (journalId: number) => {
    if (onNavigate) {
      onNavigate(`/journal/detail?id=${journalId}`)
    }
  }

  return (
    <div className="flex-1 p-4 space-y-5 bg-white">
      {/* 1. [위젯 조립] 실제 API 연동된 종목 헤더 위젯 */}
      <StockHeader stock={stock} isLoading={isLoading} />

      {/* 2. [위젯 조립] 차트 & 타임라인 마커 뱃지 위젯 */}
      <StockChart onJournalClick={handleJournalClick} />

      {/* 3. 이 종목 나만의 매매 원칙 */}
      <div className="bg-slate-50/80 p-4 rounded-3xl space-y-3">
        <div className="flex items-center gap-1.5 text-blue-600">
          <ShieldAlert className="w-4 h-4" />
          <h2 className="text-xs font-black text-slate-900">
            {stock?.name || '종목'} 나만의 원칙 체크
          </h2>
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
          {stock?.name || '종목'} 주식일지 작성하기
        </button>
      </div>
    </div>
  )
}

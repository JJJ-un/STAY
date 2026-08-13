import { useState } from 'react'
import { TrendingUp, TrendingDown, Edit3, ShieldAlert, Bookmark } from 'lucide-react'
import { Tabs, type TabItem } from '@/shared/ui'

type TimeFrameType = '1D' | '1W' | '1M' | '1Y'

const TIME_FRAME_ITEMS: TabItem<TimeFrameType>[] = [
  { id: '1D', label: '1D' },
  { id: '1W', label: '1W' },
  { id: '1M', label: '1M' },
  { id: '1Y', label: '1Y' },
]

interface StockDetailPageProps {
  stockId: string
  onNavigate?: (path: string) => void
}

interface StockDetailMock {
  id: string
  name: string
  code: string
  price: string
  changePrice: string
  changeRate: string
  isUp: boolean
  myAveragePrice: string
  myQuantity: string
  myProfitRate: string
  myProfitAmount: string
  personalCommitments: string[]
  chartData: number[]
}

const MOCK_STOCK_DETAILS: Record<string, StockDetailMock> = {
  '1': {
    id: '1',
    name: '삼성전자',
    code: '005930',
    price: '71,500원',
    changePrice: '-1,700원',
    changeRate: '-2.3%',
    isUp: false,
    myAveragePrice: '68,400원',
    myQuantity: '150주',
    myProfitRate: '+4.53%',
    myProfitAmount: '+465,000원',
    personalCommitments: [
      '3% 이상 급락 시 투매 금지, 3일 관망 후 분할 매수',
      '목표가 80,000원 달성 시 30% 익절 룰 준수',
      '뇌동매매 금지 - 뉴스 직후 15분 대기',
    ],
    chartData: [69800, 70200, 71000, 72500, 73200, 72000, 71500],
  },
  '2': {
    id: '2',
    name: 'SK하이닉스',
    code: '000660',
    price: '192,000원',
    changePrice: '+3,400원',
    changeRate: '+1.8%',
    isUp: true,
    myAveragePrice: '175,000원',
    myQuantity: '40주',
    myProfitRate: '+9.71%',
    myProfitAmount: '+680,000원',
    personalCommitments: [
      '신고가 갱신 시 추격 매수 금지, 눌림목 대기',
      '5일선 이탈 시 20% 비중 축소 원칙',
    ],
    chartData: [180000, 182000, 185000, 184000, 189000, 190000, 192000],
  },
}

const DEFAULT_DETAIL: StockDetailMock = {
  id: '0',
  name: '종목 상세',
  code: '000000',
  price: '100,000원',
  changePrice: '+1,000원',
  changeRate: '+1.0%',
  isUp: true,
  myAveragePrice: '95,000원',
  myQuantity: '10주',
  myProfitRate: '+5.26%',
  myProfitAmount: '+50,000원',
  personalCommitments: [
    '손절가 -5% 철저 준수',
    '분할 매수 3회로 분할하여 접근',
  ],
  chartData: [95000, 96000, 97500, 96800, 98000, 99500, 100000],
}

export function StockDetailPage({ stockId, onNavigate }: StockDetailPageProps) {
  const [timeFrame, setTimeFrame] = useState<'1D' | '1W' | '1M' | '1Y'>('1M')

  const stock = MOCK_STOCK_DETAILS[stockId] || {
    ...DEFAULT_DETAIL,
    id: stockId,
    name: stockId === '3' ? '한미반도체' : stockId === '4' ? '현대차' : '주식 종목',
  }

  const handleWriteJournal = () => {
    if (onNavigate) {
      onNavigate(`/journal/write?stockId=${stock.id}&stockName=${encodeURIComponent(stock.name)}`)
    }
  }

  const minVal = Math.min(...stock.chartData) * 0.98
  const maxVal = Math.max(...stock.chartData) * 1.02
  const svgWidth = 340
  const svgHeight = 140

  const points = stock.chartData
    .map((val, idx) => {
      const x = (idx / (stock.chartData.length - 1)) * svgWidth
      const y = svgHeight - ((val - minVal) / (maxVal - minVal)) * svgHeight
      return `${x},${y}`
    })
    .join(' ')

  const fillPoints = `${points} ${svgWidth},${svgHeight} 0,${svgHeight}`

  return (
    <div className="flex-1 p-4 space-y-6">
      {/* 현재가 & 등락률 정보 */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">{stock.price}</span>
          <div
            className={`flex items-center text-xs font-semibold tabular-nums ${stock.isUp ? 'text-red-500' : 'text-blue-600'
              }`}
          >
            {stock.isUp ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
            <span>{stock.changePrice} ({stock.changeRate})</span>
          </div>
        </div>
        <p className="text-xs text-slate-400">오늘 장 마감 기준</p>
      </div>

      {/* 차트 영역 */}
      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-3">
        <Tabs<TimeFrameType>
          items={TIME_FRAME_ITEMS}
          activeId={timeFrame}
          onChange={setTimeFrame}
          variant="segmented"
          size="sm"
        />

        <div className="relative pt-2">
          <svg width="100%" height="140" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stock.isUp ? '#ef4444' : '#2563eb'} stopOpacity="0.25" />
                <stop offset="100%" stopColor={stock.isUp ? '#ef4444' : '#2563eb'} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polygon points={fillPoints} fill="url(#chartGradient)" />
            <polyline
              fill="none"
              stroke={stock.isUp ? '#ef4444' : '#2563eb'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
      {/* 개인화 정보 2: 나만의 이 종목 매매 다짐 & 원칙 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-1.5 text-blue-600">
            <ShieldAlert className="w-4 h-4" />
            <h2 className="text-xs font-bold text-slate-900">이 종목 나만의 매매 원칙</h2>
          </div>
          <button type="button" className="text-xs font-medium text-slate-400 hover:text-slate-600 flex items-center gap-0.5">
            <Edit3 className="w-3 h-3" /> 수정
          </button>
        </div>

        <ul className="space-y-2">
          {stock.personalCommitments.map((rule, idx) => (
            <li key={idx} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="font-medium leading-relaxed">{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 일지 작성 액션 버튼 */}
      <div className="pt-2 pb-4">
        <button
          type="button"
          onClick={handleWriteJournal}
          className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          {stock.name} 주식일지 작성하기
        </button>
      </div>
    </div>
  )
}

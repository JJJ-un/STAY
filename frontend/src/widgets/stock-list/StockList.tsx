export type StockFilterType = 'RANK' | 'VOLUME' | 'RISING' | 'FALLING'

export interface StockItem {
  id: string
  rank: number
  name: string
  code: string
  market: 'KR' | 'US'
  price: string
  changeRate: string
  rateNum: number
  volumeNum: number
  isUp?: boolean
  isDown?: boolean
}

export const MOCK_STOCKS: StockItem[] = [
  {
    id: '1',
    rank: 1,
    name: '엔비디아 (NVIDIA)',
    code: 'NVDA',
    market: 'US',
    price: '$128.30',
    changeRate: '+1.98%',
    rateNum: 1.98,
    volumeNum: 45120300,
    isUp: true,
  },
  {
    id: '2',
    rank: 2,
    name: 'TSMC (Taiwan Semi)',
    code: 'TSM',
    market: 'US',
    price: '$174.50',
    changeRate: '+2.45%',
    rateNum: 2.45,
    volumeNum: 28400000,
    isUp: true,
  },
  {
    id: '3',
    rank: 3,
    name: 'AMD (Advanced Micro)',
    code: 'AMD',
    market: 'US',
    price: '$148.20',
    changeRate: '-1.15%',
    rateNum: -1.15,
    volumeNum: 31200000,
    isDown: true,
  },
  {
    id: '4',
    rank: 4,
    name: '브로드컴 (Broadcom)',
    code: 'AVGO',
    market: 'US',
    price: '$162.80',
    changeRate: '+0.85%',
    rateNum: 0.85,
    volumeNum: 18900000,
    isUp: true,
  },
  {
    id: '5',
    rank: 5,
    name: 'ASML (ASML Holding)',
    code: 'ASML',
    market: 'US',
    price: '$890.00',
    changeRate: '+1.20%',
    rateNum: 1.20,
    volumeNum: 9500000,
    isUp: true,
  },
  {
    id: '6',
    rank: 6,
    name: '퀄컴 (Qualcomm)',
    code: 'QCOM',
    market: 'US',
    price: '$168.40',
    changeRate: '-0.65%',
    rateNum: -0.65,
    volumeNum: 14200000,
    isDown: true,
  },
  {
    id: '7',
    rank: 7,
    name: '인텔 (Intel)',
    code: 'INTC',
    market: 'US',
    price: '$21.50',
    changeRate: '-2.80%',
    rateNum: -2.80,
    volumeNum: 52100000,
    isDown: true,
  },
  {
    id: '8',
    rank: 8,
    name: '마이크론 (Micron)',
    code: 'MU',
    market: 'US',
    price: '$105.60',
    changeRate: '+3.10%',
    rateNum: 3.10,
    volumeNum: 22800000,
    isUp: true,
  },
]

interface StockListProps {
  filter?: StockFilterType
  showRank?: boolean
  onSelectStock?: (ticker: string) => void
}

export function StockList({
  filter = 'RANK',
  showRank = true,
  onSelectStock,
}: StockListProps) {
  // 필터 정렬 로직
  const sortedStocks = [...MOCK_STOCKS].sort((a, b) => {
    if (filter === 'RANK') {
      return a.rank - b.rank
    }
    if (filter === 'VOLUME') {
      return b.volumeNum - a.volumeNum
    }
    if (filter === 'RISING') {
      return b.rateNum - a.rateNum
    }
    if (filter === 'FALLING') {
      return a.rateNum - b.rateNum
    }
    return 0
  })

  return (
    <div className="bg-white rounded-xl">
      {sortedStocks.map((stock, idx) => (
        <div
          key={stock.id}
          onClick={() => onSelectStock?.(stock.code)}
          className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100"
        >
          {/* 종목 좌측 순위 및 종목명/티커 */}
          <div className="flex items-center gap-3">
            {showRank && (
              <span
                className={`text-sm font-bold w-4 text-center tabular-nums ${
                  idx < 3 ? 'text-blue-600 font-extrabold' : 'text-slate-400 font-medium'
                }`}
              >
                {idx + 1}
              </span>
            )}

            <div>
              <div className="text-sm font-semibold text-slate-800">
                {stock.name}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{stock.code}</div>
            </div>
          </div>

          {/* 우측 현재가 및 등락률 */}
          <div className="text-right">
            <div className="text-sm font-bold text-slate-900 tabular-nums">
              {stock.price}
            </div>
            <div
              className={`text-xs font-medium tabular-nums ${
                stock.isDown
                  ? 'text-blue-600'
                  : stock.isUp
                  ? 'text-red-500'
                  : 'text-slate-400'
              }`}
            >
              {stock.changeRate}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

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
    name: '삼성전자',
    code: '005930',
    market: 'KR',
    price: '71,500원',
    changeRate: '-2.3%',
    rateNum: -2.3,
    volumeNum: 14500000,
    isDown: true,
  },
  {
    id: '2',
    rank: 2,
    name: 'SK하이닉스',
    code: '000660',
    market: 'KR',
    price: '192,000원',
    changeRate: '+1.8%',
    rateNum: 1.8,
    volumeNum: 8200000,
    isUp: true,
  },
  {
    id: '3',
    rank: 3,
    name: 'NVIDIA (엔비디아)',
    code: 'NVDA',
    market: 'US',
    price: '$128.50',
    changeRate: '+3.4%',
    rateNum: 3.4,
    volumeNum: 12000000,
    isUp: true,
  },
  {
    id: '4',
    rank: 4,
    name: 'Tesla (테슬라)',
    code: 'TSLA',
    market: 'US',
    price: '$198.70',
    changeRate: '+4.2%',
    rateNum: 4.2,
    volumeNum: 11000000,
    isUp: true,
  },
  {
    id: '5',
    rank: 5,
    name: 'Apple Inc. (애플)',
    code: 'AAPL',
    market: 'US',
    price: '$224.20',
    changeRate: '-0.8%',
    rateNum: -0.8,
    volumeNum: 9500000,
    isDown: true,
  },
  {
    id: '6',
    rank: 6,
    name: '한미반도체',
    code: '042700',
    market: 'KR',
    price: '104,500원',
    changeRate: '0.0%',
    rateNum: 0.0,
    volumeNum: 3100000,
  },
  {
    id: '7',
    rank: 7,
    name: '현대차',
    code: '005380',
    market: 'KR',
    price: '245,000원',
    changeRate: '+0.6%',
    rateNum: 0.6,
    volumeNum: 2800000,
    isUp: true,
  },
  {
    id: '8',
    rank: 8,
    name: 'POSCO홀딩스',
    code: '005490',
    market: 'KR',
    price: '362,000원',
    changeRate: '-3.1%',
    rateNum: -3.1,
    volumeNum: 4200000,
    isDown: true,
  },
]

interface StockListProps {
  filter?: StockFilterType
  showRank?: boolean
  onSelectStock?: (stockId: string) => void
}

export function StockList({ filter = 'RANK', showRank = true, onSelectStock }: StockListProps) {
  // 탭 선택에 따른 실시간 정렬
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
          onClick={() => onSelectStock?.(stock.id)}
          className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100"
        >
          {/* 종목 좌측 순위 및 종목명/티커 */}
          <div className="flex items-center gap-3">
            {/* showRank가 true일 때만 순위 번호 노출 */}
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

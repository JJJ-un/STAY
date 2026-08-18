import { useState, useRef } from 'react'
import ArrowIcon from '@/shared/assets/arrow.svg?react'

interface CommitmentCardItem {
  id: string
  stockName: string
  tradeType: '매수' | '매도' | '리밸런싱'
  stayMessage: string
  emotionLabel: string
}

const MOCK_RECOMMENDATIONS: CommitmentCardItem[] = [
  {
    id: '1',
    stockName: '삼성전자',
    tradeType: '매수',
    stayMessage: '3% 이상 급락해도 당일 투매 금지! 손절가 터치 전까진 미련 없이 3일간 추이 관망한다.',
    emotionLabel: '확신/냉정',
  },
  {
    id: '2',
    stockName: 'SK하이닉스',
    tradeType: '매도',
    stayMessage: '목표가 달성 시 추격 매수하지 않고, 욕심 비우고 50% 분할 익절 수익 확정짓기.',
    emotionLabel: '탐욕 경계',
  },
  {
    id: '3',
    stockName: '한미반도체',
    tradeType: '매수',
    stayMessage: '찌라시 뉴스나 속보 이슈에 당일 뇌동매매 금지. 장 마감 후 이성적으로 팩트체크하기.',
    emotionLabel: '공포 극복',
  },
]

interface RecommendedCommitmentProps {
  onNavigate?: (path: string) => void
}

export function RecommendedCommitment({ onNavigate }: RecommendedCommitmentProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    if (clientWidth === 0) return

    const index = Math.round(scrollLeft / clientWidth)
    setActiveIndex(Math.min(Math.max(index, 0), MOCK_RECOMMENDATIONS.length - 1))
  }

  const handleTouchEnd = () => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current
    if (scrollLeft + clientWidth >= scrollWidth - 10) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
        setActiveIndex(0)
      }, 150)
    }
  }

  const handleCardClick = (id: string = 'j1') => {
    onNavigate?.(`/journal/detail?id=${id}`)
  }

  return (
    <section className="space-y-3">
      {/* 매끄러운 스냅 가로 스와이프 캐러셀 덱 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchEnd={handleTouchEnd}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-1"
      >
        {MOCK_RECOMMENDATIONS.map((item) => (
          <div
            key={item.id}
            onClick={() => handleCardClick(item.id)}
            className="flex-shrink-0 w-full snap-center bg-slate-50 hover:bg-slate-100/80 transition-colors rounded-2xl p-5 text-slate-900 flex flex-col justify-between cursor-pointer min-h-[168px]"
          >
            {/* 1. 상단: 종목명 & 매매유형 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{item.stockName}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.tradeType === '매수'
                      ? 'bg-red-50 text-red-600'
                      : item.tradeType === '매도'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.tradeType}
                </span>
              </div>
            </div>

            {/* 2. 중앙: STAY 다짐 메시지 */}
            <div className="my-2">
              <p className="text-sm font-semibold leading-relaxed text-slate-800 line-clamp-2">
                "{item.stayMessage}"
              </p>
            </div>

            {/* 3. 하단: 좌측 감정 상태 텍스트 칩 & 우측 arrow.svg 버튼 */}
            <div className="flex items-center justify-between pt-1">
              <div className="bg-slate-200/70 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700">
                <span>{item.emotionLabel}</span>
              </div>

              {/* arrow.svg 버튼 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCardClick()
                }}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 active:bg-slate-400 flex items-center justify-center transition-all group"
                aria-label="주식일지로 이동"
              >
                <ArrowIcon className="w-3.5 h-3.5 text-slate-900 fill-slate-900 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 동적 인디케이터 도트 */}
      <div className="flex justify-center items-center gap-1.5 pt-1">
        {MOCK_RECOMMENDATIONS.map((_, idx) => (
          <span
            key={idx}
            className={`transition-all duration-300 ${
              activeIndex === idx
                ? 'w-4 h-1.5 bg-slate-900 rounded-full'
                : 'w-1.5 h-1.5 bg-slate-300 rounded-full'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

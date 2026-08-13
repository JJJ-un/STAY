import { useState, useRef } from 'react'

interface CarouselCard {
  id: string
  title: string
  author: string
  badge: string
  gradient: string
}

const MOCK_CAROUSEL_ITEMS: CarouselCard[] = [
  {
    id: '1',
    title: '반도체 변동성 장세 3분봉 매매 기법',
    author: '@반도체고수',
    badge: '투자 전략',
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    id: '2',
    title: '뇌동매수 손절 라인 철저히 정하는 3가지 법',
    author: '@멘탈마스터',
    badge: '멘탈 관리',
    gradient: 'from-slate-800 to-slate-950',
  },
  {
    id: '3',
    title: '실적 발표 전후 리스크 관리 프레임워크',
    author: '@반도체원칙러',
    badge: '리스크 관리',
    gradient: 'from-blue-800 to-cyan-900',
  },
]

export function InsightCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    if (clientWidth === 0) return

    const index = Math.round(scrollLeft / clientWidth)
    setActiveIndex(Math.min(Math.max(index, 0), MOCK_CAROUSEL_ITEMS.length - 1))
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

  return (
    <section className="space-y-3">
      {/* 매끄러운 스냅 가로 스와이프 캐러셀 덱 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchEnd={handleTouchEnd}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-1"
      >
        {MOCK_CAROUSEL_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`flex-shrink-0 w-full snap-center h-44 rounded-2xl p-5 bg-gradient-to-br ${item.gradient} text-white flex flex-col justify-between shadow-sm cursor-pointer hover:opacity-95 transition-opacity`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm font-medium">
                {item.badge}
              </span>
              <span className="text-white/80 text-[11px]">
                {item.author}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold leading-snug line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-white/70 mt-2">
                자세히 보기 →
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 동적 인디케이터 도트 */}
      <div className="flex justify-center items-center gap-1.5 pt-1">
        {MOCK_CAROUSEL_ITEMS.map((_, idx) => (
          <span
            key={idx}
            className={`transition-all duration-300 ${activeIndex === idx
                ? 'w-4 h-1.5 bg-slate-900 rounded-full'
                : 'w-1.5 h-1.5 bg-slate-300 rounded-full'
              }`}
          />
        ))}
      </div>
    </section>
  )
}

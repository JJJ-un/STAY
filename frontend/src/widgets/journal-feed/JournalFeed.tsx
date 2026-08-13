import type { SharedJournalFeed } from '@/entities/journal'
import { SharedFeedItem } from '@/entities/journal'

const MOCK_SHARED_FEEDS: SharedJournalFeed[] = [
  {
    id: '101',
    author: '@반도체고수',
    stockName: 'SK하이닉스',
    category: '노하우',
    content: '급락 속보 떴을 때 30분 봉 거래량 터지기 전엔 절대로 조급하게 손절하지 않는 나만의 철칙.',
    likes: 42,
  },
  {
    id: '102',
    author: '@멘탈마스터',
    stockName: '삼성전자',
    category: '원칙',
    content: '목표 수익률 +15% 도달하면 항상 욕심 비우고 50% 분할 매도해서 수익을 확정 짓습니다.',
    likes: 28,
  },
  {
    id: '103',
    author: '@반도체원칙러',
    stockName: '한미반도체',
    category: '복기',
    content: '고점 추격 매수로 물린 경험 이후, 무조건 20일 이동평균선 눌림목에서만 1차 진입함.',
    likes: 19,
  },
  {
    id: '104',
    author: '@배당성장가',
    stockName: '현대차',
    category: '노하우',
    content: '분기 실적 발표 전 주가가 비이성적으로 폭등할 때는 전량 보유보다 일부 수익 실현.',
    likes: 35,
  },
  {
    id: '105',
    author: '@멘탈원칙파',
    stockName: 'NAVER',
    category: '원칙',
    content: '손절 라인 -5% 도달 시 어떤 변명도 대지 않고 즉시 기계적 손절 실행하기.',
    likes: 51,
  },
  {
    id: '106',
    author: '@가치투자자',
    stockName: '카카오',
    category: '복기',
    content: '바닥을 확인하지 않고 조급하게 물타기했다가 리스크가 커졌던 뇌동매매 복기.',
    likes: 14,
  },
  {
    id: '107',
    author: '@바이오전문',
    stockName: '셀트리온',
    category: '노하우',
    content: '임상 결과 관련 찌라시 뉴스가 떴을 때는 당일 장중 매수를 전면 금지함.',
    likes: 23,
  },
  {
    id: '108',
    author: '@2차전지러',
    stockName: 'LG에너지솔루션',
    category: '원칙',
    content: '원자재 가격 변동성 장세에서는 포트폴리오 비중을 최대 20%로 제한 관리.',
    likes: 31,
  },
]

export function JournalFeed() {
  return (
    <section className="space-y-3">
      <div className="sticky top-[44px] z-40 bg-white/95 backdrop-blur-md py-2.5 -mx-4 px-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">
          다른 투자자의 매매 원칙
        </h2>
      </div>

      <div className="space-y-3">
        {MOCK_SHARED_FEEDS.map((feed) => (
          <SharedFeedItem key={feed.id} item={feed} />
        ))}
      </div>
    </section>
  )
}

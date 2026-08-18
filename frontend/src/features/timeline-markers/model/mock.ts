import type { StockTimelineMarker } from '@/entities/stock'

export const ALL_MOCK_TIMELINE_MARKERS: StockTimelineMarker[] = [
  {
    date: '2026-08-17',
    displayDate: '08/17',
    rangeTags: ['DAY_1', 'WEEK_1', 'MONTH_3', 'YEAR_1', 'YEAR_5'],
    totalCount: 1,
    buyCount: 1,
    sellCount: 0,
    watchCount: 0,
    journals: [
      {
        journalId: 4,
        tradeType: 'BUY',
        emotion: 'CONFIDENCE',
        stayMessage: '전고점 돌파 확인 후 1차 분할 매수 진입!',
        tradeDateTime: '2026-08-17 10:15',
      },
    ],
  },
  {
    date: '2026-08-15',
    displayDate: '08/15',
    rangeTags: ['WEEK_1', 'MONTH_3', 'YEAR_1', 'YEAR_5'],
    totalCount: 2,
    buyCount: 0,
    sellCount: 0,
    watchCount: 2,
    journals: [
      {
        journalId: 2,
        tradeType: 'WATCH',
        emotion: 'FEAR',
        stayMessage: '지금 단기 과열 구간! 뇌동매수 꾹 참고 관망 유지.',
        tradeDateTime: '2026-08-15 11:20',
      },
      {
        journalId: 3,
        tradeType: 'WATCH',
        emotion: 'CALM',
        stayMessage: 'FOMC 발표 전까지 무리한 진입 금지.',
        tradeDateTime: '2026-08-15 15:00',
      },
    ],
  },
  {
    date: '2026-08-10',
    displayDate: '08/10',
    rangeTags: ['MONTH_3', 'YEAR_1', 'YEAR_5'],
    totalCount: 1,
    buyCount: 1,
    sellCount: 0,
    watchCount: 0,
    journals: [
      {
        journalId: 1,
        tradeType: 'BUY',
        emotion: 'CONFIDENCE',
        stayMessage: '목표가 $150 달성 전까지 절대 뇌동매도 금지!',
        tradeDateTime: '2026-08-10 10:30',
      },
    ],
  },
  {
    date: '2026-06-20',
    displayDate: '06/20',
    rangeTags: ['MONTH_3', 'YEAR_1', 'YEAR_5'],
    totalCount: 1,
    buyCount: 0,
    sellCount: 0,
    watchCount: 1,
    journals: [
      {
        journalId: 5,
        tradeType: 'WATCH',
        emotion: 'CALM',
        stayMessage: '실적 발표 전까지 포지션 홀딩 및 관망',
        tradeDateTime: '2026-06-20 14:00',
      },
    ],
  },
  {
    date: '2024-02-15',
    displayDate: '24/02',
    rangeTags: ['YEAR_1', 'YEAR_5'],
    totalCount: 1,
    buyCount: 1,
    sellCount: 0,
    watchCount: 0,
    journals: [
      {
        journalId: 6,
        tradeType: 'BUY',
        emotion: 'CONFIDENCE',
        stayMessage: 'AI 반도체 사이클 초입 분할 매수 시작',
        tradeDateTime: '2024-02-15 09:30',
      },
    ],
  },
]

import type { TabItem } from '@/shared/ui'
import type { ChartRangeType, StockTimelineMarker } from '@/entities/stock'
import type { Time, UTCTimestamp } from 'lightweight-charts'

export const CHART_RANGE_ITEMS: TabItem<ChartRangeType>[] = [
  { id: 'DAY_1', label: '1일' },
  { id: 'WEEK_1', label: '1주' },
  { id: 'MONTH_3', label: '3개월' },
  { id: 'YEAR_1', label: '1년' },
  { id: 'YEAR_5', label: '5년' },
]

/**
 * 5분봉(초단위 Unix timestamp)과 일/주/월봉(YYYY-MM-DD 문자열)을
 * lightweight-charts 표준 Time 포맷으로 안전하게 변환하는 범용 유틸리티
 */
export function toChartTime(timeStr: string, isMinute: boolean): Time {
  if (isMinute) {
    // 5분봉(DAY_1): 초 단위 Unix 타임스탬프로 변환 (숫자)
    const normalized = timeStr.includes('T') ? timeStr : timeStr.replace(' ', 'T')
    const timestamp = Math.floor(new Date(normalized).getTime() / 1000)
    return (isNaN(timestamp) ? Math.floor(Date.now() / 1000) : timestamp) as UTCTimestamp
  }
  // 일/주/월봉: 'YYYY-MM-DD' 10자리 문자열로 정규화
  return timeStr.slice(0, 10) as Time
}

// 탭별 시세 모의 데이터
export const MOCK_CHART_SERIES: Record<ChartRangeType, { time: Time; value: number }[]> = {
  DAY_1: [
    { time: toChartTime('2026-08-17 09:30:00', true), value: 126.5 },
    { time: toChartTime('2026-08-17 10:30:00', true), value: 127.0 },
    { time: toChartTime('2026-08-17 11:30:00', true), value: 126.8 },
    { time: toChartTime('2026-08-17 12:30:00', true), value: 127.5 },
    { time: toChartTime('2026-08-17 13:30:00', true), value: 128.0 },
    { time: toChartTime('2026-08-17 14:30:00', true), value: 127.8 },
    { time: toChartTime('2026-08-17 15:30:00', true), value: 128.3 },
  ],
  WEEK_1: [
    { time: toChartTime('2026-08-11', false), value: 122.0 },
    { time: toChartTime('2026-08-12', false), value: 123.5 },
    { time: toChartTime('2026-08-13', false), value: 125.0 },
    { time: toChartTime('2026-08-14', false), value: 124.2 },
    { time: toChartTime('2026-08-17', false), value: 128.3 },
  ],
  MONTH_3: [
    { time: toChartTime('2026-06-01', false), value: 115.0 },
    { time: toChartTime('2026-06-15', false), value: 118.2 },
    { time: toChartTime('2026-07-01', false), value: 114.0 },
    { time: toChartTime('2026-07-15', false), value: 120.5 },
    { time: toChartTime('2026-08-01', false), value: 122.0 },
    { time: toChartTime('2026-08-10', false), value: 125.0 },
    { time: toChartTime('2026-08-17', false), value: 128.3 },
  ],
  YEAR_1: [
    { time: toChartTime('2023-08-01', false), value: 85.0 },
    { time: toChartTime('2023-11-01', false), value: 92.0 },
    { time: toChartTime('2024-02-01', false), value: 105.0 },
    { time: toChartTime('2024-04-01', false), value: 112.0 },
    { time: toChartTime('2024-06-01', false), value: 120.0 },
    { time: toChartTime('2024-08-17', false), value: 128.3 },
  ],
  YEAR_5: [
    { time: toChartTime('2020-01-01', false), value: 25.0 },
    { time: toChartTime('2021-01-01', false), value: 40.0 },
    { time: toChartTime('2022-01-01', false), value: 60.0 },
    { time: toChartTime('2023-01-01', false), value: 95.0 },
    { time: toChartTime('2024-08-17', false), value: 128.3 },
  ],
}

// 전체 기간 모의 타임라인 마커 데이터
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

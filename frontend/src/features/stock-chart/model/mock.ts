import type { TabItem } from '@/shared/ui'
import type { ChartRangeType } from '@/entities/stock'
import type { Time, UTCTimestamp } from 'lightweight-charts'

export const CHART_RANGE_ITEMS: TabItem<ChartRangeType>[] = [
  { id: 'DAY_1', label: '1일' },
  { id: 'WEEK_1', label: '1주' },
  { id: 'MONTH_3', label: '3개월' },
  { id: 'YEAR_1', label: '1년' },
  { id: 'YEAR_5', label: '5년' },
]

export function toChartTime(timeStr: string, isMinute: boolean): Time {
  if (isMinute) {
    const normalized = timeStr.includes('T') ? timeStr : timeStr.replace(' ', 'T')
    const timestamp = Math.floor(new Date(normalized).getTime() / 1000)
    return (isNaN(timestamp) ? Math.floor(Date.now() / 1000) : timestamp) as UTCTimestamp
  }
  return timeStr.slice(0, 10) as Time
}

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

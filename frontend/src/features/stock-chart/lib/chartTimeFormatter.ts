/**
 * Lightweight-Charts의 다양한 Time 포맷(Unix Timestamp 초단위 정수, BusinessDay 객체, 문자열)을
 * 일지 작성 및 화면 표시용 표준 날짜/시간 문자열(YYYY-MM-DD HH:mm 또는 YYYY-MM-DD)로 변환하는 순수 유틸
 */
export function formatChartTimeToString(rawTime: unknown): string {
  if (typeof rawTime === 'number') {
    // 5분봉 등 Unix Timestamp (초 단위 숫자) -> YYYY-MM-DD HH:mm
    const date = new Date(rawTime * 1000)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const mins = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${mins}`
  }

  if (typeof rawTime === 'object' && rawTime !== null) {
    // BusinessDay 객체 ({ year, month, day }) -> YYYY-MM-DD
    const bDay = rawTime as { year: number; month: number; day: number }
    const month = String(bDay.month).padStart(2, '0')
    const day = String(bDay.day).padStart(2, '0')
    return `${bDay.year}-${month}-${day}`
  }

  return rawTime ? String(rawTime) : ''
}

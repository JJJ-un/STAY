import { useState, useEffect, useRef } from 'react'

/**
 * 실시간 주가 변동 시 0.5초 동안 깜빡임(펄스) 상태를 관리하는 전용 애니메이션 훅
 * - 컴포넌트의 UI 렌더링 로직과 애니메이션 타이머 상태를 완벽히 분리 (SRP 준수)
 * - 최초 마운트 시에는 깜빡이지 않고, 실제 가격 숫자가 변했을 때만 500ms 동안 true 유지
 */
export function useStockPriceFlash(currentPrice: number, duration = 500): boolean {
  const [isFlashing, setIsFlashing] = useState(false)
  const prevPriceRef = useRef(currentPrice)

  useEffect(() => {
    // 최초 진입이 아니고 실제 가격이 이전과 다를 때만 펄스 발동
    if (prevPriceRef.current !== currentPrice && prevPriceRef.current !== 0) {
      setIsFlashing(true)
      const timer = setTimeout(() => {
        setIsFlashing(false)
      }, duration)

      prevPriceRef.current = currentPrice
      return () => clearTimeout(timer)
    }

    prevPriceRef.current = currentPrice
  }, [currentPrice, duration])

  return isFlashing
}

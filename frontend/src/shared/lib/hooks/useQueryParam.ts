import { useSearchParams } from 'react-router-dom'

export interface SetQueryParamOptions {
  replace?: boolean
  cleanupKeys?: string[]
}

/**
 * URL 쿼리 파라미터를 안전하게 읽고 쓰는 제네릭 훅
 * - 기본값과 동일할 경우 URL 파라미터를 자동으로 삭제하여 깔끔한 URL 유지
 * - cleanupKeys 옵션을 통해 탭 전환 시 미사용 유령 파라미터 자동 청소
 *
 * @param key 쿼리스트링 키 (예: 'tab', 'sort')
 * @param defaultValue 기본값 (URL에 없거나 유효하지 않을 때 적용)
 * @param validValues 유효한 값 목록 (옵셔널 - 타입 검증 및 잘못된 값 필터링용)
 */
export function useQueryParam<T extends string>(
  key: string,
  defaultValue: T,
  validValues?: readonly T[]
) {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawValue = searchParams.get(key)
  const value: T = validValues
    ? (validValues.includes(rawValue as T) ? (rawValue as T) : defaultValue)
    : ((rawValue as T) || defaultValue)

  const setValue = (newValue: T, options?: SetQueryParamOptions) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (newValue === defaultValue) {
          next.delete(key)
        } else {
          next.set(key, newValue)
        }

        if (options?.cleanupKeys) {
          options.cleanupKeys.forEach((cleanupKey) => next.delete(cleanupKey))
        }

        return next
      },
      { replace: options?.replace ?? true }
    )
  }

  return [value, setValue] as const
}

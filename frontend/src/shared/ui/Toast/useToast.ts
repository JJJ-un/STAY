import { useState, useCallback, useRef } from 'react'
import type { ToastType } from './Toast'

interface ToastState {
  message: string
  type: ToastType
  isVisible: boolean
}

export function useToast() {
  const [toastState, setToastState] = useState<ToastState>({
    message: '',
    type: 'error',
    isVisible: false,
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'error', durationMs: number = 2500) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setToastState({
      message,
      type,
      isVisible: true,
    })

    timerRef.current = setTimeout(() => {
      setToastState((prev) => ({ ...prev, isVisible: false }))
    }, durationMs)
  }, [])

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setToastState((prev) => ({ ...prev, isVisible: false }))
  }, [])

  return {
    toastState,
    showToast,
    hideToast,
  }
}

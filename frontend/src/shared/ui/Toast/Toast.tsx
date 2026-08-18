import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

export type ToastType = 'info' | 'success' | 'error'

export interface ToastProps {
  message: string
  type?: ToastType
  isVisible: boolean
}

/**
 * 모바일 최적화 플로팅 토스트 컴포넌트 (회색선 미사용)
 */
export function Toast({ message, type = 'error', isVisible }: ToastProps) {
  if (!isVisible) return null

  const iconMap = {
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  }

  return (
    <div className="fixed top-14 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="max-w-[360px] w-auto bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 pointer-events-auto">
        {iconMap[type]}
        <span className="text-xs font-semibold leading-snug">{message}</span>
      </div>
    </div>
  )
}

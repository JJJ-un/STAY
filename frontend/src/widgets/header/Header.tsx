import { type ReactNode } from 'react'
import Logo from '@/shared/assets/logo.svg?react'
import BackIcon from '@/shared/assets/back.svg?react'

export interface HeaderProps {
  showBackButton?: boolean
  onBack?: () => void
  title?: ReactNode
  rightAction?: ReactNode
  className?: string
}

export function Header({
  showBackButton = false,
  onBack,
  title,
  rightAction,
  className = '',
}: HeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      window.history.back()
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md pt-[env(safe-area-inset-top)] ${className}`}
    >
      <div className="max-w-[430px] mx-auto px-4 h-12 flex items-center justify-between">
        {/* Left 영역: 뒤로가기 버튼 또는 브랜드 로고 */}
        <div className="flex items-center">
          {showBackButton ? (
            <button
              type="button"
              onClick={handleBack}
              className="p-1 -ml-1.5 text-slate-900 hover:opacity-75 transition-opacity cursor-pointer flex items-center justify-center"
              aria-label="뒤로가기"
            >
              <BackIcon className="w-7 h-7" />
            </button>
          ) : (
            <div className="flex items-center">
              <Logo className="h-7 w-auto object-contain" />
            </div>
          )}
        </div>

        {/* Center 영역 (전달된 커스텀 title이 명시적으로 있을 때만 노출) */}
        {title && (
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
            <h1 className="text-sm font-bold text-slate-900 leading-none">
              {title}
            </h1>
          </div>
        )}

        {/* Right 영역 */}
        {rightAction ? (
          <div className="flex items-center gap-2">{rightAction}</div>
        ) : (
          <div className="w-7" />
        )}
      </div>
    </header>
  )
}

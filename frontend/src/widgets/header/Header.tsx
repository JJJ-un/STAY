import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '@/shared/assets/logo.svg?react'

export interface HeaderProps {
  showBackButton?: boolean
  onBack?: () => void
  rightAction?: ReactNode
  className?: string
}

export function Header({
  showBackButton = false,
  onBack,
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
      className={`sticky top-0 z-50 w-full bg-white pt-[env(safe-area-inset-top)] ${className}`}
    >
      <div className="max-w-[430px] mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-11 w-11 -ml-3 items-center justify-center rounded-xl text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : (
            <Link
              to="/"
              aria-label="STAY 홈"
              className="inline-flex min-h-11 items-center rounded-md text-slate-900 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Logo className="h-6 w-auto" aria-hidden="true" />
            </Link>
          )}
        </div>

        {rightAction && (
          <div className="flex items-center gap-2">{rightAction}</div>
        )}
      </div>
    </header>
  )
}

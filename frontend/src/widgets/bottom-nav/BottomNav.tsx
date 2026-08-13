import { Home, TrendingUp, FileText, Bell, User } from 'lucide-react'

export type NavTabType = 'HOME' | 'STOCK' | 'JOURNAL' | 'NOTIFICATION' | 'MY'

interface BottomNavProps {
  activePath?: string
  onNavigate?: (path: string) => void
}

export function BottomNav({ activePath = '/', onNavigate }: BottomNavProps) {
  const getTabPath = (tab: NavTabType) => {
    switch (tab) {
      case 'HOME':
        return '/'
      case 'STOCK':
        return '/stock'
      case 'JOURNAL':
        return '/journal'
      case 'NOTIFICATION':
        return '/notification'
      case 'MY':
        return '/my'
    }
  }

  const handleTabClick = (tab: NavTabType) => {
    const targetPath = getTabPath(tab)
    if (onNavigate) {
      onNavigate(targetPath)
    }
  }

  const isActive = (tab: NavTabType) => {
    const targetPath = getTabPath(tab)
    return activePath === targetPath
  }

  return (
    <nav className="sticky bottom-0 z-50 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 px-1 pt-2 pb-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around">
        {/* 1. 홈 */}
        <button
          type="button"
          onClick={() => handleTabClick('HOME')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors ${
            isActive('HOME')
              ? 'text-slate-900 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px]">홈</span>
        </button>

        {/* 2. 관심 주식 */}
        <button
          type="button"
          onClick={() => handleTabClick('STOCK')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors ${
            isActive('STOCK')
              ? 'text-slate-900 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px]">관심 주식</span>
        </button>

        {/* 3. 알림 (중앙) */}
        <button
          type="button"
          onClick={() => handleTabClick('NOTIFICATION')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors ${
            isActive('NOTIFICATION')
              ? 'text-slate-900 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Bell className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px]">알림</span>
        </button>

        {/* 4. 주식일지 */}
        <button
          type="button"
          onClick={() => handleTabClick('JOURNAL')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors ${
            isActive('JOURNAL')
              ? 'text-slate-900 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <FileText className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px]">주식일지</span>
        </button>

        {/* 5. 마이 */}
        <button
          type="button"
          onClick={() => handleTabClick('MY')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors ${
            isActive('MY')
              ? 'text-slate-900 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <User className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px]">마이</span>
        </button>
      </div>
    </nav>
  )
}

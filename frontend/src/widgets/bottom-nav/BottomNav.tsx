import { useLocation, useNavigate } from 'react-router-dom'
import { Home, TrendingUp, FileText, Bell, User } from 'lucide-react'

export type NavTabType = 'HOME' | 'STOCK' | 'JOURNAL' | 'NOTIFICATION' | 'MY'

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  const navItems: { tab: NavTabType; path: string; label: string; icon: typeof Home }[] = [
    { tab: 'HOME', path: '/', label: '홈', icon: Home },
    { tab: 'STOCK', path: '/stock', label: '관심 주식', icon: TrendingUp },
    { tab: 'NOTIFICATION', path: '/notification', label: '알림', icon: Bell },
    { tab: 'JOURNAL', path: '/journal', label: '주식일지', icon: FileText },
    { tab: 'MY', path: '/my', label: '마이', icon: User },
  ]

  return (
    <nav className="sticky bottom-0 z-50 w-full bg-white/95 backdrop-blur-md px-1 pt-2 pb-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around">
        {navItems.map(({ tab, path, label, icon: Icon }) => {
          const isActive = currentPath === path

          return (
            <button
              key={tab}
              type="button"
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors cursor-pointer ${
                isActive
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px]">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

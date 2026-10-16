import type { CSSProperties } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Header } from '@/widgets/header'
import { BottomNav } from '@/widgets/bottom-nav'
import { Plus } from 'lucide-react'
import { useElementHeight } from '@/shared/lib'

export function RootLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const { ref: bottomNavRef, height: bottomNavHeight } = useElementHeight<HTMLElement>()
  const layoutStyle = {
    '--app-bottom-nav-height': bottomNavHeight === undefined ? undefined : `${bottomNavHeight}px`,
  } as CSSProperties

  const showBackButton = pathname.startsWith('/stock/') ||
    pathname === '/journal/detail' || pathname === '/journal/write'

  const handleBack = () => {
    if (location.key === 'default') {
      navigate(pathname.startsWith('/stock/') ? '/stock' : '/journal', { replace: true })
      return
    }
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div style={layoutStyle} className="w-full max-w-[430px] min-h-screen bg-white text-slate-900 flex flex-col relative">
        {/* 최상단 고정 헤더 */}
        <Header
          showBackButton={showBackButton}
          onBack={handleBack}
          rightAction={pathname === '/journal' ? (
            <button
              type="button"
              onClick={() => navigate('/journal/write')}
              className="flex h-11 w-11 -mr-3 items-center justify-center rounded-xl text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer"
              aria-label="일지 작성"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
        />

        {/* 페이지 본문 영역 (React Router Outlet) */}
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>

        {/* 최하단 고정 내비게이션 바 */}
        <BottomNav ref={bottomNavRef} />
      </div>
    </div>
  )
}

import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Header } from '@/widgets/header'
import { BottomNav } from '@/widgets/bottom-nav'
import PlusIcon from '@/shared/assets/plus.svg?react'

export function RootLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname

  // 현재 라우트에 따른 동적 헤더 Props 계산
  const getHeaderProps = () => {
    if (pathname.startsWith('/stock/')) {
      return {
        showBackButton: true,
        onBack: () => navigate('/stock'),
        title: '',
        rightAction: null,
      }
    }

    if (pathname.startsWith('/journal/detail')) {
      return {
        showBackButton: true,
        onBack: () => navigate('/journal'),
        title: '주식일지 상세',
        rightAction: null,
      }
    }

    if (pathname === '/journal/write') {
      return {
        showBackButton: true,
        onBack: () => navigate('/journal'),
        title: '새 주식일지 작성',
        rightAction: null,
      }
    }

    switch (pathname) {
      case '/stock':
        return {
          showBackButton: false,
          title: '',
          rightAction: null,
        }
      case '/journal':
        return {
          showBackButton: false,
          title: '',
          rightAction: (
            <button
              type="button"
              onClick={() => navigate('/journal/write')}
              className="p-1 -mr-1.5 text-slate-900 hover:opacity-75 transition-opacity cursor-pointer flex items-center justify-center"
              aria-label="일지 작성"
            >
              <PlusIcon className="w-7 h-7" />
            </button>
          ),
        }
      case '/notification':
        return {
          showBackButton: false,
          title: '알림',
          rightAction: null,
        }
      case '/my':
        return {
          showBackButton: false,
          title: '마이페이지',
          rightAction: null,
        }
      case '/':
      default:
        return {
          showBackButton: false,
          title: '',
          rightAction: null,
        }
    }
  }

  // 로그인 화면 등 특정 화면에서는 BottomNav 숨김
  const hideBottomNav = pathname === '/login' || pathname === '/oauth/callback'

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white text-slate-900 flex flex-col relative">
        {/* 최상단 고정 헤더 */}
        <Header {...getHeaderProps()} />

        {/* 페이지 본문 영역 (React Router Outlet) */}
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>

        {/* 최하단 고정 내비게이션 바 */}
        {!hideBottomNav && <BottomNav />}
      </div>
    </div>
  )
}

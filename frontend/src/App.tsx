import { useState, useEffect, useRef } from 'react'
import { Header, type HeaderProps } from '@/widgets/header'
import { BottomNav } from '@/widgets/bottom-nav'
import { MainPage } from '@/pages/main'
import { StockPage } from '@/pages/stock'
import { StockDetailPage } from '@/pages/stock-detail'
import { JournalPage } from '@/pages/journal'
import { JournalWritePage } from '@/pages/journal-write'
import { JournalDetailPage } from '@/pages/journal-detail'
import { NotificationPage } from '@/pages/notification'
import { MyPage } from '@/pages/my'
import PlusIcon from '@/shared/assets/plus.svg?react'

export function App() {
  // 브라우저 location.pathname 또는 hash 기반 상태 관리
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname + window.location.search || '/'
  })

  // 일지 작성 전용 헤더 백 핸들러 참조
  const journalBackHandlerRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search || '/')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleNavigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path)
      setCurrentPath(path)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  const pathname = currentPath.split('?')[0]
  const search = currentPath.split('?')[1] || ''

  // 현재 경로(pathname)에 따른 헤더 프로퍼티 동적 설정
  const getHeaderProps = (): HeaderProps => {
    if (pathname.startsWith('/stock/')) {
      return {
        showBackButton: true,
        onBack: () => handleNavigate('/'),
      }
    }

    if (pathname.startsWith('/journal/detail')) {
      return {
        showBackButton: true,
        onBack: () => handleNavigate('/journal'),
        title: '주식일지 상세',
      }
    }

    if (pathname === '/journal/write') {
      return {
        showBackButton: true,
        onBack: () => {
          if (journalBackHandlerRef.current) {
            journalBackHandlerRef.current()
          } else {
            handleNavigate('/journal')
          }
        },
      }
    }

    if (pathname === '/journal') {
      return {
        showBackButton: true,
        onBack: () => handleNavigate('/'),
        rightAction: (
          <button
            type="button"
            onClick={() => handleNavigate('/journal/write')}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 active:bg-slate-400 flex items-center justify-center transition-all group cursor-pointer"
            aria-label="일지 쓰기"
          >
            <PlusIcon className="w-3.5 h-3.5 text-slate-900 fill-slate-900 transition-transform group-hover:scale-110" />
          </button>
        ),
      }
    }

    switch (pathname) {
      case '/stock':
      case '/notification':
      case '/my':
        return {
          showBackButton: true,
          onBack: () => handleNavigate('/'),
        }
      case '/':
      default:
        return { showBackButton: false } // 메인 기본 로고 (STAY)
    }
  }

  // 경로에 따른 메인 본문 콘텐츠 렌더링
  const renderPage = () => {
    if (pathname.startsWith('/stock/')) {
      const stockId = pathname.replace('/stock/', '') || '1'
      return <StockDetailPage stockId={stockId} onNavigate={handleNavigate} />
    }

    if (pathname.startsWith('/journal/detail')) {
      const params = new URLSearchParams(search)
      const journalId = params.get('id') || 'j1'
      return (
        <JournalDetailPage
          journalId={journalId}
          onNavigate={handleNavigate}
        />
      )
    }

    if (pathname === '/journal/write') {
      const params = new URLSearchParams(search)
      const stockId = params.get('stockId') || '1'
      const stockName = params.get('stockName') || '삼성전자'
      return (
        <JournalWritePage
          onNavigate={handleNavigate}
          initialStockId={stockId}
          initialStockName={stockName}
          onRegisterBackHandler={(fn) => {
            journalBackHandlerRef.current = fn
          }}
        />
      )
    }

    switch (pathname) {
      case '/stock':
        return <StockPage onNavigate={handleNavigate} />
      case '/journal':
        return <JournalPage onNavigate={handleNavigate} />
      case '/notification':
        return <NotificationPage onNavigate={handleNavigate} />
      case '/my':
        return <MyPage onNavigate={handleNavigate} />
      case '/':
      default:
        return <MainPage onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white text-slate-900 flex flex-col relative">
        {/* 최상단 고정 헤더 */}
        <Header {...getHeaderProps()} />

        {/* 페이지 본문 영역 */}
        <main className="flex-1 flex flex-col">{renderPage()}</main>

        {/* 최하단 고정 내비게이션 바 */}
        <BottomNav activePath={pathname} onNavigate={handleNavigate} />
      </div>
    </div>
  )
}

export default App

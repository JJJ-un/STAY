import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { connectStockSSE } from '@/entities/stock'
import { RootLayout } from '@/app/layout/RootLayout'
import { ProtectedRoute } from '@/app/routes/ProtectedRoute'
import { MainPage } from '@/pages/main'
import { StockPage } from '@/pages/stock'
import { StockDetailPage } from '@/pages/stock-detail'
import { JournalPage } from '@/pages/journal'
import { JournalWritePage } from '@/pages/journal-write'
import { JournalDetailPage } from '@/pages/journal-detail'
import { NotificationPage } from '@/pages/notification'
import { MyPage } from '@/pages/my'
import { LoginPage, OAuthCallbackPage } from '@/pages/login'

export function App() {
  // 앱 전역 실시간 주가 SSE 스트림 연결 (순수 TS 싱글톤 매니저)
  useEffect(() => {
    return connectStockSSE()
  }, [])

  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
            {/* 1. 상단/하단 내비게이션 레이아웃이 적용되는 서비스 화면 */}
            <Route element={<RootLayout />}>
              <Route path="/" element={<MainPage />} />
              <Route path="/stock" element={<StockPage />} />
              <Route path="/stock/:ticker" element={<StockDetailPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/journal/detail" element={<JournalDetailPage />} />
              <Route path="/notification" element={<NotificationPage />} />
              <Route path="/my" element={<MyPage />} />

              {/* 🛡️ 로그인 필수 접근 가드 적용 */}
              <Route element={<ProtectedRoute />}>
                <Route path="/journal/write" element={<JournalWritePage />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            {/* 2. 전체 화면 독립 로그인 및 OAuth 콜백 화면 */}
            <Route
              path="/login"
              element={
                <div className="min-h-screen bg-slate-100 flex justify-center">
                  <div className="w-full max-w-[430px] min-h-screen bg-white">
                    <LoginPage />
                  </div>
                </div>
              }
            />
            <Route
              path="/oauth/callback"
              element={
                <div className="min-h-screen bg-slate-100 flex justify-center">
                  <div className="w-full max-w-[430px] min-h-screen bg-white">
                    <OAuthCallbackPage />
                  </div>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
    </QueryProvider>
  )
}

export default App

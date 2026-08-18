import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RootLayout } from '@/app/layout/RootLayout'
import { MainPage } from '@/pages/main'
import { StockPage } from '@/pages/stock'
import { StockDetailPage } from '@/pages/stock-detail'
import { JournalPage } from '@/pages/journal'
import { JournalWritePage } from '@/pages/journal-write'
import { JournalDetailPage } from '@/pages/journal-detail'
import { NotificationPage } from '@/pages/notification'
import { MyPage } from '@/pages/my'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/stock/:ticker" element={<StockDetailPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/write" element={<JournalWritePage />} />
          <Route path="/journal/detail" element={<JournalDetailPage />} />
          <Route path="/notification" element={<NotificationPage />} />
          <Route path="/my" element={<MyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

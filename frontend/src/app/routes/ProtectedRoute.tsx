import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom'

/**
 * 로그인 필수 페이지 접근 제어 가드 (Protected Route)
 * 토큰이 없으면 /login으로 리다이렉트합니다.
 * 부모 Layout(RootLayout)의 Outlet Context를 하위 페이지로 정상 전달(Forwarding)합니다.
 */
export function ProtectedRoute() {
  const location = useLocation()
  const context = useOutletContext()
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  if (!accessToken) {
    // 로그인 완료 후 원래 접근하려던 페이지로 복귀할 수 있도록 state 전달
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet context={context} />
}

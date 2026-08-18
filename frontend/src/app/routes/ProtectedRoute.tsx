import { Navigate, Outlet, useLocation } from 'react-router-dom'

/**
 * 로그인 필수 페이지 접근 제어 가드 (Protected Route)
 * 토큰이 없으면 /login으로 리다이렉트합니다.
 */
export function ProtectedRoute() {
  const location = useLocation()
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  if (!accessToken) {
    // 로그인 완료 후 원래 접근하려던 페이지로 복귀할 수 있도록 state 전달
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

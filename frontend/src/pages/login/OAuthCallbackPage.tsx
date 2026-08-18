import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Toast, useToast } from '@/shared/ui'

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toastState, showToast } = useToast()
  const isProcessedRef = useRef(false)

  useEffect(() => {
    // 중복 실행 방지
    if (isProcessedRef.current) return
    isProcessedRef.current = true

    const token = searchParams.get('token')
    const refreshToken = searchParams.get('refreshToken')

    if (token && token.trim()) {
      localStorage.setItem('accessToken', token.trim())
      if (refreshToken && refreshToken.trim()) {
        localStorage.setItem('refreshToken', refreshToken.trim())
      }

      // 0.3초 후 홈으로 깔끔하게 이동
      const timer = setTimeout(() => {
        navigate('/', { replace: true })
      }, 300)
      return () => clearTimeout(timer)
    } else {
      showToast('소셜 로그인 인증 토큰을 수신하지 못했습니다.', 'error')
      const timer = setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [searchParams, navigate, showToast])

  return (
    <div className="flex-1 min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white relative">
      <Toast
        message={toastState.message}
        type={toastState.type}
        isVisible={toastState.isVisible}
      />

      <div className="flex flex-col items-center space-y-4 z-10">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center backdrop-blur-xl">
          <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-white">안전하게 로그인 처리 중</h2>
          <p className="text-xs text-slate-400">잠시만 기다려 주세요...</p>
        </div>
      </div>
    </div>
  )
}

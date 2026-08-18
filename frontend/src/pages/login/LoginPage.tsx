import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { apiClient } from '@/shared/api'
import { Toast, useToast } from '@/shared/ui'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const IS_DEV = import.meta.env.DEV

export function LoginPage() {
  const navigate = useNavigate()
  const { toastState, showToast } = useToast()
  const [isDevLoading, setIsDevLoading] = useState(false)

  // 1. 실제 구글 소셜 로그인 이동
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`
  }

  // 2. 로컬 개발 전용 1초 테스트 로그인
  const handleDevLogin = async () => {
    if (isDevLoading) return
    setIsDevLoading(true)

    try {
      const res = await apiClient.post<{
        status: number
        data: { accessToken?: string; refreshToken?: string; tokenType: string }
      }>('/auth/dev-token')

      const accessToken = res.data.data?.accessToken
      if (!accessToken) {
        throw new Error('서버로부터 유효한 인증 토큰을 전달받지 못했습니다.')
      }

      localStorage.setItem('accessToken', accessToken)
      navigate('/', { replace: true })
    } catch (err) {
      console.error('개발용 토큰 발급 실패:', err)
      showToast('로그인에 실패했습니다. 백엔드 서버 상태를 확인해 주세요.', 'error')
    } finally {
      setIsDevLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 pb-10 min-h-screen bg-white text-slate-900 relative">
      {/* 상단 플로팅 토스트 */}
      <Toast
        message={toastState.message}
        type={toastState.type}
        isVisible={toastState.isVisible}
      />

      {/* 1. 상단 브랜딩 & 토스 스타일 헤드라인 */}
      <div className="pt-12 space-y-6">

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-snug">
            흔들리지 않는 원칙 투자,<br />
            STAY로 시작해 보세요
          </h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            매수 전 나만의 원칙을 기록하고 뇌동매매를 방지하세요.
          </p>
        </div>
      </div>

      {/* 2. 중앙 여백 및 심플한 강조 그래픽 */}
      <div className="my-auto py-10 flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
          <div className="text-3xl font-black tracking-tight">STAY</div>
        </div>
      </div>

      {/* 3. 하단 액션 버튼 영역 (토스 스타일) */}
      <div className="space-y-3 z-10">
        {/* Google 공식 소셜 로그인 버튼 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-4 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google 계정으로 계속하기</span>
        </button>

        {/* 로컬 개발 환경(DEV) 전용 테스트 로그인 버튼 (이모지 없음!) */}
        {IS_DEV && (
          <button
            type="button"
            onClick={handleDevLogin}
            disabled={isDevLoading}
            className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDevLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <span>테스트 계정으로 계속하기 (개발용)</span>
            )}
          </button>
        )}

        {/* 하단 약관 안내 문구 */}
        <p className="text-[11px] text-center text-slate-400 pt-2 font-normal leading-relaxed">
          로그인 시 STAY의 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  )
}

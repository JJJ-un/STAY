import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, LogOut, ChevronRight, ShieldCheck, Heart, Bell } from 'lucide-react'

export function MyPage() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setIsLoggedIn(false)
  }

  return (
    <div className="flex-1 p-4 space-y-4 bg-white">
      {/* 1. 상단 프로필 또는 로그인 CTA 카드 (회색선 없이 깔끔한 디자인) */}
      {isLoggedIn ? (
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md">
              ST
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-white text-base">STAY 테스터님</h3>
              <p className="text-xs text-slate-400 font-medium">test@stay.com</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full">
            원칙 투자자
          </span>
        </div>
      ) : (
        <div
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between cursor-pointer hover:bg-blue-700 active:scale-[0.99] transition-all"
        >
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">로그인 / 회원가입</h3>
            <p className="text-xs text-blue-100 font-medium">
              로그인하고 나만의 매매 원칙을 기록해 보세요.
            </p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center text-white">
            <LogIn className="w-5 h-5" />
          </div>
        </div>
      )}

      {/* 2. 메뉴 리스트 (회색선 없이 카드형 스타일) */}
      <div className="space-y-2 pt-2">
        <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-colors">
          <div className="flex items-center gap-3 text-slate-800">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold">내 매매 원칙 설정</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-colors">
          <div className="flex items-center gap-3 text-slate-800">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold">관심 종목 설정</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-colors">
          <div className="flex items-center gap-3 text-slate-800">
            <Bell className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold">알림 설정</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* 3. 로그인 상태일 때 로그아웃 버튼 */}
      {isLoggedIn && (
        <div className="pt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-600 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>로그아웃</span>
          </button>
        </div>
      )}
    </div>
  )
}

export function MyPage() {
  return (
    <div className="flex-1 p-4 space-y-4">
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
          ST
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">원칙 투자자님</h3>
          <p className="text-xs text-slate-400">stay_investor@stay.com</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100/80 divide-y divide-slate-100 text-sm">
        <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
          <span className="font-medium text-slate-700">내 매매 원칙 설정</span>
          <span className="text-slate-400">›</span>
        </div>
        <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
          <span className="font-medium text-slate-700">관심 종목 설정</span>
          <span className="text-slate-400">›</span>
        </div>
        <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
          <span className="font-medium text-slate-700">알림 설정</span>
          <span className="text-slate-400">›</span>
        </div>
      </div>
    </div>
  )
}

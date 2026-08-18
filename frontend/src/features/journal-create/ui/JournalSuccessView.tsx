import { CheckCircle2 } from 'lucide-react'

export function JournalSuccessView() {
  return (
    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900">주식일지가 저장되었습니다!</h2>
        <p className="text-xs text-slate-400">
          원칙을 지킨 매매 기록이 뇌동매매를 막아주는 든든한 방패가 됩니다.
        </p>
      </div>
    </div>
  )
}

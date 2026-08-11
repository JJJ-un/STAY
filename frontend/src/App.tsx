import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-sm font-medium">
          <span>🚀 프로젝트 세팅 완료</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          STAY Service Initialized
        </h1>

        <p className="text-slate-400 text-base leading-relaxed">
          React, TypeScript, Vite 및 Tailwind CSS가 정상적으로 세팅되었습니다.
        </p>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800 text-left">
            <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider block mb-1">Frontend</span>
            <div className="font-bold text-slate-200">React + TS + Vite</div>
            <div className="text-xs text-slate-400 mt-1">Yarn 패키지 매니저</div>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800 text-left">
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block mb-1">Styling</span>
            <div className="font-bold text-slate-200">Tailwind CSS</div>
            <div className="text-xs text-slate-400 mt-1">@tailwindcss/vite v4</div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setCount((c) => c + 1)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            Count is {count}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App

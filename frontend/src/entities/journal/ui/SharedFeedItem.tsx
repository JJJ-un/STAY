import { useState } from 'react'
import type { SharedJournalFeed } from '../model/types'

interface SharedFeedItemProps {
  item: SharedJournalFeed
}

export function SharedFeedItem({ item }: SharedFeedItemProps) {
  const [likes, setLikes] = useState(item.likes)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1)
      setIsLiked(false)
    } else {
      setLikes((prev) => prev + 1)
      setIsLiked(true)
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100/80 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{item.author}</span>
        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-medium">
          {item.stockName} · {item.category}
        </span>
      </div>

      <div className="border-l-2 border-slate-300 pl-3 py-0.5">
        <p className="text-sm text-slate-800 leading-relaxed">
          "{item.content}"
        </p>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleLike}
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
            isLiked
              ? 'bg-rose-50 border-rose-200 text-rose-600 font-medium'
              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>공감 {likes}</span>
        </button>
      </div>
    </div>
  )
}

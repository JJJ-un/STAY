export interface TabItem<T extends string> {
  id: T
  label: string
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[]
  activeId: T
  onChange: (id: T) => void
  variant?: 'underline' | 'segmented' | 'pill'
  size?: 'sm' | 'md'
  fullWidth?: boolean
  className?: string
}

export function Tabs<T extends string>({
  items,
  activeId,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth = true,
  className = '',
}: TabsProps<T>) {
  if (variant === 'underline') {
    return (
      <div
        className={`flex items-center ${
          fullWidth ? 'w-full justify-between' : 'justify-center gap-8'
        } ${className}`}
      >
        {items.map((item) => {
          const isActive = item.id === activeId
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`py-3 transition-colors relative cursor-pointer ${
                fullWidth ? 'flex-1 text-center' : ''
              } ${size === 'sm' ? 'text-sm' : 'text-base'} ${
                isActive
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-400 font-medium hover:text-slate-600'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-900 rounded-full animate-in fade-in zoom-in duration-200" />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // segmented / pill 유형
  return (
    <div className={`flex bg-slate-100 p-1 rounded-2xl gap-1 ${className}`}>
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`flex-1 text-center font-bold rounded-xl transition-all cursor-pointer ${
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
            } ${
              isActive
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

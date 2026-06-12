import { useEffect, useRef } from 'react'

export default function NewsTicker({ news }) {
  const doubled = [...news, ...news]

  return (
    <div className="bg-red-600/90 backdrop-blur-sm border-b border-red-500/50 py-2 overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-red-800 text-white text-xs font-bold px-3 py-1 mx-3 rounded-md z-10 relative whitespace-nowrap">
          🔴 عاجل
        </div>
        <div className="ticker-wrap flex-1 min-w-0" style={{ direction: 'ltr' }}>
          <div className="ticker-content text-white text-sm font-medium">
            {doubled.map((item, i) => (
              <span key={i} className="inline-block mx-8" dir="rtl">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

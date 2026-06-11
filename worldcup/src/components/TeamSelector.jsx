import { useState } from 'react'
import data from '../data/data.json'

export default function TeamSelector({ onSelect }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (teamId) => {
    setSelected(teamId)
    setTimeout(() => onSelect(teamId), 300)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 safe-top safe-bottom">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-2xl font-black text-white mb-2">كأس العالم 2026</h1>
          <p className="text-slate-400 text-lg font-medium">ما هو منتخبك المفضل؟</p>
          <p className="text-slate-500 text-sm mt-1">سنرتب المباريات بناءً على اختيارك</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {data.teams.map((team) => (
            <button
              key={team.id}
              onClick={() => handleSelect(team.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${
                selected === team.id
                  ? 'border-emerald-400 bg-emerald-400/10 scale-105 shadow-lg shadow-emerald-400/20'
                  : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-500 active:scale-95'
              }`}
            >
              <span className="text-3xl">{team.flag}</span>
              <span className="text-xs font-bold text-white text-center leading-tight">{team.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => onSelect('NONE')}
          className="w-full mt-6 py-3 text-slate-500 text-sm hover:text-slate-300 transition-colors"
        >
          تخطي — أتابع جميع المنتخبات
        </button>
      </div>
    </div>
  )
}

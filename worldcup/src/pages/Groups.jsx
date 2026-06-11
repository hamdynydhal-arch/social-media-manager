import { useState } from 'react'
import data from '../data/data.json'
import StandingsTable from '../components/StandingsTable'

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export default function Groups({ favoriteTeam }) {
  const [activeGroup, setActiveGroup] = useState('A')

  const groupTeams = data.teams.filter(t => t.group === activeGroup)

  return (
    <div className="px-4 py-4 pb-24 space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {GROUPS.map(g => {
          const hasFav = data.teams.some(t => t.group === g && t.id === favoriteTeam)
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`flex-shrink-0 w-12 h-12 rounded-xl text-sm font-black transition-all relative ${
                activeGroup === g
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {g}
              {hasFav && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full text-slate-900 text-xs flex items-center justify-center">
                  ★
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white">المجموعة {activeGroup}</h2>
          <span className="text-xs text-slate-400">المتأهل الأول والثاني</span>
        </div>

        {groupTeams.length > 0 ? (
          <StandingsTable groupId={activeGroup} favoriteTeam={favoriteTeam} />
        ) : (
          <div className="text-center py-8 text-slate-400">
            <p className="text-3xl mb-2">📊</p>
            <p>لا توجد بيانات لهذه المجموعة بعد</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400">منتخبات المجموعة {activeGroup}</h3>
        {groupTeams.map(team => (
          <div key={team.id} className="card p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{team.flag}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{team.name}</span>
                  {team.id === favoriteTeam && (
                    <span className="text-xs bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 px-1.5 py-0.5 rounded-full">
                      ★ مفضل
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  المدرب: {team.coach} • الترتيب FIFA: #{team.ranking}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-amber-400">{team.stats.points}</div>
                <div className="text-xs text-slate-500">نقطة</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3 text-xs text-center">
              {[
                { label: 'فاز', val: team.stats.wins, color: 'text-emerald-400 bg-emerald-400/10' },
                { label: 'تعادل', val: team.stats.draws, color: 'text-slate-300 bg-slate-700/50' },
                { label: 'خسر', val: team.stats.losses, color: 'text-red-400 bg-red-400/10' },
                { label: 'أهداف', val: `${team.stats.goals_for}/${team.stats.goals_against}`, color: 'text-amber-400 bg-amber-400/10' },
              ].map(({ label, val, color }) => (
                <div key={label} className={`rounded-lg p-2 ${color.split(' ')[1]}`}>
                  <div className={`font-black text-sm ${color.split(' ')[0]}`}>{val}</div>
                  <div className="text-slate-500 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

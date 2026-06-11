import { useState } from 'react'
import confetti from 'canvas-confetti'
import { playGoalSound, haptic } from '../utils/audioUtils'
import data from '../data/data.json'

function StatBar({ label, homeVal, awayVal, homeColor }) {
  const total = homeVal + awayVal || 1
  const homePct = Math.round((homeVal / total) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span className="font-bold text-white">{homeVal}</span>
        <span>{label}</span>
        <span className="font-bold text-white">{awayVal}</span>
      </div>
      <div className="flex gap-0.5 h-1.5">
        <div className="stat-bar bg-emerald-500 rounded-r-full" style={{ width: `${homePct}%` }} />
        <div className="stat-bar bg-slate-400 rounded-l-full flex-1" />
      </div>
    </div>
  )
}

export default function MatchModal({ match, homeTeam, awayTeam, stadium, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [userVote, setUserVote] = useState(
    () => localStorage.getItem(`vote_${match.id}`)
  )
  const [votes, setVotes] = useState(match.votes)

  const handleVote = (choice) => {
    if (userVote) return
    haptic([80])
    setUserVote(choice)
    localStorage.setItem(`vote_${match.id}`, choice)
    setVotes(prev => ({ ...prev, [choice]: prev[choice] + 1 }))
    if (choice === 'home' || choice === 'away') {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 } })
    }
  }

  const totalVotes = votes.home + votes.draw + votes.away
  const homeTeamPlayers = homeTeam?.players || []
  const awayTeamPlayers = awayTeam?.players || []

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'stats', label: 'إحصائيات' },
    { id: 'lineup', label: 'تشكيلة' },
    { id: 'vote', label: 'توقع' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-slate-900 rounded-t-3xl sm:rounded-3xl max-h-[92dvh] overflow-hidden flex flex-col modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0">
          <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
          <div className="px-4 pb-4 pt-3 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">{match.round}</span>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-1 text-lg">✕</button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="text-4xl">{homeTeam.flag}</div>
                <span className="font-bold text-sm text-center text-white">{homeTeam.name}</span>
              </div>
              <div className="flex-shrink-0 text-center">
                {match.status === 'scheduled' ? (
                  <div>
                    <div className="text-2xl font-black text-white">vs</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(`${match.date}T${match.time}:00Z`).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl font-black text-amber-400 score-glow">
                      {match.score_home} - {match.score_away}
                    </div>
                    {match.status === 'live' && (
                      <div className="live-badge mt-1 mx-auto w-fit">
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                        {match.minute}'
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="text-4xl">{awayTeam.flag}</div>
                <span className="font-bold text-sm text-center text-white">{awayTeam.name}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
              <span>🏟️ {stadium?.name}</span>
              <span>📍 {stadium?.city}</span>
              <span>{match.weather?.icon} {match.weather?.temp}°</span>
            </div>
          </div>

          <div className="flex border-b border-slate-700/50 bg-slate-900">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-xs font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'overview' && (
            <>
              {match.goals.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-300">أهداف المباراة</h4>
                  {match.goals.map((goal, i) => {
                    const isHome = goal.team === homeTeam.id
                    return (
                      <div key={i} className={`flex items-center gap-3 ${isHome ? '' : 'flex-row-reverse'}`}>
                        <div className={`flex-1 ${isHome ? 'text-right' : 'text-left'}`}>
                          <span className="text-sm text-white font-medium">{goal.player}</span>
                          {goal.type !== 'عادي' && (
                            <span className="text-xs text-amber-400 mr-1">({goal.type})</span>
                          )}
                        </div>
                        <div className="flex-shrink-0 w-12 text-center">
                          <span className="text-xs bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full">
                            {goal.minute}'
                          </span>
                        </div>
                        <div className="flex-1 flex items-center gap-1">
                          <span className="text-lg">⚽</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="card p-3 space-y-1">
                <h4 className="text-sm font-bold text-slate-300 mb-2">حالة الطقس</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span>🌡️</span>
                    <span className="text-slate-400">درجة الحرارة:</span>
                    <span className="text-white font-bold">{match.weather?.temp}°م</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💧</span>
                    <span className="text-slate-400">الرطوبة:</span>
                    <span className="text-white font-bold">{match.weather?.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💨</span>
                    <span className="text-slate-400">الرياح:</span>
                    <span className="text-white font-bold">{match.weather?.wind} كم/س</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{match.weather?.icon}</span>
                    <span className="text-white font-bold">{match.weather?.condition}</span>
                  </div>
                </div>
              </div>

              <div className="card p-3">
                <h4 className="text-sm font-bold text-slate-300 mb-2">عن الملعب</h4>
                <p className="text-white font-bold">{stadium?.name}</p>
                <p className="text-slate-400 text-xs">{stadium?.city}، {stadium?.country}</p>
                <div className="flex gap-4 mt-2 text-xs text-slate-400">
                  <span>👥 {stadium?.capacity?.toLocaleString('ar-SA')} مقعد</span>
                  <span>🌿 {stadium?.surface}</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'stats' && match.stats && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span className="font-bold text-white text-sm">{homeTeam.name}</span>
                <span className="font-bold text-white text-sm">{awayTeam.name}</span>
              </div>
              {[
                { label: 'الاستحواذ %', h: match.stats.home.possession, a: match.stats.away.possession },
                { label: 'التسديدات', h: match.stats.home.shots, a: match.stats.away.shots },
                { label: 'على المرمى', h: match.stats.home.shots_on_target, a: match.stats.away.shots_on_target },
                { label: 'الركنيات', h: match.stats.home.corners, a: match.stats.away.corners },
                { label: 'الأخطاء', h: match.stats.home.fouls, a: match.stats.away.fouls },
                { label: 'البطاقات الصفراء', h: match.stats.home.yellow_cards, a: match.stats.away.yellow_cards },
              ].map((stat) => (
                <StatBar key={stat.label} label={stat.label} homeVal={stat.h} awayVal={stat.a} />
              ))}
            </div>
          )}

          {activeTab === 'stats' && !match.stats && (
            <div className="text-center text-slate-400 py-8">
              <p className="text-3xl mb-2">📊</p>
              <p>الإحصائيات ستتوفر بعد بدء المباراة</p>
            </div>
          )}

          {activeTab === 'lineup' && (
            <div className="grid grid-cols-2 gap-4">
              {[{ team: homeTeam, players: homeTeamPlayers }, { team: awayTeam, players: awayTeamPlayers }].map(({ team, players }) => (
                <div key={team.id}>
                  <div className="flex items-center gap-1 mb-2">
                    <span>{team.flag}</span>
                    <span className="text-xs font-bold text-white">{team.name}</span>
                  </div>
                  <div className="space-y-1">
                    {players.map((p) => (
                      <div key={p.number} className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-2 py-1.5">
                        <span className="text-xs text-amber-400 font-bold w-5 text-center">{p.number}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.position}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'vote' && (
            <div className="space-y-4">
              <h4 className="text-center text-lg font-bold text-white">توقع الفائز</h4>
              <p className="text-center text-slate-400 text-sm">صوّت وتحقق من توقعات الجماهير</p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'home', label: homeTeam.name, flag: homeTeam.flag, color: 'from-emerald-600 to-emerald-700' },
                  { key: 'draw', label: 'تعادل', flag: '🤝', color: 'from-slate-600 to-slate-700' },
                  { key: 'away', label: awayTeam.name, flag: awayTeam.flag, color: 'from-blue-600 to-blue-700' },
                ].map(({ key, label, flag, color }) => (
                  <button
                    key={key}
                    onClick={() => handleVote(key)}
                    disabled={!!userVote}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${
                      userVote === key
                        ? `bg-gradient-to-b ${color} border-transparent scale-105 shadow-lg`
                        : userVote
                        ? 'bg-slate-800/50 border-slate-700/50 opacity-60'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-500 active:scale-95'
                    }`}
                  >
                    <span className="text-2xl">{flag}</span>
                    <span className="text-xs font-bold text-white text-center">{label}</span>
                    {userVote && (
                      <span className="text-xs text-slate-300">
                        {Math.round((votes[key] / totalVotes) * 100)}%
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {userVote && (
                <div className="space-y-2 mt-4">
                  {[
                    { key: 'home', label: homeTeam.name, color: 'bg-emerald-500' },
                    { key: 'draw', label: 'تعادل', color: 'bg-slate-500' },
                    { key: 'away', label: awayTeam.name, color: 'bg-blue-500' },
                  ].map(({ key, label, color }) => {
                    const pct = Math.round((votes[key] / totalVotes) * 100)
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>{label}</span>
                          <span className="text-white font-bold">{pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color} rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  <p className="text-center text-xs text-slate-500 mt-2">
                    إجمالي الأصوات: {totalVotes.toLocaleString('ar-SA')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

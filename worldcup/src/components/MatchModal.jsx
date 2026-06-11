import { useState } from 'react'
import confetti from 'canvas-confetti'
import { playGoalSound, haptic } from '../utils/audioUtils'
import lineupsData from '../data/lineups.json'

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

  // ── Score predictor ────────────────────────────────────────────────────────
  const [prediction, setPrediction] = useState(
    () => {
      const s = localStorage.getItem(`pred_${match.id}`)
      return s ? JSON.parse(s) : null
    }
  )
  const [predHome, setPredHome] = useState(prediction?.home ?? 0)
  const [predAway, setPredAway] = useState(prediction?.away ?? 0)
  const [predSaved, setPredSaved] = useState(!!prediction)

  const savePrediction = () => {
    const pred = { home: Number(predHome), away: Number(predAway) }
    localStorage.setItem(`pred_${match.id}`, JSON.stringify(pred))
    setPrediction(pred)
    setPredSaved(true)
    haptic([80, 40, 80])
  }

  const getPredictionResult = () => {
    if (!prediction || match.status !== 'finished') return null
    const ph = prediction.home; const pa = prediction.away
    const rh = match.score_home; const ra = match.score_away
    const exactScore   = ph === rh && pa === ra
    const correctSide  = (ph > pa && rh > ra) || (ph < pa && rh < ra) || (ph === pa && rh === ra)
    const oneGoalOff   = Math.abs(ph - rh) <= 1 && Math.abs(pa - ra) <= 1
    if (exactScore)  return { emoji: '🔥', color: 'from-amber-500 to-orange-500', msg: 'أنت خبير كروي أسطوري! التوقع دقيق 100%!' }
    if (correctSide) return { emoji: '✅', color: 'from-emerald-600 to-teal-600', msg: 'أصبت في الفائز! محلل ممتاز!' }
    if (oneGoalOff)  return { emoji: '😅', color: 'from-blue-600 to-blue-700', msg: 'قريب جداً! أخطأت بهدف واحد فقط!' }
    return { emoji: '😂', color: 'from-slate-600 to-slate-700', msg: 'حظ أوفر في المرة القادمة، توقعك كان بعيداً!' }
  }

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

  // Lineup: prefer match-specific data from lineups.json, fall back to team.players
  const matchLineup = lineupsData[match.id]
  const homeTeamPlayers = matchLineup?.home || homeTeam?.players || []
  const awayTeamPlayers = matchLineup?.away || awayTeam?.players || []
  const homeFormation = matchLineup?.formation_home || ''
  const awayFormation = matchLineup?.formation_away || ''

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'events',   label: 'أحداث' },
    { id: 'stats',    label: 'إحصائيات' },
    { id: 'lineup',   label: 'تشكيلة' },
    { id: 'vote',     label: 'توقع' },
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
                      {new Date(`${match.date}T${match.time}:00Z`).toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}
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
                  <span>👥 {stadium?.capacity?.toLocaleString('en-US')} مقعد</span>
                  <span>🌿 {stadium?.surface}</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'events' && (() => {
            const evtList = match.events ?? match.goals.map(g => ({ type: 'goal', ...g }))
            const homeId = homeTeam.id
            const eventIcon = t => ({ goal: '⚽', red_card: '🟥', yellow_card: '🟨', substitution: '🔄', halftime: '⏸️', kickoff2: '▶️', kickoff: '🏁', fulltime: '🏆', var: '📺' }[t] ?? '📋')
            if (evtList.length === 0) return (
              <div className="text-center text-slate-400 py-8">
                <p className="text-3xl mb-2">📋</p>
                <p>لا توجد أحداث متاحة</p>
              </div>
            )
            return (
              <div className="space-y-1.5">
                {evtList.map((ev, i) => {
                  const isHomeTeam = ev.team === homeId
                  const isNeutral  = !ev.team
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                        isNeutral ? 'bg-slate-700/30 border border-slate-600/30'
                        : isHomeTeam ? 'bg-emerald-900/20 border border-emerald-700/30'
                        : 'bg-blue-900/20 border border-blue-700/30'
                      }`}
                    >
                      <span className={`text-xs font-black w-8 text-center flex-shrink-0 tabular-nums ${
                        isNeutral ? 'text-slate-400' : isHomeTeam ? 'text-emerald-400' : 'text-blue-400'
                      }`}>
                        {ev.minute > 0 ? `${ev.minute}'` : ''}
                      </span>
                      <span className="text-lg flex-shrink-0">{eventIcon(ev.type)}</span>
                      <div className="flex-1 min-w-0">
                        {ev.player && <p className="text-white text-sm font-bold truncate">{ev.player}</p>}
                        <p className="text-slate-400 text-xs truncate">{ev.detail}</p>
                      </div>
                      {ev.team && (
                        <span className="text-lg flex-shrink-0">
                          {ev.team === homeId ? homeTeam.flag : awayTeam.flag}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {activeTab === 'stats' && match.stats && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span className="font-bold text-white text-sm">{homeTeam.name}</span>
                <span className="font-bold text-white text-sm">{awayTeam.name}</span>
              </div>
              {[
                { label: 'الاستحواذ %',       h: match.stats.home.possession,      a: match.stats.away.possession },
                { label: 'التسديدات',          h: match.stats.home.shots,           a: match.stats.away.shots },
                { label: 'على المرمى',         h: match.stats.home.shots_on_target, a: match.stats.away.shots_on_target },
                { label: 'الركنيات',           h: match.stats.home.corners,         a: match.stats.away.corners },
                { label: 'الأخطاء',            h: match.stats.home.fouls,           a: match.stats.away.fouls },
                { label: 'البطاقات الصفراء',   h: match.stats.home.yellow_cards,    a: match.stats.away.yellow_cards },
                ...(match.stats.home.passes != null ? [
                  { label: 'التمريرات',        h: match.stats.home.passes,          a: match.stats.away.passes },
                  { label: 'دقة التمرير %',    h: match.stats.home.pass_accuracy,   a: match.stats.away.pass_accuracy },
                ] : []),
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
            homeTeamPlayers.length === 0 && awayTeamPlayers.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <p className="text-3xl mb-2">📋</p>
                <p>التشكيلة ستُعلن قبل المباراة بساعة</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { team: homeTeam, players: homeTeamPlayers, formation: homeFormation },
                  { team: awayTeam, players: awayTeamPlayers, formation: awayFormation },
                ].map(({ team, players, formation }) => (
                  <div key={team.id}>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-lg">{team.flag}</span>
                      <span className="text-xs font-black text-white leading-tight">{team.name}</span>
                    </div>
                    {formation && (
                      <div className="text-xs text-emerald-400 font-bold mb-2 bg-emerald-900/30 rounded-lg px-2 py-0.5 inline-block">
                        {formation}
                      </div>
                    )}
                    <div className="space-y-1">
                      {players.map((p, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 ${i === 0 ? 'bg-amber-900/30 border border-amber-500/20' : 'bg-slate-800/50'}`}
                        >
                          <span className="text-xs text-amber-400 font-black w-5 text-center flex-shrink-0">{p.number}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white truncate font-medium">{p.name}</p>
                            <p className="text-xs text-slate-500 truncate">{p.position}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'vote' && (
            <div className="space-y-5">

              {/* ── Score predictor ── */}
              <div className="card p-4 border-amber-500/20 bg-gradient-to-b from-amber-900/10 to-transparent">
                <h4 className="text-center text-base font-black text-white mb-1">🎯 توقع النتيجة النهائية!</h4>
                <p className="text-center text-slate-400 text-xs mb-4">
                  {predSaved ? 'توقعك محفوظ — سيُقيَّم عند نهاية المباراة' : 'أدخل توقعك قبل انتهاء المباراة'}
                </p>

                {/* Result card — shown after match finishes */}
                {getPredictionResult() && (() => {
                  const r = getPredictionResult()
                  return (
                    <div className={`rounded-2xl bg-gradient-to-r ${r.color} p-4 text-center mb-4`}>
                      <div className="text-4xl mb-1">{r.emoji}</div>
                      <p className="text-white font-black text-sm">{r.msg}</p>
                      <p className="text-white/70 text-xs mt-1">
                        توقعك: {prediction.home}-{prediction.away} | النتيجة الفعلية: {match.score_home}-{match.score_away}
                      </p>
                    </div>
                  )
                })()}

                {/* Score input */}
                {!predSaved ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {/* Home */}
                      <div className="flex-1 text-center">
                        <div className="text-2xl mb-1">{homeTeam.flag}</div>
                        <p className="text-xs text-slate-400 mb-2 font-bold truncate">{homeTeam.name}</p>
                        <input
                          type="number" min="0" max="20" value={predHome}
                          onChange={e => setPredHome(Math.max(0, Math.min(20, Number(e.target.value))))}
                          className="w-full text-center text-2xl font-black bg-slate-700/80 border-2 border-slate-600 text-white rounded-xl py-3 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div className="text-slate-400 font-black text-xl flex-shrink-0">-</div>
                      {/* Away */}
                      <div className="flex-1 text-center">
                        <div className="text-2xl mb-1">{awayTeam.flag}</div>
                        <p className="text-xs text-slate-400 mb-2 font-bold truncate">{awayTeam.name}</p>
                        <input
                          type="number" min="0" max="20" value={predAway}
                          onChange={e => setPredAway(Math.max(0, Math.min(20, Number(e.target.value))))}
                          className="w-full text-center text-2xl font-black bg-slate-700/80 border-2 border-slate-600 text-white rounded-xl py-3 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={savePrediction}
                      className="w-full py-3.5 rounded-2xl font-black text-slate-900 text-sm transition-all active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 4px 16px rgba(251,191,36,0.4)' }}
                    >
                      🎯 تأكيد التوقع
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-slate-700/40 rounded-2xl px-4 py-3">
                    <div className="text-center flex-1">
                      <span className="text-2xl">{homeTeam.flag}</span>
                      <p className="text-white font-black text-2xl">{prediction.home}</p>
                    </div>
                    <div className="text-slate-500 font-black text-xl">-</div>
                    <div className="text-center flex-1">
                      <span className="text-2xl">{awayTeam.flag}</span>
                      <p className="text-white font-black text-2xl">{prediction.away}</p>
                    </div>
                    {match.status === 'scheduled' && (
                      <button
                        onClick={() => { setPredSaved(false) }}
                        className="text-slate-500 text-xs underline mr-2"
                      >تعديل</button>
                    )}
                  </div>
                )}
              </div>

              {/* ── Who wins poll ── */}
              <div>
                <h4 className="text-center text-sm font-bold text-slate-300 mb-3">توقع الفائز — صوت جماهيري</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'home', label: homeTeam.name, flag: homeTeam.flag, color: 'from-emerald-600 to-emerald-700' },
                    { key: 'draw', label: 'تعادل', flag: '🤝', color: 'from-slate-600 to-slate-700' },
                    { key: 'away', label: awayTeam.name, flag: awayTeam.flag, color: 'from-blue-600 to-blue-700' },
                  ].map(({ key, label, flag, color }) => (
                    <button
                      key={key}
                      onClick={() => handleVote(key)}
                      disabled={!!userVote}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 ${
                        userVote === key
                          ? `bg-gradient-to-b ${color} border-transparent scale-105 shadow-lg`
                          : userVote
                          ? 'bg-slate-800/50 border-slate-700/50 opacity-60'
                          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-500 active:scale-95'
                      }`}
                    >
                      <span className="text-xl">{flag}</span>
                      <span className="text-xs font-bold text-white text-center leading-tight">{label}</span>
                      {userVote && (
                        <span className="text-xs text-slate-300">{Math.round((votes[key] / totalVotes) * 100)}%</span>
                      )}
                    </button>
                  ))}
                </div>

                {userVote && (
                  <div className="space-y-2 mt-3">
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
                            <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                    <p className="text-center text-xs text-slate-500">إجمالي الأصوات: {totalVotes.toLocaleString('en-US')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

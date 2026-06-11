import { useState, useMemo } from 'react'
import data from '../data/data.json'
import MatchCard from '../components/MatchCard'
import MatchModal from '../components/MatchModal'
import NewsTicker from '../components/NewsTicker'

function getTeam(id) { return data.teams.find(t => t.id === id) }
function getStadium(id) { return data.stadiums.find(s => s.id === id) }

export default function Home({ favoriteTeam }) {
  const [selectedMatch, setSelectedMatch] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  const liveMatches = useMemo(
    () => data.matches.filter(m => m.status === 'live'),
    []
  )

  const todayMatches = useMemo(
    () => data.matches.filter(m => m.date === today && m.status !== 'live'),
    [today]
  )

  const upcomingMatches = useMemo(() => {
    const sorted = data.matches
      .filter(m => m.status === 'scheduled' && m.date > today)
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

    if (favoriteTeam && favoriteTeam !== 'NONE') {
      const favMatches = sorted.filter(m => m.team_home === favoriteTeam || m.team_away === favoriteTeam)
      const others = sorted.filter(m => m.team_home !== favoriteTeam && m.team_away !== favoriteTeam)
      return [...favMatches, ...others].slice(0, 6)
    }
    return sorted.slice(0, 6)
  }, [favoriteTeam, today])

  const recentMatches = useMemo(
    () => data.matches.filter(m => m.status === 'finished').slice(0, 4),
    []
  )

  const favTeamData = favoriteTeam && favoriteTeam !== 'NONE' ? getTeam(favoriteTeam) : null

  return (
    <div className="flex flex-col min-h-full">
      <NewsTicker news={data.news} />

      <div className="flex-1 px-4 py-4 space-y-6 pb-24">
        {favTeamData && (
          <div className="card p-4 border-emerald-500/30 bg-gradient-to-r from-emerald-900/30 to-transparent">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{favTeamData.flag}</span>
              <div>
                <p className="text-xs text-emerald-400 font-bold">منتخبك المفضل</p>
                <p className="text-xl font-black text-white">{favTeamData.name}</p>
                <p className="text-xs text-slate-400">المدرب: {favTeamData.coach}</p>
              </div>
              <div className="mr-auto text-center">
                <div className="text-2xl font-black text-amber-400">{favTeamData.stats.points}</div>
                <div className="text-xs text-slate-400">نقاط</div>
              </div>
            </div>
            <div className="flex gap-3 mt-3 text-xs text-center">
              {[
                { label: 'انتصارات', val: favTeamData.stats.wins, color: 'text-emerald-400' },
                { label: 'تعادل', val: favTeamData.stats.draws, color: 'text-slate-300' },
                { label: 'خسائر', val: favTeamData.stats.losses, color: 'text-red-400' },
                { label: 'أهداف', val: favTeamData.stats.goals_for, color: 'text-amber-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex-1 bg-slate-700/50 rounded-xl p-2">
                  <div className={`text-lg font-black ${color}`}>{val}</div>
                  <div className="text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {liveMatches.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="live-badge">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                مباشر الآن
              </span>
              <span className="text-slate-400 text-sm">{liveMatches.length} مباراة</span>
            </div>
            <div className="space-y-3">
              {liveMatches.map(m => (
                <MatchCard
                  key={m.id}
                  match={m}
                  homeTeam={getTeam(m.team_home)}
                  awayTeam={getTeam(m.team_away)}
                  stadium={getStadium(m.stadium_id)}
                  onClick={() => setSelectedMatch(m)}
                />
              ))}
            </div>
          </section>
        )}

        {todayMatches.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              📅 مباريات اليوم
            </h2>
            <div className="space-y-3">
              {todayMatches.map(m => (
                <MatchCard
                  key={m.id}
                  match={m}
                  homeTeam={getTeam(m.team_home)}
                  awayTeam={getTeam(m.team_away)}
                  stadium={getStadium(m.stadium_id)}
                  onClick={() => setSelectedMatch(m)}
                />
              ))}
            </div>
          </section>
        )}

        {todayMatches.length === 0 && liveMatches.length === 0 && (
          <div className="card p-6 text-center">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-slate-400">لا توجد مباريات اليوم</p>
            <p className="text-slate-500 text-sm mt-1">تحقق من الجدول الزمني أدناه</p>
          </div>
        )}

        {upcomingMatches.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              🗓️ المباريات القادمة
              {favTeamData && <span className="text-xs text-emerald-400 font-normal">({favTeamData.name} أولاً)</span>}
            </h2>
            <div className="space-y-3">
              {upcomingMatches.map(m => (
                <MatchCard
                  key={m.id}
                  match={m}
                  homeTeam={getTeam(m.team_home)}
                  awayTeam={getTeam(m.team_away)}
                  stadium={getStadium(m.stadium_id)}
                  onClick={() => setSelectedMatch(m)}
                />
              ))}
            </div>
          </section>
        )}

        {recentMatches.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-3">🏁 نتائج أخيرة</h2>
            <div className="space-y-3">
              {recentMatches.map(m => (
                <MatchCard
                  key={m.id}
                  match={m}
                  homeTeam={getTeam(m.team_home)}
                  awayTeam={getTeam(m.team_away)}
                  stadium={getStadium(m.stadium_id)}
                  onClick={() => setSelectedMatch(m)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          homeTeam={getTeam(selectedMatch.team_home)}
          awayTeam={getTeam(selectedMatch.team_away)}
          stadium={getStadium(selectedMatch.stadium_id)}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  )
}

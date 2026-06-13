import { useState, useMemo } from 'react'
import MatchCard from '../components/MatchCard'
import MatchModal from '../components/MatchModal'
import { useWorldCupData } from '../context/WorldCupContext'

const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'live', label: '🔴 مباشر' },
  { id: 'scheduled', label: '📅 قادم' },
  { id: 'finished', label: '✅ انتهت' },
]

export default function Matches({ favoriteTeams = [] }) {
  const { data } = useWorldCupData()
  const { teams, matches, stadiums } = data

  const [filter, setFilter] = useState('all')
  const [selectedMatch, setSelectedMatch] = useState(null)

  const getTeam = id => teams.find(t => t.id === id)
  const getStadium = id => stadiums.find(s => s.id === id)

  const filtered = useMemo(() => {
    let list = matches
    if (filter !== 'all') {
      list = list.filter(m =>
        filter === 'finished'
          ? (m.status === 'finished' || m.status === 'pending')
          : m.status === filter
      )
    }
    return list.sort((a, b) => {
      const order = { live: 0, scheduled: 1, finished: 2, pending: 2 }
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
      return `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
    })
  }, [matches, filter])

  return (
    <div className="px-4 py-4 pb-24 space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === f.id
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(m => (
          <MatchCard
            key={m.id}
            match={m}
            homeTeam={getTeam(m.team_home)}
            awayTeam={getTeam(m.team_away)}
            stadium={getStadium(m.stadium_id)}
            onClick={() => setSelectedMatch(m)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>لا توجد مباريات بهذا الفلتر</p>
          </div>
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

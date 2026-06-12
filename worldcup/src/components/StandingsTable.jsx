import { useWorldCupData } from '../context/WorldCupContext'

export default function StandingsTable({ groupId, favoriteTeams = [] }) {
  const { data } = useWorldCupData()

  const teams = data.teams
    .filter(t => t.group === groupId)
    .sort((a, b) => {
      if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points
      const gdA = (a.stats.goals_for ?? 0) - (a.stats.goals_against ?? 0)
      const gdB = (b.stats.goals_for ?? 0) - (b.stats.goals_against ?? 0)
      if (gdB !== gdA) return gdB - gdA
      return (b.stats.goals_for ?? 0) - (a.stats.goals_for ?? 0)
    })

  if (teams.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-500 border-b border-slate-700/50">
            <th className="text-right py-2 font-medium">#</th>
            <th className="text-right py-2 font-medium ps-2">المنتخب</th>
            <th className="text-center py-2 font-medium w-8">ل</th>
            <th className="text-center py-2 font-medium w-8">ف</th>
            <th className="text-center py-2 font-medium w-8">ت</th>
            <th className="text-center py-2 font-medium w-8">خ</th>
            <th className="text-center py-2 font-medium w-8">ف+</th>
            <th className="text-center py-2 font-medium w-8">ف-</th>
            <th className="text-center py-2 font-bold text-amber-400 w-8">ن</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => (
            <tr
              key={team.id}
              className={`border-b border-slate-800/50 ${
                favoriteTeams.includes(team.id) ? 'bg-emerald-400/5' : ''
              } ${i < 2 ? 'opacity-100' : 'opacity-70'}`}
            >
              <td className="py-2.5 text-slate-500 font-bold">{i + 1}</td>
              <td className="py-2.5 ps-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{team.flag}</span>
                  <span className={`font-medium ${favoriteTeams.includes(team.id) ? 'text-emerald-400' : 'text-white'}`}>
                    {team.name}
                  </span>
                  {favoriteTeams.includes(team.id) && <span className="text-emerald-400 text-xs">★</span>}
                </div>
              </td>
              <td className="text-center py-2.5 text-slate-300">{team.stats.played ?? 0}</td>
              <td className="text-center py-2.5 text-emerald-400">{team.stats.wins ?? 0}</td>
              <td className="text-center py-2.5 text-slate-300">{team.stats.draws ?? 0}</td>
              <td className="text-center py-2.5 text-red-400">{team.stats.losses ?? 0}</td>
              <td className="text-center py-2.5 text-slate-300">{team.stats.goals_for ?? 0}</td>
              <td className="text-center py-2.5 text-slate-300">{team.stats.goals_against ?? 0}</td>
              <td className="text-center py-2.5 font-black text-amber-400">{team.stats.points ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

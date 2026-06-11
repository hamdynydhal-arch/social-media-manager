// football-data.org v4  — set VITE_FOOTBALL_API_KEY in .env for live data
// Without a key the app runs on real 2026 static data (no hallucinations).
const BASE = 'https://api.football-data.org/v4'
const KEY = import.meta.env.VITE_FOOTBALL_API_KEY

export const IS_DEMO = !KEY || KEY === 'DEMO_KEY_2026'

// Mapping football-data.org full team names → our short IDs
const FD_NAME_TO_ID = {
  'United States': 'USA', 'Canada': 'CAN', 'Mexico': 'MEX',
  'Croatia': 'CRO', 'Ecuador': 'ECU', 'Panama': 'PAN',
  'Serbia': 'SRB', 'Morocco': 'MAR', 'New Zealand': 'NZL',
  'Turkey': 'TUR', 'Algeria': 'ALG', 'Jamaica': 'JAM',
  'Argentina': 'ARG', 'Australia': 'AUS', 'Jordan': 'JOR', 'Hungary': 'HUN',
  'France': 'FRA', 'Uruguay': 'URU', 'Japan': 'JPN', 'Bolivia': 'BOL',
  'Spain': 'ESP', 'Colombia': 'COL', 'Iraq': 'IRQ', 'Honduras': 'HON',
  'England': 'ENG', 'South Korea': 'KOR', 'Nigeria': 'NGA', 'Venezuela': 'VEN',
  'Germany': 'GER', 'Switzerland': 'SUI', 'Senegal': 'SEN', 'Egypt': 'EGY',
  'Portugal': 'POR', 'Austria': 'AUT', 'Iran': 'IRN', 'Cameroon': 'CMR',
  'Brazil': 'BRA', 'Ukraine': 'UKR', 'Saudi Arabia': 'KSA', 'Tunisia': 'TUN',
  'Netherlands': 'NED', 'Scotland': 'SCO', 'Uzbekistan': 'UZB', 'South Africa': 'RSA',
  'Belgium': 'BEL', 'Poland': 'POL', 'Chile': 'CHI', "Côte d'Ivoire": 'CIV',
}

async function apiFetch(path) {
  if (IS_DEMO) return null
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'X-Auth-Token': KEY },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function transformMatch(m) {
  const homeId = FD_NAME_TO_ID[m.homeTeam?.name]
  const awayId = FD_NAME_TO_ID[m.awayTeam?.name]
  if (!homeId || !awayId) return null

  const statusMap = { SCHEDULED: 'scheduled', IN_PLAY: 'live', PAUSED: 'live', FINISHED: 'finished', POSTPONED: 'scheduled' }
  const dt = new Date(m.utcDate)

  return {
    _apiId: String(m.id),
    date: dt.toISOString().split('T')[0],
    time: dt.toISOString().split('T')[1].slice(0, 5),
    status: statusMap[m.status] ?? 'scheduled',
    minute: m.minute ?? null,
    team_home: homeId,
    team_away: awayId,
    score_home: m.score?.fullTime?.home ?? null,
    score_away: m.score?.fullTime?.away ?? null,
    group: m.group?.replace('GROUP_', '') ?? null,
    matchday: m.matchday ?? null,
  }
}

function transformStanding(row, group) {
  const teamId = FD_NAME_TO_ID[row.team?.name]
  if (!teamId) return null
  return {
    teamId,
    group,
    position: row.position,
    played: row.playedGames,
    wins: row.won,
    draws: row.draw,
    losses: row.lost,
    goals_for: row.goalsFor,
    goals_against: row.goalsAgainst,
    goal_diff: row.goalDifference,
    points: row.points,
  }
}

// Returns array of transformed matches or null on failure/demo mode
export async function fetchApiMatches() {
  const json = await apiFetch('/competitions/WC/matches?season=2026')
  if (!json?.matches) return null
  return json.matches.map(transformMatch).filter(Boolean)
}

// Returns flat array of standing rows or null on failure/demo mode
export async function fetchApiStandings() {
  const json = await apiFetch('/competitions/WC/standings?season=2026')
  if (!json?.standings) return null
  return json.standings
    .filter(s => s.type === 'TOTAL')
    .flatMap(s => {
      const grp = s.group?.replace('GROUP_', '') ?? ''
      return s.table.map(row => transformStanding(row, grp)).filter(Boolean)
    })
}

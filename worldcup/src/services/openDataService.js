/**
 * Open, no-auth data sources for FIFA World Cup 2026:
 *  1. ESPN public API  – live match scores (no key)
 *  2. rss2json.com     – converts BBC Sport / ESPN RSS to JSON (no key, 1000 req/day free)
 *  3. AllOrigins proxy – CORS bypass if ESPN blocks direct browser calls
 */

// ── Endpoints ──────────────────────────────────────────────────────────────
const ESPN_SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'
const ESPN_STANDINGS  = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/standings'
const ALLORIGINS      = url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
const CORSPROXY      = url => `https://corsproxy.io/?${encodeURIComponent(url)}`
const ALLORIGINS_GET = url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
const RSS2JSON        = url => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=20`

const RSS_FEEDS = [
  'https://feeds.bbci.co.uk/sport/football/rss.xml',
  'https://www.espn.com/espn/rss/soccer/news',
  'https://www.goal.com/en/feeds/news',
]

// ── Team code mappings ──────────────────────────────────────────────────────
const ESPN_ABBR_MAP = {
  USA: 'USA', USMNT: 'USA', CAN: 'CAN', MEX: 'MEX',
  CRO: 'CRO', ECU: 'ECU', PAN: 'PAN',
  SRB: 'SRB', MAR: 'MAR', NZL: 'NZL',
  TUR: 'TUR', ALG: 'ALG', JAM: 'JAM',
  ARG: 'ARG', AUS: 'AUS', JOR: 'JOR', HUN: 'HUN',
  FRA: 'FRA', URU: 'URU', JPN: 'JPN', BOL: 'BOL',
  ESP: 'ESP', COL: 'COL', IRQ: 'IRQ', HON: 'HON',
  ENG: 'ENG', KOR: 'KOR', SKO: 'KOR', NGA: 'NGA', VEN: 'VEN',
  GER: 'GER', SUI: 'SUI', SWI: 'SUI', SEN: 'SEN', EGY: 'EGY',
  POR: 'POR', AUT: 'AUT', IRN: 'IRN', CMR: 'CMR',
  BRA: 'BRA', UKR: 'UKR', KSA: 'KSA', SAU: 'KSA', TUN: 'TUN',
  NED: 'NED', SCO: 'SCO', UZB: 'UZB', RSA: 'RSA',
  BEL: 'BEL', POL: 'POL', CHI: 'CHI', CIV: 'CIV', CIV2: 'CIV',
}

const ESPN_NAME_MAP = {
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
  'Belgium': 'BEL', 'Poland': 'POL', 'Chile': 'CHI',
  "Côte d'Ivoire": 'CIV', 'Ivory Coast': 'CIV', "Cote d'Ivoire": 'CIV',
}

const ESPN_STATUS_MAP = {
  STATUS_SCHEDULED: 'scheduled',
  STATUS_IN_PROGRESS: 'live',
  STATUS_HALFTIME: 'live',
  STATUS_END_PERIOD: 'live',
  STATUS_FINAL: 'finished',
  STATUS_FULL_TIME: 'finished',
  STATUS_POSTPONED: 'scheduled',
}

// ── Fetch helpers ────────────────────────────────────────────────────────────
async function safeFetch(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// Try direct, then proxy if CORS blocks it
async function fetchWithFallback(url) {
  const direct = await safeFetch(url)
  if (direct) return direct
  const raw = await safeFetch(ALLORIGINS(url))
  if (raw) return raw
  const cors = await safeFetch(CORSPROXY(url))
  if (cors) return cors
  const get = await safeFetch(ALLORIGINS_GET(url))
  if (get?.contents) {
    try { return JSON.parse(get.contents) } catch { return null }
  }
  return null
}

// ── ESPN Live Scores ─────────────────────────────────────────────────────────
export async function fetchEspnMatches() {
  const json = await fetchWithFallback(ESPN_SCOREBOARD)
  if (!json?.events?.length) return null

  const matches = []
  for (const event of json.events) {
    const comp = event.competitions?.[0]
    if (!comp) continue

    const homeComp = comp.competitors?.find(c => c.homeAway === 'home')
    const awayComp = comp.competitors?.find(c => c.homeAway === 'away')
    if (!homeComp || !awayComp) continue

    const homeId = ESPN_ABBR_MAP[homeComp.team?.abbreviation] || ESPN_NAME_MAP[homeComp.team?.displayName]
    const awayId = ESPN_ABBR_MAP[awayComp.team?.abbreviation] || ESPN_NAME_MAP[awayComp.team?.displayName]
    if (!homeId || !awayId) continue

    const statusName = comp.status?.type?.name ?? 'STATUS_SCHEDULED'
    const status = ESPN_STATUS_MAP[statusName] ?? 'scheduled'
    const isActive = status !== 'scheduled'

    matches.push({
      team_home: homeId,
      team_away: awayId,
      status,
      minute: status === 'live' ? comp.status?.displayClock ?? null : null,
      score_home: isActive ? parseInt(homeComp.score ?? 0, 10) : null,
      score_away: isActive ? parseInt(awayComp.score ?? 0, 10) : null,
    })
  }
  return matches.length > 0 ? matches : null
}

// ── ESPN Standings ───────────────────────────────────────────────────────────
export async function fetchEspnStandings() {
  const json = await fetchWithFallback(ESPN_STANDINGS)
  if (!json?.standings?.entries?.length && !json?.children) return null

  // ESPN groups standings under children[].standings.entries[]
  const groups = json.children ?? []
  const rows = []
  for (const grp of groups) {
    const entries = grp.standings?.entries ?? []
    for (const entry of entries) {
      const teamId = ESPN_ABBR_MAP[entry.team?.abbreviation] || ESPN_NAME_MAP[entry.team?.displayName]
      if (!teamId) continue
      const stats = Object.fromEntries((entry.stats ?? []).map(s => [s.name, s.value]))
      rows.push({
        teamId,
        played: stats.gamesPlayed ?? 0,
        wins: stats.wins ?? 0,
        draws: stats.ties ?? 0,
        losses: stats.losses ?? 0,
        goals_for: stats.pointsFor ?? stats.goalsScored ?? 0,
        goals_against: stats.pointsAgainst ?? stats.goalsConceded ?? 0,
        points: stats.points ?? 0,
      })
    }
  }
  return rows.length > 0 ? rows : null
}

// ── RSS News Feed ────────────────────────────────────────────────────────────
export async function fetchRssNews() {
  for (const feed of RSS_FEEDS) {
    try {
      const json = await safeFetch(RSS2JSON(feed))
      if (json?.status === 'ok' && json.items?.length > 0) {
        return json.items.slice(0, 20).map(item => {
          const title = item.title?.trim() ?? ''
          // Prepend time if available
          const pub = item.pubDate ? new Date(item.pubDate) : null
          const time = pub ? pub.toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' }) : ''
          return time ? `${time} — ${title}` : title
        }).filter(Boolean)
      }
    } catch {
      // try next feed
    }
  }
  return null
}

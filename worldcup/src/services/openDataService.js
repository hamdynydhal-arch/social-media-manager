/**
 * Data sources for FIFA World Cup 2026 — all CORS-friendly, no API keys:
 *
 *  PRIMARY  → openfootball/worldcup.json on GitHub raw
 *             Auto-updated after every match. CORS: * (GitHub CDN).
 *
 *  LIVE     → Sofascore public API (no key; used by sofascore.com's own web app,
 *             so it has permissive CORS from browsers). Returns real-time scores,
 *             match status (1st half / HT / 2nd half / finished), and live minute.
 *             Falls back silently when unreachable.
 *
 *  NEWS     → rss2json.com (free, 1 000 req/day) with Arabic RSS feeds first,
 *             then feed2json.org as secondary converter, then English fallbacks.
 *
 *  FALLBACK → ESPN scoreboard via proxy chain when the above have no data yet.
 */

// ── Primary: openfootball GitHub raw (no CORS issues) ─────────────────────────
const OFB_MATCHES = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'

// ── Live scores: Sofascore public API ─────────────────────────────────────────
// Used by sofascore.com's React web app → CORS-open from browsers.
// Returns live minute, real-time status (1st half / HT / 2nd half / finished),
// and current score. No API key required.
const SFS_LIVE = 'https://api.sofascore.com/api/v1/sport/football/live'
const SFS_DATE = d => `https://api.sofascore.com/api/v1/sport/football/scheduled-events/${d}`

// Sofascore status codes → our status
const SFS_STATUS = {
  0: 'scheduled', 1: 'scheduled',
  6: 'live',   // 1st half
  7: 'live',   // 2nd half
  30: 'live',  // halftime (shown as 'live' with minute='HT')
  31: 'live',  // extra time 1st half
  32: 'live',  // extra time HT
  33: 'live',  // extra time 2nd half
  100: 'finished', 110: 'finished', 120: 'finished',
}

// All 48 WC 2026 teams for filtering Sofascore's universe of events
const WC_TEAM_SET = new Set([
  'MEX','RSA','KOR','CZE','CAN','BIH','QAT','SUI',
  'BRA','MAR','HAI','SCO','USA','PAR','AUS','TUR',
  'GER','CUW','CIV','ECU','NED','JPN','SWE','TUN',
  'BEL','EGY','IRN','NZL','ESP','CPV','KSA','URU',
  'FRA','SEN','IRQ','NOR','ARG','ALG','AUT','JOR',
  'POR','COD','UZB','COL','ENG','CRO','GHA','PAN',
])

// Sofascore team display name → our internal ID
const SFS_TEAM_MAP = {
  'Mexico': 'MEX', 'South Africa': 'RSA',
  'South Korea': 'KOR', 'Korea Republic': 'KOR',
  'Czech Republic': 'CZE', 'Czechia': 'CZE',
  'Canada': 'CAN',
  'Bosnia & Herzegovina': 'BIH', 'Bosnia and Herzegovina': 'BIH',
  'Bosnia-Herzegovina': 'BIH',
  'Qatar': 'QAT', 'Switzerland': 'SUI',
  'Brazil': 'BRA', 'Morocco': 'MAR', 'Haiti': 'HAI', 'Scotland': 'SCO',
  'USA': 'USA', 'United States': 'USA',
  'Paraguay': 'PAR', 'Australia': 'AUS',
  'Turkey': 'TUR', 'Türkiye': 'TUR',
  'Germany': 'GER', 'Curaçao': 'CUW', 'Curacao': 'CUW',
  "Côte d'Ivoire": 'CIV', "Cote d'Ivoire": 'CIV', 'Ivory Coast': 'CIV',
  'Ecuador': 'ECU', 'Netherlands': 'NED', 'Japan': 'JPN',
  'Sweden': 'SWE', 'Tunisia': 'TUN', 'Belgium': 'BEL', 'Egypt': 'EGY',
  'Iran': 'IRN', 'New Zealand': 'NZL', 'Spain': 'ESP',
  'Cape Verde': 'CPV', 'Saudi Arabia': 'KSA', 'Uruguay': 'URU',
  'France': 'FRA', 'Senegal': 'SEN', 'Iraq': 'IRQ', 'Norway': 'NOR',
  'Argentina': 'ARG', 'Algeria': 'ALG', 'Austria': 'AUT', 'Jordan': 'JOR',
  'Portugal': 'POR',
  'DR Congo': 'COD', 'Congo DR': 'COD', 'Democratic Republic of Congo': 'COD',
  'Congo': 'COD',
  'Uzbekistan': 'UZB', 'Colombia': 'COL', 'England': 'ENG',
  'Croatia': 'CRO', 'Ghana': 'GHA', 'Panama': 'PAN',
}

// ── Secondary: ESPN scoreboard (often CORS-blocked, used as last resort) ──────
const ESPN_SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'

// ── CORS proxy chain (ESPN fallback only) ─────────────────────────────────────
const THINGPROXY    = url => `https://thingproxy.freeboard.io/fetch/${url}`
const ALLORIGINS    = url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
const CORSPROXY     = url => `https://corsproxy.io/?${encodeURIComponent(url)}`
const ALLORIGINS_GET = url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`

// ── RSS-to-JSON services ───────────────────────────────────────────────────────
const RSS2JSON   = url => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=15`
const FEED2JSON  = url => `https://feed2json.org/convert?url=${encodeURIComponent(url)}`

// BBC/Sky first (CDN often serves with CORS *), then Arabic sources
const RSS_FEEDS = [
  'https://feeds.bbci.co.uk/sport/football/rss.xml',
  'https://www.skysports.com/rss/12040',
  'https://feeds.bbci.co.uk/arabic/sport/rss.xml',
  'https://www.aljazeera.net/rss/sports.xml',
  'https://www.goal.com/en/feeds/news',
]

// Reddit r/worldcup JSON API — CORS * guaranteed, no proxy needed
const REDDIT_WC = 'https://www.reddit.com/r/worldcup/new.json?limit=20&t=day'

// ── openfootball team name → our internal ID (all 48 WC 2026 teams) ───────────
const OFB_TEAM_MAP = {
  // Group A
  'Mexico':           'MEX', 'South Africa':        'RSA',
  'South Korea':      'KOR', 'Czech Republic':      'CZE',
  // Group B
  'Canada':           'CAN', 'Bosnia & Herzegovina':'BIH',
  'Bosnia and Herzegovina': 'BIH',
  'Qatar':            'QAT', 'Switzerland':         'SUI',
  // Group C
  'Brazil':           'BRA', 'Morocco':             'MAR',
  'Haiti':            'HAI', 'Scotland':            'SCO',
  // Group D
  'USA':              'USA', 'United States':       'USA',
  'Paraguay':         'PAR', 'Australia':           'AUS',
  'Turkey':           'TUR', 'Türkiye':             'TUR',
  // Group E
  'Germany':          'GER', 'Curaçao':             'CUW',
  'Curacao':          'CUW', "Côte d'Ivoire":       'CIV',
  "Cote d'Ivoire":    'CIV', 'Ivory Coast':         'CIV',
  'Ecuador':          'ECU',
  // Group F
  'Netherlands':      'NED', 'Japan':               'JPN',
  'Sweden':           'SWE', 'Tunisia':             'TUN',
  // Group G
  'Belgium':          'BEL', 'Egypt':               'EGY',
  'Iran':             'IRN', 'New Zealand':         'NZL',
  // Group H
  'Spain':            'ESP', 'Cape Verde':          'CPV',
  'Saudi Arabia':     'KSA', 'Uruguay':             'URU',
  // Group I
  'France':           'FRA', 'Senegal':             'SEN',
  'Iraq':             'IRQ', 'Norway':              'NOR',
  // Group J
  'Argentina':        'ARG', 'Algeria':             'ALG',
  'Austria':          'AUT', 'Jordan':              'JOR',
  // Group K
  'Portugal':         'POR', 'DR Congo':            'COD',
  'Congo DR':         'COD', 'Democratic Republic of Congo': 'COD',
  'Uzbekistan':       'UZB', 'Colombia':            'COL',
  // Group L
  'England':          'ENG', 'Croatia':             'CRO',
  'Ghana':            'GHA', 'Panama':              'PAN',
}

// ── ESPN abbreviation/name maps (kept for ESPN fallback) ─────────────────────
const ESPN_ABBR_MAP = {
  USA: 'USA', USMNT: 'USA', CAN: 'CAN', MEX: 'MEX', RSA: 'RSA',
  CRO: 'CRO', ECU: 'ECU', PAN: 'PAN', CZE: 'CZE', BIH: 'BIH',
  QAT: 'QAT', BRA: 'BRA', MAR: 'MAR', HAI: 'HAI', SCO: 'SCO',
  PAR: 'PAR', AUS: 'AUS', TUR: 'TUR', GER: 'GER', CUW: 'CUW',
  CIV: 'CIV', NED: 'NED', JPN: 'JPN', SWE: 'SWE', TUN: 'TUN',
  BEL: 'BEL', EGY: 'EGY', IRN: 'IRN', NZL: 'NZL', ESP: 'ESP',
  CPV: 'CPV', KSA: 'KSA', SAU: 'KSA', URU: 'URU', FRA: 'FRA',
  SEN: 'SEN', IRQ: 'IRQ', NOR: 'NOR', ARG: 'ARG', ALG: 'ALG',
  AUT: 'AUT', JOR: 'JOR', POR: 'POR', COD: 'COD', UZB: 'UZB',
  COL: 'COL', ENG: 'ENG', GHA: 'GHA', KOR: 'KOR', SKO: 'KOR',
  SUI: 'SUI', SWI: 'SUI',
}

const ESPN_STATUS_MAP = {
  STATUS_SCHEDULED:  'scheduled',
  STATUS_IN_PROGRESS: 'live',
  STATUS_HALFTIME:   'live',
  STATUS_END_PERIOD: 'live',
  STATUS_FINAL:      'finished',
  STATUS_FULL_TIME:  'finished',
  STATUS_POSTPONED:  'scheduled',
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────
async function safeFetch(url, ms = 10000) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(ms) })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function safeText(url, ms = 10000) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(ms) })
    if (!res.ok) return null
    return res.text()
  } catch {
    return null
  }
}

// ESPN-only fallback: try proxy chain
async function fetchWithProxy(url) {
  const direct = await safeFetch(url)
  if (direct) return direct
  const t = await safeFetch(THINGPROXY(url))
  if (t) return t
  const r = await safeFetch(ALLORIGINS(url))
  if (r) return r
  const c = await safeFetch(CORSPROXY(url))
  if (c) return c
  const g = await safeFetch(ALLORIGINS_GET(url))
  if (g?.contents) { try { return JSON.parse(g.contents) } catch { return null } }
  return null
}

// ── ESPN summary URL ──────────────────────────────────────────────────────────
const ESPN_SUMMARY = id => `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${id}`

// ── ESPN stats/lineup parsing helpers ────────────────────────────────────────
function parseEspnBoxscoreStats(teams) {
  if (!teams?.length) return null
  const out = {}
  for (const t of teams) {
    const side = t.homeAway === 'home' ? 'home' : 'away'
    const s = {}
    for (const stat of t.statistics ?? []) {
      const v = parseFloat(stat.displayValue?.replace('%', '')) || 0
      switch (stat.name) {
        case 'possessionPct':   s.possession       = v; break
        case 'totalShots':      s.shots            = v; break
        case 'shotsOnTarget':   s.shots_on_target  = v; break
        case 'cornerKicks':     s.corners          = v; break
        case 'fouls':           s.fouls            = v; break
        case 'yellowCards':     s.yellow_cards     = v; break
        case 'redCards':        s.red_cards        = v; break
        case 'offsides':        s.offsides         = v; break
        case 'saves':           s.saves            = v; break
      }
    }
    if (Object.keys(s).length > 0) out[side] = s
  }
  return Object.keys(out).length === 2 ? out : null
}

function parseEspnRosters(rosters) {
  if (!rosters?.length) return null
  const out = {}
  for (const r of rosters) {
    const side = r.homeAway === 'home' ? 'home' : 'away'
    if (r.formation) out[`formation_${side}`] = r.formation
    const starters = (r.athletes ?? [])
      .filter(a => a.starter !== false)
      .map(a => ({
        number:   a.jersey ?? '',
        name:     a.athlete?.displayName ?? '',
        position: a.position?.abbreviation ?? '',
      }))
      .filter(a => a.name)
    if (starters.length > 0) out[side] = starters
  }
  return (out.home || out.away) ? out : null
}

// ── PRIMARY: openfootball match data ─────────────────────────────────────────
async function fetchOpenfootballMatches() {
  // Try direct GitHub CDN first, then proxy chain if ISP blocks it
  let json = await safeFetch(OFB_MATCHES, 18000)
  if (!json) json = await safeFetch(CORSPROXY(OFB_MATCHES), 12000)
  if (!json) json = await safeFetch(ALLORIGINS(OFB_MATCHES), 12000)
  if (!json) json = await safeFetch(THINGPROXY(OFB_MATCHES), 12000)
  if (!json) return null  // all routes failed → truly unreachable

  // openfootball 2026 uses rounds[].matches, not a flat matches array
  const allMatches = json.matches?.length
    ? json.matches
    : (json.rounds ?? []).flatMap(r => r.matches ?? [])

  const result = []
  for (const m of allMatches) {
    const homeId = OFB_TEAM_MAP[m.team1]
    const awayId = OFB_TEAM_MAP[m.team2]
    if (!homeId || !awayId) continue

    if (!m.score?.ft) continue

    const sh = m.score.ft[0]
    const sa = m.score.ft[1]
    const htH = m.score.ht?.[0] ?? null
    const htA = m.score.ht?.[1] ?? null

    const goals = [
      ...(m.goals1 ?? []).map(g => ({
        team: homeId, player: g.name,
        minute: parseInt(g.minute) || 0,
        type: g.owngoal ? 'هدف ذاتي' : 'عادي',
      })),
      ...(m.goals2 ?? []).map(g => ({
        team: awayId, player: g.name,
        minute: parseInt(g.minute) || 0,
        type: g.owngoal ? 'هدف ذاتي' : 'عادي',
      })),
    ].sort((a, b) => a.minute - b.minute)

    result.push({
      team_home: homeId, team_away: awayId,
      status: 'finished',
      score_home: sh, score_away: sa,
      score_ht_home: htH, score_ht_away: htA,
      goals,
    })
  }
  return result  // [] = source reachable but no finished matches yet
}

// ── SECONDARY: ESPN scoreboard — returns event IDs + live scores ──────────────
async function fetchEspnScoreboard() {
  // Try multiple date ranges so we capture live + recently-finished matches
  const today    = new Date()
  const yyyymmdd = d => d.toISOString().slice(0,10).replace(/-/g,'')
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)

  for (const date of [yyyymmdd(today), yyyymmdd(yesterday)]) {
    const url  = `${ESPN_SCOREBOARD}?dates=${date}&limit=20`
    const json = await fetchWithProxy(url)
    if (!json?.events?.length) continue

    const events = []
    for (const ev of json.events) {
      const comp = ev.competitions?.[0]
      if (!comp) continue
      const homeComp = comp.competitors?.find(c => c.homeAway === 'home')
      const awayComp = comp.competitors?.find(c => c.homeAway === 'away')
      if (!homeComp || !awayComp) continue
      const homeId = ESPN_ABBR_MAP[homeComp.team?.abbreviation]
      const awayId = ESPN_ABBR_MAP[awayComp.team?.abbreviation]
      if (!homeId || !awayId) continue
      const statusName = comp.status?.type?.name ?? 'STATUS_SCHEDULED'
      const status     = ESPN_STATUS_MAP[statusName] ?? 'scheduled'
      events.push({
        eventId: ev.id, team_home: homeId, team_away: awayId, status,
        minute:     status === 'live' ? (comp.status?.displayClock ?? null) : null,
        score_home: parseInt(homeComp.score ?? 0, 10),
        score_away: parseInt(awayComp.score ?? 0, 10),
      })
    }
    if (events.length > 0) return events
  }
  return null
}

// ── Sofascore live events (real-time — updates every few seconds) ─────────────
async function fetchSofascoreEvents() {
  const today = new Date().toISOString().slice(0, 10)
  const yest  = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

  // Fetch live + today's schedule + yesterday (for matches that started before midnight UTC)
  const [liveJson, todayJson, yestJson] = await Promise.all([
    safeFetch(SFS_LIVE),
    safeFetch(SFS_DATE(today)),
    safeFetch(SFS_DATE(yest)),
  ])

  // Merge all events; live API takes priority (has real-time minute)
  const allEventsMap = new Map()
  for (const ev of [...(yestJson?.events ?? []), ...(todayJson?.events ?? [])]) {
    allEventsMap.set(ev.id, ev)
  }
  for (const ev of liveJson?.events ?? []) {
    allEventsMap.set(ev.id, ev)  // live version overrides scheduled
  }

  if (!allEventsMap.size) return null

  const result = []
  for (const ev of allEventsMap.values()) {
    const homeId = SFS_TEAM_MAP[ev.homeTeam?.name] ?? SFS_TEAM_MAP[ev.homeTeam?.shortName]
    const awayId = SFS_TEAM_MAP[ev.awayTeam?.name] ?? SFS_TEAM_MAP[ev.awayTeam?.shortName]
    if (!homeId || !awayId) continue
    if (!WC_TEAM_SET.has(homeId) || !WC_TEAM_SET.has(awayId)) continue

    const code   = ev.status?.code ?? 0
    const status = SFS_STATUS[code] ?? 'scheduled'

    // Real match minute from Sofascore (updates every ~30 s in their API)
    let minute = null
    if (status === 'live') {
      if (code === 30 || code === 32) {
        minute = 'HT'
      } else {
        const played = ev.time?.played
        if (played != null) minute = `${played}'`
      }
    }

    const htH = ev.homeScore?.period1 ?? null
    const htA = ev.awayScore?.period1 ?? null

    result.push({
      team_home: homeId, team_away: awayId,
      status, minute,
      score_home: ev.homeScore?.current ?? null,
      score_away: ev.awayScore?.current ?? null,
      score_ht_home: status !== 'scheduled' ? htH : null,
      score_ht_away: status !== 'scheduled' ? htA : null,
    })
  }
  return result.length > 0 ? result : null
}

// ── Public: fetch all match scores (openfootball + Sofascore + ESPN) ──────────
export async function fetchEspnMatches() {
  const [ofb, sfsEvents, espnEvents] = await Promise.all([
    fetchOpenfootballMatches(),
    fetchSofascoreEvents(),   // real-time live minutes — highest priority for live data
    fetchEspnScoreboard(),    // ESPN fallback
  ])

  if (ofb === null && sfsEvents === null && espnEvents === null) return null

  const merged = [...(ofb ?? [])]

  // Sofascore: apply live status/minute/score; never downgrade confirmed-finished to scheduled
  for (const ev of sfsEvents ?? []) {
    const idx = merged.findIndex(m => m.team_home === ev.team_home && m.team_away === ev.team_away)
    if (idx >= 0) {
      const cur = merged[idx]
      merged[idx] = {
        ...cur,
        status:        ev.status !== 'scheduled' ? ev.status : cur.status,
        minute:        ev.minute  ?? cur.minute,
        score_home:    ev.score_home  != null ? ev.score_home  : cur.score_home,
        score_away:    ev.score_away  != null ? ev.score_away  : cur.score_away,
        score_ht_home: ev.score_ht_home != null ? ev.score_ht_home : cur.score_ht_home,
        score_ht_away: ev.score_ht_away != null ? ev.score_ht_away : cur.score_ht_away,
      }
    } else if (ev.status !== 'scheduled') {
      merged.push(ev)
    }
  }

  // ESPN as additional fallback
  for (const ev of espnEvents ?? []) {
    const idx = merged.findIndex(m => m.team_home === ev.team_home && m.team_away === ev.team_away)
    if (idx >= 0) {
      merged[idx] = { ...merged[idx], ...ev }
    } else if (ev.status !== 'scheduled') {
      merged.push(ev)
    }
  }

  return merged
}

// ── Public: fetch detailed stats + lineups for live/finished matches ──────────
// Uses ESPN summary API (often CORS-blocked; silently returns null if unavailable).
// Caller caches successful results so this is only re-fetched when data is missing.
export async function fetchMatchDetails(activeMatchKeys) {
  const events = await fetchEspnScoreboard()
  if (!events?.length) return null

  const details = {}
  for (const ev of events) {
    if (ev.status === 'scheduled') continue
    const key = `${ev.team_home}_${ev.team_away}`
    if (activeMatchKeys && !activeMatchKeys.has(key)) continue

    const summary = await fetchWithProxy(ESPN_SUMMARY(ev.eventId))
    if (!summary) continue

    const stats  = parseEspnBoxscoreStats(summary.boxscore?.teams)
    const lineup = parseEspnRosters(summary.rosters)
    if (stats || lineup) details[key] = { stats, lineup }
  }
  return Object.keys(details).length > 0 ? details : null
}

// ── Public: standings — calculated locally, API not needed ───────────────────
export async function fetchEspnStandings() {
  return null
}

// ── Parse raw RSS/Atom XML ────────────────────────────────────────────────────
function parseRssXml(xmlText) {
  try {
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml')
    if (doc.querySelector('parsererror')) return null
    const items = [...doc.querySelectorAll('item, entry')]
    if (!items.length) return null
    return items.slice(0, 15).map(el => {
      const title = (el.querySelector('title')?.textContent ?? '').trim()
      const pub   = el.querySelector('pubDate, updated, published')?.textContent
      const time  = pub
        ? new Date(pub).toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' })
        : ''
      return time ? `${time} — ${title}` : title
    }).filter(Boolean)
  } catch { return null }
}

// ── Reddit r/worldcup — CORS * guaranteed ────────────────────────────────────
async function fetchRedditNews() {
  const json = await safeFetch(REDDIT_WC)
  if (!json?.data?.children?.length) return null
  const items = json.data.children
    .map(post => {
      const d = post.data
      if (d.score < 5) return null
      const time = new Date(d.created_utc * 1000)
        .toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' })
      return `${time} — ${d.title}`
    })
    .filter(Boolean)
    .slice(0, 15)
  return items.length > 0 ? items : null
}

// ── Public: news feed ─────────────────────────────────────────────────────────
export async function fetchRssNews() {
  // Try Reddit first — CORS * guaranteed, no proxy needed, fast
  const reddit = await fetchRedditNews()
  if (reddit) return reddit

  // Fallback: RSS feeds via proxy chain
  for (const feed of RSS_FEEDS) {
    // 0. Direct (BBC/Sky CDN often serves with CORS *)
    const direct = await safeText(feed)
    if (direct) {
      const items = parseRssXml(direct)
      if (items?.length > 0) return items
    }
    // 1. corsproxy.io — good IP reputation, no rate limit
    const c1 = await safeText(CORSPROXY(feed))
    if (c1) {
      const items = parseRssXml(c1)
      if (items?.length > 0) return items
    }
    // 2. allorigins /raw
    const c2 = await safeText(ALLORIGINS(feed))
    if (c2) {
      const items = parseRssXml(c2)
      if (items?.length > 0) return items
    }
    // 3. thingproxy
    const c3 = await safeText(THINGPROXY(feed))
    if (c3) {
      const items = parseRssXml(c3)
      if (items?.length > 0) return items
    }
    // 4. allorigins /get (JSON wrapper)
    const wrapped = await safeFetch(ALLORIGINS_GET(feed))
    if (wrapped?.contents) {
      const items = parseRssXml(wrapped.contents)
      if (items?.length > 0) return items
    }
    // 5. rss2json.com (1 000 req/day)
    const j1 = await safeFetch(RSS2JSON(feed))
    if (j1?.status === 'ok' && j1.items?.length > 0) return formatItems(j1.items)
    // 6. feed2json.org
    const j2 = await safeFetch(FEED2JSON(feed))
    if (j2?.items?.length > 0) return formatItems(j2.items)
  }

  return null
}

function formatItems(items) {
  return items.slice(0, 15).map(item => {
    const title = item.title?.trim() ?? ''
    const pub = item.pubDate || item.date_published
    const time = pub
      ? new Date(pub).toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' })
      : ''
    return time ? `${time} — ${title}` : title
  }).filter(Boolean)
}

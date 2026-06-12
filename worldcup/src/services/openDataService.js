/**
 * Data sources for FIFA World Cup 2026 — all CORS-friendly, no API keys:
 *
 *  PRIMARY  → openfootball/worldcup.json on GitHub raw
 *             Auto-updated after every match. CORS: * (GitHub CDN).
 *
 *  NEWS     → rss2json.com (free, 1 000 req/day) with Arabic RSS feeds first,
 *             then feed2json.org as secondary converter, then English fallbacks.
 *
 *  FALLBACK → ESPN scoreboard via proxy chain when openfootball has no data yet
 *             (i.e. during a match that hasn't finished).
 */

// ── Primary: openfootball GitHub raw (no CORS issues) ─────────────────────────
const OFB_MATCHES = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'

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
async function safeFetch(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function safeText(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
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

// ── PRIMARY: openfootball match data ─────────────────────────────────────────
async function fetchOpenfootballMatches() {
  const json = await safeFetch(OFB_MATCHES)
  if (!json?.matches?.length) return null

  const result = []
  for (const m of json.matches) {
    const homeId = OFB_TEAM_MAP[m.team1]
    const awayId = OFB_TEAM_MAP[m.team2]
    if (!homeId || !awayId) continue

    // Only return matches with a confirmed final score
    if (!m.score?.ft) continue

    const sh = m.score.ft[0]
    const sa = m.score.ft[1]

    // Build goals array (English names — will be overridden by Arabic in data.json when available)
    const goals = [
      ...(m.goals1 ?? []).map(g => ({
        team: homeId, player: g.name, minute: parseInt(g.minute) || 0, type: 'عادي',
      })),
      ...(m.goals2 ?? []).map(g => ({
        team: awayId, player: g.name, minute: parseInt(g.minute) || 0, type: 'عادي',
      })),
    ].sort((a, b) => a.minute - b.minute)

    result.push({ team_home: homeId, team_away: awayId, status: 'finished', score_home: sh, score_away: sa, goals })
  }
  return result.length > 0 ? result : null
}

// ── FALLBACK: ESPN live scores (during ongoing matches only) ──────────────────
async function fetchEspnLive() {
  const json = await fetchWithProxy(ESPN_SCOREBOARD)
  if (!json?.events?.length) return null

  const result = []
  for (const event of json.events) {
    const comp = event.competitions?.[0]
    if (!comp) continue
    const homeComp = comp.competitors?.find(c => c.homeAway === 'home')
    const awayComp = comp.competitors?.find(c => c.homeAway === 'away')
    if (!homeComp || !awayComp) continue
    const homeId = ESPN_ABBR_MAP[homeComp.team?.abbreviation]
    const awayId = ESPN_ABBR_MAP[awayComp.team?.abbreviation]
    if (!homeId || !awayId) continue
    const statusName = comp.status?.type?.name ?? 'STATUS_SCHEDULED'
    const status = ESPN_STATUS_MAP[statusName] ?? 'scheduled'
    if (status === 'scheduled') continue  // only return active matches
    result.push({
      team_home: homeId, team_away: awayId, status,
      minute: status === 'live' ? (comp.status?.displayClock ?? null) : null,
      score_home: parseInt(homeComp.score ?? 0, 10),
      score_away: parseInt(awayComp.score ?? 0, 10),
    })
  }
  return result.length > 0 ? result : null
}

// ── Public: fetch all match data ──────────────────────────────────────────────
export async function fetchEspnMatches() {
  // openfootball gives us completed results (CORS-safe)
  const ofb = await fetchOpenfootballMatches()
  // ESPN gives us scores for currently-live matches (often CORS-blocked)
  const espnLive = await fetchEspnLive()

  if (!ofb && !espnLive) return null

  // Merge: start with openfootball completed results, overlay ESPN live on top
  const merged = [...(ofb ?? [])]
  if (espnLive) {
    for (const live of espnLive) {
      const idx = merged.findIndex(m => m.team_home === live.team_home && m.team_away === live.team_away)
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], ...live }
      } else {
        merged.push(live)
      }
    }
  }
  return merged
}

// ── Public: standings — always null (calculated locally in WorldCupContext) ───
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
      if (d.score < 20) return null
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
  // Try each RSS feed with multiple proxy strategies
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

  // Last resort: Reddit r/worldcup (CORS * — always works)
  return fetchRedditNews()
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

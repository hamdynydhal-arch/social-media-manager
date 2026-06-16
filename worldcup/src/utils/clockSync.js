/**
 * Server clock synchronisation.
 *
 * Fetches the HTTP `Date` header from our own static asset to measure the
 * offset between the device clock and the server clock.  The offset is then
 * applied via `serverNow()` so that countdowns and status checks are immune
 * to device clock drift or wrong timezone settings.
 */

let _offsetMs = 0      // device clock − server clock, in milliseconds
let _synced   = false

export const serverNow = () => Date.now() + _offsetMs
export const isSynced  = () => _synced

export async function syncClock() {
  const PROBE = '/social-media-manager/world-cup/version.json'
  try {
    const t0  = Date.now()
    const res = await fetch(PROBE, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    })
    const t1  = Date.now()

    const dateHeader = res.headers.get('date')
    if (dateHeader) {
      const serverMs    = new Date(dateHeader).getTime()
      const roundTrip   = (t1 - t0) / 2          // assumed one-way latency
      _offsetMs = serverMs - (t0 + roundTrip)
    }
    _synced = true
  } catch {
    // Network error or timeout — keep _offsetMs = 0 (device clock)
    _synced = false
  }
}

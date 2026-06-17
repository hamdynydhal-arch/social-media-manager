import { useState, useEffect, useRef } from 'react'
import { playBreakingNewsSound } from '../utils/audioUtils'

const STORAGE_KEY = 'wc-seen-news'

function loadSeen() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function saveSeen(set) {
  try {
    // Keep newest 100 items to avoid unbounded growth
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set].slice(-100)))
  } catch {}
}

/**
 * Shows a 30-second red breaking news banner when a news item arrives
 * that has never been seen before (persisted in localStorage across refreshes).
 * Seeds silently on first mount — no popup on initial page load.
 */
export default function BreakingNewsBanner({ news }) {
  const [banner, setBanner]   = useState(null)
  const initializedRef        = useRef(false)
  const timerRef              = useRef(null)

  useEffect(() => {
    if (!Array.isArray(news) || !news.length) return

    const seen = loadSeen()

    if (!initializedRef.current) {
      // First render this session: seed all current items silently
      news.forEach(item => seen.add(item))
      saveSeen(seen)
      initializedRef.current = true
      return
    }

    const fresh = news.filter(item => !seen.has(item))
    if (!fresh.length) return

    // Mark new items as seen immediately so they won't re-trigger
    fresh.forEach(item => seen.add(item))
    saveSeen(seen)

    // 1. Play breaking-news sound + vibration (app is open)
    playBreakingNewsSound()

    // 2. Fire system notification so it shows on the phone's external screen
    //    (works even when app is in a background tab)
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'NEWS_ALERT',
        text: fresh[0],
        id:   fresh[0].slice(0, 50),
      })
    }

    clearTimeout(timerRef.current)
    setBanner(fresh[0])
    timerRef.current = setTimeout(() => setBanner(null), 30_000)
  }, [news])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  if (!banner) return null

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #7f1d1d 100%)',
        borderBottom: '3px solid #fbbf24',
        boxShadow: '0 4px 32px rgba(220,38,38,0.8)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <span style={{
        flexShrink: 0,
        background: '#fbbf24',
        color: '#7c2d12',
        fontSize: '11px',
        fontWeight: 900,
        padding: '3px 8px',
        borderRadius: '6px',
        whiteSpace: 'nowrap',
      }}>
        🚨 عاجل
      </span>

      <p style={{
        flex: 1,
        color: 'white',
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: 1.4,
        margin: 0,
      }}>
        {banner}
      </p>

      <button
        onClick={() => { clearTimeout(timerRef.current); setBanner(null) }}
        style={{
          flexShrink: 0,
          color: '#fca5a5',
          fontSize: '18px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  )
}

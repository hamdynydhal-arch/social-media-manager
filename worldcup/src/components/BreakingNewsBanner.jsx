import { useState, useEffect, useRef } from 'react'

/**
 * Shows a full-width red breaking news banner for 30 seconds when a new
 * news item appears that wasn't seen in the previous news array.
 * First load seeds seen items silently — no popup on initial mount.
 */
export default function BreakingNewsBanner({ news }) {
  const [banner, setBanner] = useState(null)
  const seenRef        = useRef(new Set())
  const initializedRef = useRef(false)
  const timerRef       = useRef(null)

  useEffect(() => {
    if (!Array.isArray(news) || !news.length) return

    if (!initializedRef.current) {
      news.forEach(item => seenRef.current.add(item))
      initializedRef.current = true
      return
    }

    const fresh = news.filter(item => !seenRef.current.has(item))
    news.forEach(item => seenRef.current.add(item))

    if (!fresh.length) return

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
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      {/* Flashing badge */}
      <span style={{
        flexShrink: 0,
        background: '#fbbf24',
        color: '#7c2d12',
        fontSize: '11px',
        fontWeight: 900,
        padding: '3px 8px',
        borderRadius: '6px',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
        animation: 'pulse 1s infinite',
      }}>
        🚨 عاجل
      </span>

      {/* News text */}
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

      {/* Close */}
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

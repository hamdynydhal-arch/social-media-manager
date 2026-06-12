import { useRef, useEffect, useMemo } from 'react'

// Standard Arabic ticker: label RIGHT, text scrolls right→left (reading order correct)
export default function NewsTicker({ news }) {
  const trackRef  = useRef(null)
  const rafRef    = useRef(null)
  const posRef    = useRef(0)
  const pausedRef = useRef(false)

  const items = useMemo(
    () => (news ?? []).slice(0, 10),
    // stable dep — only recompute when content actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [(news ?? []).slice(0, 10).join('\x01')]
  )

  useEffect(() => {
    const track = trackRef.current
    if (!track || !items.length) return

    posRef.current = 0
    track.style.transform = 'translateX(0px)'

    const step = () => {
      if (!pausedRef.current) {
        posRef.current -= 1                                    // ← right-to-left
        const half = track.scrollWidth / 2
        if (half > 0 && Math.abs(posRef.current) >= half) {
          posRef.current += half                               // seamless loop
        }
        track.style.transform = `translateX(${Math.round(posRef.current)}px)`
      }
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  const doubled = [...items, ...items]

  if (!items.length) return null

  return (
    <div
      className="bg-red-700/95 border-b border-red-600/60 py-2"
      style={{ overflow: 'hidden', direction: 'rtl' }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>

        {/* ── Label: RIGHT side in RTL flex ────────────────────────────── */}
        <span style={{
          flexShrink: 0,
          background: '#7f1d1d',
          color: '#fde047',
          fontSize: '12px',
          fontWeight: '800',
          padding: '4px 10px',
          marginLeft: '10px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          letterSpacing: '0.5px',
          userSelect: 'none',
        }}>
          📺 الأخبار
        </span>

        {/* ── Scrolling lane: LTR so translateX is direction-independent ── */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', direction: 'ltr' }}>
          <div
            ref={trackRef}
            onMouseEnter={() => { pausedRef.current = true }}
            onMouseLeave={() => { pausedRef.current = false }}
            onTouchStart={() => { pausedRef.current = true }}
            onTouchEnd={() => { pausedRef.current = false }}
            style={{ display: 'inline-flex', whiteSpace: 'nowrap', willChange: 'transform' }}
          >
            {doubled.map((item, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  padding: '0 2rem',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  direction: 'rtl',
                  unicodeBidi: 'embed',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

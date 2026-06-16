import { useRef, useEffect, useMemo } from 'react'

// Arabic ticker: label RIGHT, scrolls left→right, items enter left in correct order
// To get correct item order with LTR scroll, the track is stored in reverse so items
// are revealed from the second copy in forward order as posRef approaches 0.
export default function NewsTicker({ news }) {
  const trackRef  = useRef(null)
  const rafRef    = useRef(null)
  const posRef    = useRef(0)
  const pausedRef = useRef(false)
  const initRef   = useRef(false)

  const items = useMemo(
    () => (news ?? []).slice(0, 10),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [(news ?? []).slice(0, 10).join('\x01')]
  )

  useEffect(() => {
    const track = trackRef.current
    if (!track || !items.length) return

    posRef.current = 0
    initRef.current = false
    track.style.transform = 'translateX(0px)'

    const step = () => {
      const half = track.scrollWidth / 2

      // One-time init: jump to -half so first item starts at left edge
      if (!initRef.current && half > 0) {
        posRef.current = -half
        initRef.current = true
        track.style.transform = `translateX(${Math.round(posRef.current)}px)`
      }

      if (!pausedRef.current && half > 0) {
        posRef.current += 1                              // ← left-to-right
        if (posRef.current >= 0) posRef.current = -half // seamless loop
        track.style.transform = `translateX(${Math.round(posRef.current)}px)`
      }
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  // Reverse so that LTR scroll reveals items in order: 1, 2, 3… (not reversed)
  const rev     = [...items].reverse()
  const doubled = [...rev, ...rev]

  if (!items.length) return null

  return (
    <div
      className="bg-red-700/95 border-b border-red-600/60 py-2"
      style={{ overflow: 'hidden', direction: 'rtl' }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>

        {/* Label — right side in RTL flex */}
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

        {/* Scrolling lane — LTR so translateX is direction-independent */}
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

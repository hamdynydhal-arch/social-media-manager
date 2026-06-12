import { useRef, useEffect } from 'react'

// RAF-based ticker — immune to RTL/LTR CSS issues
export default function NewsTicker({ news }) {
  const trackRef   = useRef(null)
  const rafRef     = useRef(null)
  const posRef     = useRef(0)
  const pausedRef  = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track || !news?.length) return

    // Reset position when content changes
    posRef.current = 0
    track.style.transform = 'translateX(0px)'

    const step = () => {
      if (!pausedRef.current) {
        posRef.current -= 1          // 1px per frame ≈ 60px/s at 60fps
        const half = track.scrollWidth / 2
        if (half > 0 && Math.abs(posRef.current) >= half) {
          posRef.current += half     // seamless reset to first-copy position
        }
        track.style.transform = `translateX(${Math.round(posRef.current)}px)`
      }
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [news])

  const doubled = [...(news ?? []), ...(news ?? [])]

  return (
    <div
      className="bg-red-600/90 backdrop-blur-sm border-b border-red-500/50 py-2"
      style={{ overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', direction: 'ltr' }}>
        <span style={{
          flexShrink: 0,
          background: '#7f1d1d',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          padding: '4px 12px',
          margin: '0 12px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          position: 'relative',
          zIndex: 1,
        }}>
          🔴 عاجل
        </span>

        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div
            ref={trackRef}
            onMouseEnter={() => { pausedRef.current = true }}
            onMouseLeave={() => { pausedRef.current = false }}
            onTouchStart={() => { pausedRef.current = true }}
            onTouchEnd={() => { pausedRef.current = false }}
            style={{
              display: 'inline-flex',
              whiteSpace: 'nowrap',
              willChange: 'transform',
            }}
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

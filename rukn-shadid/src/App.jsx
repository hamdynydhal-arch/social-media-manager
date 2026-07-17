import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SomaticAnchor from './components/SomaticAnchor'
import CoreShield from './components/CoreShield'
import CognitiveCards from './components/CognitiveCards'
import OffRamp from './components/OffRamp'
import WeeklyBanner from './components/WeeklyBanner'
import Dashboard from './components/Dashboard'
import { checkWeeklyBanner } from './utils/silentTracker'

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.9 } },
  exit:    { opacity: 0, transition: { duration: 0.5 } },
}

export default function App() {
  const [phase, setPhase] = useState('anchor')
  const [selectedFear, setSelectedFear] = useState(null)
  const [banner, setBanner] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)

  useEffect(() => {
    const result = checkWeeklyBanner()
    if (result.show) setBanner(result)
  }, [])

  const handleCardsReady = (fearId) => {
    setSelectedFear(fearId)
    setPhase('offramp')
  }

  const handleOfframpComplete = () => {
    setSelectedFear(null)
    setPhase('anchor')
  }

  return (
    <div
      className="relative h-screen w-screen bg-black text-white overflow-hidden"
      dir="rtl"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {banner && <WeeklyBanner data={banner} onClose={() => setBanner(null)} />}

      <AnimatePresence mode="wait">
        {phase === 'anchor' && (
          <motion.div key="anchor" {...fade} className="absolute inset-0">
            <SomaticAnchor
              onComplete={() => setPhase('shield')}
              onOpenDashboard={() => setShowDashboard(true)}
            />
          </motion.div>
        )}
        {phase === 'shield' && (
          <motion.div key="shield" {...fade} className="absolute inset-0">
            <CoreShield onNext={() => setPhase('cards')} />
          </motion.div>
        )}
        {phase === 'cards' && (
          <motion.div key="cards" {...fade} className="absolute inset-0">
            <CognitiveCards onReady={handleCardsReady} />
          </motion.div>
        )}
        {phase === 'offramp' && (
          <motion.div key="offramp" {...fade} className="absolute inset-0">
            <OffRamp fearId={selectedFear} onComplete={handleOfframpComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard overlay — hidden easter egg via long press on title */}
      <AnimatePresence>
        {showDashboard && (
          <Dashboard onClose={() => setShowDashboard(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

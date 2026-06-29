import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import content from '../content.json'

export default function CoreShield({ onNext }) {
  const [showFull, setShowFull] = useState(false)

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 1.1 } }}
        className="max-w-sm w-full flex flex-col items-center gap-7"
      >
        {/* Top rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1, transition: { duration: 0.9, delay: 0.2 } }}
          style={{ transformOrigin: 'right' }}
          className="w-full h-px bg-teal-800/50"
        />

        {/* Main hadith */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 1.4, delay: 0.4 } }}
          className="text-center text-xl font-light leading-loose text-gray-100"
          style={{ lineHeight: '2.3rem' }}
        >
          {content.hadith_main}
        </motion.p>

        {/* Expand link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.38, transition: { delay: 1.2 } }}
          whileHover={{ opacity: 0.7 }}
          onClick={() => setShowFull((v) => !v)}
          className="text-teal-400 text-xs border-b border-teal-800/30 pb-0.5 leading-none"
        >
          {showFull ? 'اختصر' : 'الحديث كاملاً'}
        </motion.button>

        <AnimatePresence>
          {showFull && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto', transition: { duration: 0.5 } }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.4 } }}
              className="text-center text-sm text-gray-500 leading-loose overflow-hidden"
            >
              {content.hadith_full}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Bottom rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1, transition: { duration: 0.9, delay: 0.5 } }}
          style={{ transformOrigin: 'left' }}
          className="w-full h-px bg-teal-800/50"
        />

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 1.6, duration: 0.7 } }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full py-4 px-8 rounded-full text-base text-teal-100 mt-2"
          style={{
            background: 'rgba(15,50,47,0.45)',
            border: '1px solid rgba(45,212,191,0.28)',
          }}
        >
          {content.shield_cta}
        </motion.button>
      </motion.div>
    </div>
  )
}

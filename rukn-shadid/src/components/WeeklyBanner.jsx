import { motion } from 'framer-motion'

export default function WeeklyBanner({ data, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.7 } }}
      className="fixed top-0 inset-x-0 z-50 flex justify-center p-4"
    >
      <div
        className="max-w-sm w-full px-5 py-4 rounded-2xl text-center"
        style={{
          background: 'rgba(8,24,24,0.97)',
          border: '1px solid rgba(45,212,191,0.22)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <p className="text-sm text-gray-300 leading-loose">
          مرّت بك{' '}
          <span className="text-teal-300 font-medium">{data.count}</span>{' '}
          {data.count === 1 ? 'لحظة' : 'لحظات'} هذا الأسبوع،
          <br />
          وهدأت كلّها وعُدت منها.{' '}
          <span className="text-gray-400">حفظك الله.</span>
        </p>
        <button
          onClick={onClose}
          className="mt-3 text-xs text-gray-700 hover:text-gray-400 transition-colors"
        >
          إغلاق
        </button>
      </div>
    </motion.div>
  )
}

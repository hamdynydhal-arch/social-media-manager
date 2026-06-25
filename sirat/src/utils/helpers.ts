import { DailyLog, Prayer, Habit } from '../types'

export const DEFAULT_PRAYERS: Prayer[] = [
  { id: 'fajr',   name: 'الفجر',   done: false, onTime: false },
  { id: 'dhuhr',  name: 'الظهر',   done: false, onTime: false },
  { id: 'asr',    name: 'العصر',   done: false, onTime: false },
  { id: 'maghrib',name: 'المغرب',  done: false, onTime: false },
  { id: 'isha',   name: 'العشاء',  done: false, onTime: false },
]

export const DEFAULT_HABITS: Habit[] = [
  { id: 'quran',    name: 'تلاوة القرآن',     domain: 'روحي',  icon: '📖', done: false, target: 1,  unit: 'حزب'   },
  { id: 'dhikr',    name: 'الأذكار',           domain: 'روحي',  icon: '📿', done: false, target: 1,  unit: 'مرة'   },
  { id: 'exercise', name: 'الرياضة',           domain: 'بدني',  icon: '🏃', done: false, target: 30, unit: 'دقيقة' },
  { id: 'sleep',    name: 'النوم الجيد',       domain: 'بدني',  icon: '🌙', done: false, target: 7,  unit: 'ساعة'  },
  { id: 'water',    name: 'شرب الماء',         domain: 'بدني',  icon: '💧', done: false, target: 8,  unit: 'أكواب' },
  { id: 'reading',  name: 'القراءة والتعلم',   domain: 'عقلي',  icon: '📚', done: false, target: 30, unit: 'دقيقة' },
  { id: 'journal',  name: 'يوميات المحاسبة',  domain: 'نفسي',  icon: '✍️', done: false, target: 1,  unit: 'مرة'   },
  { id: 'social',   name: 'صلة الرحم',         domain: 'نفسي',  icon: '🤝', done: false, target: 1,  unit: 'مرة'   },
]

export function calcPerformanceScore(log: Partial<DailyLog>): number {
  let score = 0
  let total = 0

  if (log.prayers) {
    const prayerScore = log.prayers.filter(p => p.done).length
    const onTimeBonus = log.prayers.filter(p => p.onTime).length * 0.5
    score += prayerScore + onTimeBonus
    total += 7.5
  }

  if (log.habits) {
    const habitScore = log.habits.filter(h => h.done).length
    score += habitScore
    total += log.habits.length
  }

  if (log.mood) {
    const moodMap: Record<string, number> = { 'ممتاز': 5, 'جيد': 4, 'متوسط': 3, 'ضعيف': 2, 'سيء': 1 }
    score += (moodMap[log.mood] ?? 3) / 5 * 3
    total += 3
  }

  if (log.energy) {
    score += (log.energy / 5) * 2
    total += 2
  }

  return total > 0 ? Math.round((score / total) * 100) : 0
}

export function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function formatArabicDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

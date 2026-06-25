export type Mood = 'ممتاز' | 'جيد' | 'متوسط' | 'ضعيف' | 'سيء'
export type EnergyLevel = 1 | 2 | 3 | 4 | 5
export type Domain = 'روحي' | 'نفسي' | 'بدني' | 'عقلي'

export interface Prayer {
  id: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
  name: string
  done: boolean
  onTime: boolean
}

export interface Habit {
  id: string
  name: string
  domain: Domain
  icon: string
  done: boolean
  target: number
  unit: string
}

export interface DailyLog {
  date: string
  prayers: Prayer[]
  habits: Habit[]
  mood: Mood | null
  energy: EnergyLevel | null
  physicalScore: number | null
  mentalScore: number | null
  note: string
  performanceScore: number
}

export interface WeeklyStats {
  week: string
  spiritual: number
  physical: number
  mental: number
  emotional: number
  overall: number
}

export interface Guidance {
  id: string
  domain: Domain
  title: string
  text: string
  verse?: string
  reference?: string
}

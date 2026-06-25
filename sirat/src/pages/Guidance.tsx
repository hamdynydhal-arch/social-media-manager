import { useState } from 'react'
import { Domain } from '../types'
import clsx from 'clsx'
import { Compass } from 'lucide-react'

const GUIDANCE_BANK: { domain: Domain; title: string; text: string; verse?: string; ref?: string }[] = [
  {
    domain: 'روحي',
    title: 'قوة الصلاة في وقتها',
    text: 'الصلاة على وقتها هي بوابة النظام في حياتك كلها. حين تلتزم بمواقيتها تُرسّخ في نفسك أن لله أولوية على كل شيء.',
    verse: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا',
    ref: 'النساء: 103',
  },
  {
    domain: 'روحي',
    title: 'ذكر الله شفاء القلب',
    text: 'ابدأ يومك بالأذكار الصباحية، وأختمه بأذكار المساء. هذا الروتين يبني حصنًا روحيًا حول قلبك في مواجهة ضغوط الحياة.',
    verse: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    ref: 'الرعد: 28',
  },
  {
    domain: 'بدني',
    title: 'جسدك أمانة',
    text: 'اعلم أن جسدك أمانة أودعها الله عندك. الرياضة ليست ترفًا بل واجب لصون هذه الأمانة وأداء رسالتك في الحياة بكامل طاقتها.',
    verse: 'وَلَا تُلْقُوا بِأَيْدِيكُمْ إِلَى التَّهْلُكَةِ',
    ref: 'البقرة: 195',
  },
  {
    domain: 'بدني',
    title: 'النوم عبادة',
    text: 'النوم الكافي والمنتظم يُجدد طاقتك للعبادة والعمل. نوم الفجر القصير بعد الصلاة أثبت العلم فائدته، لكن الأفضل المبادرة ليومك.',
  },
  {
    domain: 'عقلي',
    title: 'اقرأ باسم ربك',
    text: 'القراءة اليومية تُوسّع آفاقك وتُحصّن عقلك. خصص 30 دقيقة يوميًا للقراءة الهادفة وستُلاحظ الفارق خلال أسبوعين فقط.',
    verse: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
    ref: 'العلق: 1',
  },
  {
    domain: 'عقلي',
    title: 'قيمة التفكر',
    text: 'خصص وقتًا للتفكر في آيات الله في الكون وفي حياتك. التأمل المنظم يُوسّع الإدراك ويُقلل التوتر ويُقربك من الله.',
    verse: 'الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَى جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالأَرْضِ',
    ref: 'آل عمران: 191',
  },
  {
    domain: 'نفسي',
    title: 'محاسبة النفس',
    text: 'خصص 10 دقائق كل ليلة لمحاسبة نفسك: ماذا فعلت؟ ماذا كان يجب أن تفعل؟ هذا المحاسب الداخلي هو سر النمو المستمر.',
    verse: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ',
    ref: 'الحشر: 18',
  },
  {
    domain: 'نفسي',
    title: 'صلة الأرحام قوة',
    text: 'التواصل مع الأهل والأحباب ليس ترفًا اجتماعيًا، بل ضرورة نفسية وواجب ديني. اجعله جزءًا ثابتًا من روتينك الأسبوعي.',
    verse: 'وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالأَرْحَامَ',
    ref: 'النساء: 1',
  },
]

const DOMAINS: (Domain | 'الكل')[] = ['الكل', 'روحي', 'بدني', 'عقلي', 'نفسي']

const DOMAIN_COLORS: Record<Domain, string> = {
  'روحي': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'بدني': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'عقلي': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'نفسي': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

export default function Guidance() {
  const [filter, setFilter] = useState<Domain | 'الكل'>('الكل')
  const filtered = GUIDANCE_BANK.filter(g => filter === 'الكل' || g.domain === filter)
  const daily = GUIDANCE_BANK[new Date().getDate() % GUIDANCE_BANK.length]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-arabic">التوجيه والإرشاد</h2>

      <div className="bg-sirat-950 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="text-gold-400" size={20} />
          <span className="text-gold-400 font-arabic font-semibold">توجيه اليوم</span>
        </div>
        <h4 className="text-white font-arabic font-bold text-lg">{daily.title}</h4>
        <p className="text-sirat-200 font-arabic text-sm leading-relaxed">{daily.text}</p>
        {daily.verse && (
          <div className="border-r-2 border-gold-400 pr-4 mt-3">
            <p className="text-gold-300 font-arabic">﴿ {daily.verse} ﴾</p>
            {daily.ref && <p className="text-sirat-400 text-xs font-arabic mt-1">{daily.ref}</p>}
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {DOMAINS.map(d => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-arabic border transition-all',
              filter === d ? 'bg-sirat-600 text-white border-sirat-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
            )}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((g, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3 animate-slide-up">
            <div className="flex items-center justify-between">
              <h4 className="font-arabic font-bold text-gray-800 dark:text-white">{g.title}</h4>
              <span className={clsx('text-xs font-arabic px-3 py-1 rounded-full', DOMAIN_COLORS[g.domain])}>
                {g.domain}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-arabic text-sm leading-relaxed">{g.text}</p>
            {g.verse && (
              <div className="border-r-2 border-sirat-400 pr-4 py-1">
                <p className="text-sirat-700 dark:text-sirat-300 font-arabic text-sm">﴿ {g.verse} ﴾</p>
                {g.ref && <p className="text-gray-400 text-xs font-arabic mt-1">{g.ref}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

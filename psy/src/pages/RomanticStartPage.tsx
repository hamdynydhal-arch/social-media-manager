import { useState } from 'react';
import NafeesLogo from '../components/NafeesLogo';
import { ROMANTIC_CONTENT } from '../data/romanticContent';

interface RomanticStartPageProps {
  questionCount: number;
  estimatedMinutes: number;
  onStart: () => void;
  onHome?: () => void;
}

export default function RomanticStartPage({
  questionCount,
  estimatedMinutes,
  onStart,
}: RomanticStartPageProps) {
  const [eduExpanded, setEduExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-nafees-cream flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 rounded-full bg-nafees-navy flex items-center justify-center shadow-lg">
              <NafeesLogo size={52} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-nafees-navy tracking-wide mb-1" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', letterSpacing: '0.12em' }}>
            نَفيس
          </h1>
          <p className="text-nafees-warm text-sm font-medium">مختبر الشخصية النفسية</p>
        </div>

        {/* Test info card */}
        <div className="card mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">💌🔥🌿🛡️🌙⚔️</div>
            <div>
              <h2 className="text-xl font-bold text-nafees-navy leading-tight">مقياس الشيفرة العاطفية</h2>
              <p className="text-xs text-nafees-warm mt-0.5">لغة الحب · أسلوب الحميمية · النمط الرومانسي</p>
            </div>
          </div>

          <p className="text-nafees-warm-dark leading-relaxed mb-5 text-sm">
            اكتشف شيفرتك الرومانسية الخاصة — اللغة التي تستقبل وتُعطي بها الحب — مبنياً على نظريتَي تشابمان في لغات الحب وستيرنبرغ في المثلث العاطفي.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-rose-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-rose-700">{questionCount}</div>
              <div className="text-xs text-nafees-warm mt-1">سؤالاً</div>
            </div>
            <div className="bg-rose-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-rose-700">~{estimatedMinutes}</div>
              <div className="text-xs text-nafees-warm mt-1">دقيقة</div>
            </div>
            <div className="bg-rose-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-rose-700">6</div>
              <div className="text-xs text-nafees-warm mt-1">أبعاد</div>
            </div>
          </div>

          <div className="bg-rose-50/60 rounded-2xl p-4 mb-5">
            <h3 className="font-bold text-nafees-warm-dark mb-2 text-sm">الأبعاد المُقاسة</h3>
            <div className="grid grid-cols-2 gap-1.5 text-sm text-nafees-warm-dark">
              {[
                ['💌', 'كلمات التقدير (WA)'],
                ['🕰️', 'الوقت المشترك (QT)'],
                ['🛡️', 'الخدمة والعطاء (AS)'],
                ['🤝', 'اللمسة الحنونة (PT)'],
                ['🔥', 'الشغف والإثارة (PA)'],
                ['🌿', 'الأمان العاطفي (SE)'],
              ].map(([icon, name]) => (
                <div key={name} className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span className="text-xs">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-nafees-navy/5 rounded-2xl p-4 mb-5">
            <h3 className="font-bold text-nafees-warm-dark mb-2 text-sm">الأنماط الرومانسية الستة</h3>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-nafees-warm-dark">
              {[
                ['💌', 'العاشق الكلاسيكي'],
                ['🔥', 'المستكشف الشغوف'],
                ['🌿', 'الملاذ الآمن'],
                ['🛡️', 'الرومانسي العملي'],
                ['🌙', 'الحالم العاطفي'],
                ['⚔️', 'الفارس الصامت'],
              ].map(([icon, name]) => (
                <div key={name} className="flex items-center gap-1.5">
                  <span>{icon}</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onStart}
            className="w-full font-bold py-3 px-6 rounded-2xl text-white shadow-lg active:scale-95 transition-all text-center"
            style={{ background: 'linear-gradient(135deg, #BE185D, #881337)' }}
          >
            اكتشف شيفرتك العاطفية
          </button>
        </div>

        {/* Educational card - expandable */}
        <div className="card mb-4 border border-rose-200/50 bg-rose-50/30">
          <button
            className="w-full text-right"
            onClick={() => setEduExpanded((v) => !v)}
          >
            <div className="flex items-center justify-between">
              <span className="text-rose-500 text-lg">{eduExpanded ? '▲' : '▼'}</span>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs font-bold text-rose-600">💡 هل تعلم؟</p>
                  <h3 className="text-sm font-extrabold text-nafees-navy">لماذا يحبّ الناس بطرق مختلفة؟</h3>
                </div>
              </div>
            </div>
            {!eduExpanded && (
              <p className="text-xs text-nafees-warm mt-2 text-right leading-relaxed">
                رصد عالم النفس الأمريكي غاري تشابمان أن معظم الأزمات العاطفية لا تنشأ من غياب المحبة، بل من «فجوة اللغة» — حين يُحبّ كلٌّ منا بلغةٍ لا يفهمها الآخر...
              </p>
            )}
          </button>

          {eduExpanded && (
            <div className="mt-4 space-y-4 border-t border-rose-100 pt-4">
              <h3 className="text-base font-extrabold text-nafees-navy">علم لغات الحب: من المشاعر إلى الأبعاد القابلة للقياس</h3>
              <p className="text-sm text-nafees-warm-dark leading-relaxed">
                رصد عالم النفس الأمريكي غاري تشابمان في كتابه «لغات الحب الخمس» (1992) أن معظم الأزمات العاطفية لا تنشأ من غياب المحبة، بل من «فجوة اللغة» — حين يُحبّ كلٌّ منا بلغةٍ لا يفهمها الآخر. مُهندس يُعبّر عن حبه بإصلاح سيارة زوجته صامتاً، فيما هي تشعر بالوحدة لأنه لم يقل «أحبك» منذ أسبوع.
              </p>
              <p className="text-sm text-nafees-warm-dark leading-relaxed">
                في الموازاة، طوّر عالم النفس روبرت ستيرنبرغ نظريته المثلثية للحب (1986) التي تُميّز بين ثلاثة مكوّنات: الشغف (الجذب الرومانسي)، الحميمية (القرب العاطفي والتواصل)، والالتزام (القرار المتعمّد ببناء المستقبل معاً). كل علاقة تحمل نسبة مختلفة من هذه المكوّنات.
              </p>
              <p className="text-sm text-nafees-warm-dark leading-relaxed">
                هذا المقياس يدمج الإطارَين: يقيس لغاتك العاطفية وفق تشابمان، ويضيف بُعدَي الشغف والأمان المستقاة من أبحاث ستيرنبرغ والبحث السريري في الحميمية والتعلق، ليُقدّم صورة أكثر شمولاً لنمطك الرومانسي الفريد.
              </p>
              <div className="bg-nafees-navy/5 rounded-2xl p-4">
                <p className="text-xs text-nafees-navy leading-relaxed font-medium">
                  ليس الهدف تصنيفك في خانة محددة، بل منحك «خريطة» لفهم ما تحتاجه وما تُعطيه في العلاقات العاطفية — وكيف يمكنك بناء جسور التواصل مع من تُحب.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="card mb-4">
          <h3 className="font-bold text-nafees-warm-dark mb-3 text-sm">نصائح للحصول على نتيجة دقيقة</h3>
          <ul className="space-y-2 text-sm text-nafees-warm-dark">
            <li className="flex gap-2"><span>💭</span><span>فكّر في علاقتك الحالية أو أهم علاقة عاطفية في حياتك — الأجوبة ستكون أدق.</span></li>
            <li className="flex gap-2"><span>✅</span><span>أجب بما تشعر فعلاً، لا ما يبدو «صحيحاً» أو مثالياً في نظرك.</span></li>
            <li className="flex gap-2"><span>⚡</span><span>ثق بأول انطباع — ردة فعلك التلقائية غالباً أصدق من التفكير الطويل.</span></li>
            <li className="flex gap-2"><span>⏸️</span><span>يمكنك التوقف في أي وقت والعودة لاحقاً — تقدّمك محفوظ تلقائياً.</span></li>
          </ul>
        </div>

        <p className="text-xs text-nafees-warm text-center leading-relaxed px-2">
          ⚠️ {ROMANTIC_CONTENT.disclaimer}
        </p>
      </div>
    </div>
  );
}

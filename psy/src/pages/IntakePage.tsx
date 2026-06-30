import { useState } from 'react';
import {
  saveDemographicProfile,
  loadDemographicProfile,
  EMPTY_PROFILE,
} from '../engine/demographicTypes';
import type {
  DemographicProfile,
  Gender,
  MaritalStatus,
  ParentalPresence,
  BirthOrder,
} from '../engine/demographicTypes';

interface IntakePageProps {
  onHome: () => void;
  onComplete: () => void;
}

export default function IntakePage({ onHome, onComplete }: IntakePageProps) {
  const [profile, setProfile] = useState<DemographicProfile>(
    () => loadDemographicProfile() ?? { ...EMPTY_PROFILE },
  );
  const [saved, setSaved] = useState(false);

  function set<K extends keyof DemographicProfile>(key: K, value: DemographicProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function toggle<K extends keyof DemographicProfile>(key: K, value: DemographicProfile[K]) {
    setProfile((p) => ({ ...p, [key]: p[key] === value ? null : value }));
  }

  function handleSave() {
    saveDemographicProfile(profile);
    setSaved(true);
    setTimeout(() => onComplete(), 700);
  }

  const chipBase =
    'py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 active:scale-95';
  const chipOff = `${chipBase} bg-nafees-cream text-nafees-navy border-nafees-cream-dark/50`;
  const chipOn  = `${chipBase} bg-nafees-navy text-nafees-cream border-nafees-navy`;

  return (
    <div className="min-h-screen bg-nafees-cream" dir="rtl">

      {/* Header */}
      <div className="bg-nafees-navy px-4 pt-5 pb-8 rounded-b-[2.5rem]">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-nafees-cream mb-1">ملفك السياقي</h1>
          <p className="text-nafees-sky/80 text-sm leading-relaxed">
            المعلومات الديموغرافية تُحسّن دقة التوليف النفسي — جميع الحقول اختيارية.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-5">

        {/* Age */}
        <div className="bg-white rounded-2xl p-5 border border-nafees-cream-dark/30 shadow-sm">
          <label className="block text-sm font-bold text-nafees-navy mb-3">العمر</label>
          <input
            type="number"
            min={10}
            max={99}
            value={profile.age ?? ''}
            onChange={(e) => set('age', e.target.value ? Number(e.target.value) : null)}
            placeholder="مثال: 35"
            className="w-full border border-nafees-cream-dark/60 rounded-xl px-4 py-3 text-right text-nafees-navy placeholder:text-nafees-warm/50 focus:outline-none focus:ring-2 focus:ring-nafees-blue/30 text-sm bg-nafees-cream"
          />
          <p className="text-[10px] text-nafees-warm mt-2 leading-relaxed">
            يُستخدم لحساب التغيرات المرتبطة بالنضج (Roberts & Mroczek 2008)
          </p>
        </div>

        {/* Gender */}
        <div className="bg-white rounded-2xl p-5 border border-nafees-cream-dark/30 shadow-sm">
          <label className="block text-sm font-bold text-nafees-navy mb-3">الجنس</label>
          <div className="flex gap-2 flex-wrap">
            {(
              [
                ['male',   'ذكر'],
                ['female', 'أنثى'],
                ['other',  'لا أفصح'],
              ] as [Gender, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => toggle('gender', v)}
                className={`flex-1 min-w-[80px] ${profile.gender === v ? chipOn : chipOff}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Marital Status */}
        <div className="bg-white rounded-2xl p-5 border border-nafees-cream-dark/30 shadow-sm">
          <label className="block text-sm font-bold text-nafees-navy mb-3">الحالة الاجتماعية</label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['single',  'أعزب / عزباء'],
                ['married', 'متزوج / ة'],
                ['divorced','مطلق / ة'],
                ['widowed', 'أرمل / ة'],
              ] as [MaritalStatus, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => toggle('maritalStatus', v)}
                className={profile.maritalStatus === v ? chipOn : chipOff}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-nafees-warm mt-2">يرتبط بتغيرات شخصية موثقة (Roberts et al. 2002)</p>
        </div>

        {/* Number of children */}
        <div className="bg-white rounded-2xl p-5 border border-nafees-cream-dark/30 shadow-sm">
          <label className="block text-sm font-bold text-nafees-navy mb-3">عدد الأبناء</label>
          <div className="flex gap-2 flex-wrap">
            {[0, 1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => toggle('numberOfChildren', n)}
                className={`w-12 h-12 rounded-xl text-sm font-bold border transition-all duration-200 active:scale-95 flex-shrink-0 flex items-center justify-center ${
                  profile.numberOfChildren === n ? chipOn : chipOff
                }`}
              >
                {n === 4 ? '4+' : n}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-nafees-warm mt-2">الأبوة ترتبط بتطور الشعور بالهدف (Soto et al. 2011)</p>
        </div>

        {/* Birth Order */}
        <div className="bg-white rounded-2xl p-5 border border-nafees-cream-dark/30 shadow-sm">
          <label className="block text-sm font-bold text-nafees-navy mb-3">ترتيبك بين الإخوة</label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['firstborn',  'البكر'],
                ['middle',     'الأوسط'],
                ['lastborn',   'الأصغر'],
                ['only_child', 'وحيد / ة'],
              ] as [BirthOrder, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => toggle('birthOrder', v)}
                className={profile.birthOrder === v ? chipOn : chipOff}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-nafees-warm mt-2">تأثير ترتيب الولادة على الشخصية (Sulloway 1996)</p>
        </div>

        {/* Father Presence */}
        <div className="bg-white rounded-2xl p-5 border border-nafees-cream-dark/30 shadow-sm">
          <label className="block text-sm font-bold text-nafees-navy mb-1">حضور الأب في الطفولة</label>
          <p className="text-[10px] text-nafees-warm mb-3">يؤثر على تشكّل المخططات المعرفية المبكرة (Young et al. 2003)</p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['present',      'حاضر بشكل كامل'],
                ['absent_early', 'غائب (مبكراً)'],
                ['absent_late',  'غائب (متأخراً)'],
                ['deceased',     'متوفى'],
              ] as [ParentalPresence, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => toggle('fatherPresence', v)}
                className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 text-right leading-snug ${
                  profile.fatherPresence === v ? chipOn : chipOff
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Mother Presence */}
        <div className="bg-white rounded-2xl p-5 border border-nafees-cream-dark/30 shadow-sm">
          <label className="block text-sm font-bold text-nafees-navy mb-1">حضور الأم في الطفولة</label>
          <p className="text-[10px] text-nafees-warm mb-3">الحضور الأمومي له ارتباط أقوى بالضبط الانفعالي المبكر</p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['present',      'حاضرة بشكل كامل'],
                ['absent_early', 'غائبة (مبكراً)'],
                ['absent_late',  'غائبة (متأخراً)'],
                ['deceased',     'متوفاة'],
              ] as [ParentalPresence, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => toggle('motherPresence', v)}
                className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 text-right leading-snug ${
                  profile.motherPresence === v ? chipOn : chipOff
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Siblings count */}
        <div className="bg-white rounded-2xl p-5 border border-nafees-cream-dark/30 shadow-sm">
          <label className="block text-sm font-bold text-nafees-navy mb-3">عدد الإخوة والأخوات</label>
          <div className="flex gap-2 flex-wrap">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => toggle('siblingsCount', n)}
                className={`w-12 h-12 rounded-xl text-sm font-bold border transition-all duration-200 active:scale-95 flex-shrink-0 flex items-center justify-center ${
                  profile.siblingsCount === n ? chipOn : chipOff
                }`}
              >
                {n === 5 ? '5+' : n}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy note */}
        <div className="bg-nafees-cream-dark/40 rounded-2xl p-4">
          <p className="text-[10px] text-nafees-warm-dark leading-relaxed text-center">
            🔒 تُحفظ هذه البيانات محلياً على جهازك فقط ولا تُرسَل لأي خادم.
            يمكنك حذفها في أي وقت من صفحة الإعدادات.
          </p>
        </div>

        {/* Save / Skip */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={saved}
            className={`w-full py-4 rounded-2xl text-base font-bold transition-all duration-300 active:scale-95 ${
              saved
                ? 'bg-nafees-sage text-white'
                : 'bg-nafees-navy text-nafees-cream'
            }`}
          >
            {saved ? '✓ تم الحفظ — جارٍ تحديث التحليل...' : 'حفظ وتحديث التحليل'}
          </button>
          <button
            onClick={onHome}
            className="w-full py-3 rounded-2xl border border-nafees-cream-dark/60 text-nafees-warm text-sm font-medium active:scale-95 transition-transform duration-150"
          >
            تخطى — سأكمل لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
}

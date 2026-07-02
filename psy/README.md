# psy — مختبر الشخصية النفسية

تطبيق ويب عربي لاختبارات الشخصية النفسية، مبني على **نموذج العوامل الخمسة الكبرى (Big Five / OCEAN)**.

---

## تشغيل المشروع محلياً

```bash
cd psy
npm install
npm run dev
```

ثم افتح `http://localhost:5173` في متصفحك.

---

## بنية المجلدات

```
psy/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── src/
    ├── main.tsx              # نقطة الدخول
    ├── App.tsx               # التوجيه بين الشاشات
    ├── engine/
    │   ├── types.ts          # أنواع TypeScript لكل كيانات النظام
    │   └── scoring.ts        # محرّك التصحيح والحساب (عام وقابل للتمديد)
    ├── data/
    │   ├── bigfive.json      # أسئلة الاختبار وإعدادات التصحيح (50 بنداً)
    │   └── bigfiveContent.ts # نصوص التوصيات والمحتوى لكل عامل
    ├── components/
    │   ├── ProgressBar.tsx   # شريط التقدم
    │   ├── LikertScale.tsx   # مقياس ليكرت التفاعلي
    │   ├── QuestionCard.tsx  # بطاقة السؤال (يدعم likert/boolean/single_choice)
    │   ├── RadarChart.tsx    # مخطط الرادار SVG للعوامل الخمسة
    │   └── FactorBar.tsx     # شريط النسبة المئوية لكل عامل
    └── pages/
        ├── StartPage.tsx     # صفحة البداية
        ├── TestPage.tsx      # صفحة الأسئلة
        └── ResultPage.tsx    # صفحة النتائج التفصيلية
```

---

## آلية التصحيح

### 1. بنك الأسئلة
- **50 بنداً** مستوحاة من **IPIP (International Personality Item Pool)** — ملك عام
- 10 بنود لكل عامل من العوامل الخمسة، نصفها مباشر ونصفها عكسي

### 2. الدرجات
- **البند المباشر:** الدرجة = الإجابة (1–5)
- **البند العكسي:** الدرجة = 6 − الإجابة
- **المجموع لكل عامل:** من 10 إلى 50
- **النسبة المئوية:** `((مجموع − 10) / 40) × 100`

### 3. التصنيف
```
منخفض  : 0% – 32%
متوسط  : 33% – 66%
مرتفع  : 67% – 100%
```

العتبات محفوظة في `bigfive.json` تحت `scoring.factors[X].lowThreshold` و `highThreshold` وتغييرها يؤثر فورياً على النتائج.

### 4. التخزين
- النتائج تُحفظ في `localStorage` (آخر 5 اختبارات)
- لا خادم ولا قاعدة بيانات — خصوصية كاملة

---

## إضافة اختبار جديد

الإضافة = ملف JSON واحد + ملف محتوى TypeScript، بدون تعديل المحرّك:

### الخطوة 1: أنشئ `src/data/mytest.json`
```json
{
  "id": "mytest",
  "name": "اسم الاختبار",
  "description": "وصف مختصر",
  "estimatedMinutes": 5,
  "version": "1.0",
  "scoring": {
    "likertMin": 1,
    "likertMax": 5,
    "factors": {
      "X": { "name": "العامل الأول", "lowThreshold": 33, "highThreshold": 67 }
    }
  },
  "questions": [
    {
      "id": "X1",
      "text": "نص السؤال هنا.",
      "type": "likert",
      "factor": "X",
      "direction": "direct"
    }
  ]
}
```

**أنواع الأسئلة المدعومة:**
- `"likert"` — مقياس 1 إلى 5 (الأكثر استخداماً)
- `"boolean"` — نعم / لا
- `"single_choice"` — اختيار واحد من عدة خيارات

### الخطوة 2: أنشئ محتوى النتائج
```typescript
// src/data/mytestContent.ts
import type { TestContent } from '../engine/types';
const content: TestContent = { factors: { X: { ... } }, profileTitles: [...], disclaimer: '...', closingMessage: '...' };
export default content;
```

### الخطوة 3: أضف زر اختيار الاختبار في `App.tsx`

---

## النشر العام

### Vercel (الأسرع)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# ثم اسحب مجلد dist/ إلى netlify.com/drop
```

### GitHub Pages
```bash
npm run build
npx gh-pages -d dist
```

---

## الأساس العلمي

- النموذج: **Big Five / OCEAN** — الأكثر تحقّقاً في علم النفس الأكاديمي
- المصدر: **IPIP** (ipip.ori.org) — ملك عام بلا قيود على الاستخدام
- المرجع: Goldberg, L. R. (1992). *The development of markers for the Big-Five factor structure*

---

## تنبيه أخلاقي

هذا الاختبار **أداة للوعي الذاتي** فحسب. ليس تشخيصاً سريرياً ولا بديلاً عن مختص نفسي.

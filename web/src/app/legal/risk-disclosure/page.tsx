import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "إفصاح المخاطر المالية" };

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen bg-navy-950 p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-muted-foreground hover:text-foreground text-sm mb-8 inline-block">
          → العودة للرئيسية
        </Link>
        <div className="prose prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-2">إفصاح المخاطر المالية الكامل</h1>
          <p className="text-muted-foreground mb-8">آخر تحديث: يونيو 2026</p>

          <div className="bg-red-950/30 border border-red-900/30 rounded-xl p-6 mb-8">
            <h2 className="text-red-400 font-bold text-xl mb-3">⚠️ تحذير مهم للغاية</h2>
            <p className="text-red-200/80">
              تداول العملات الرقمية ينطوي على مخاطر مالية شديدة الحدة. قد تخسر جزءاً
              كبيراً أو كامل رأس مالك المستثمر. التداول الآلي لا يضمن أرباحاً ولا يلغي
              مخاطر الخسارة. استثمر فقط ما يمكنك تحمّل خسارته كاملاً.
            </p>
          </div>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-foreground font-bold text-xl mb-3">1. طبيعة المخاطر</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>تقلبات شديدة في أسعار العملات الرقمية قد تحدث في أوقات قصيرة جداً</li>
                <li>احتمالية خسارة 100% من رأس المال المستثمر</li>
                <li>مخاطر تقنية: أعطال في الخوادم، انقطاع الإنترنت، أخطاء البرمجة</li>
                <li>مخاطر السوق: تلاعب السوق، السيولة المنخفضة، الفجوات السعرية</li>
                <li>مخاطر تنظيمية: تغيير القوانين قد يؤثر على إمكانية التداول</li>
                <li>مخاطر أمنية: اختراق المنصات، سرقة المفاتيح</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-bold text-xl mb-3">2. إخلاء مسؤولية SPEAR5</h2>
              <p>
                منصة SPEAR5 ليست مستشاراً مالياً ولا تقدم نصائح استثمارية.
                نحن نوفر أداة تقنية للتداول الآلي. أداء البوت التاريخي لا يضمن
                نتائج مستقبلية مماثلة. المسؤولية الكاملة عن قرارات التداول تقع على عاتق المستخدم.
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-bold text-xl mb-3">3. من يجب ألا يستخدم هذه المنصة</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>الأشخاص الذين لا يستطيعون تحمّل خسارة رأس مالهم</li>
                <li>من يعانون من مشاكل مالية أو ديون</li>
                <li>القاصرون (دون 18 سنة)</li>
                <li>من يسكنون في دول تحظر تداول العملات الرقمية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-bold text-xl mb-3">4. توصياتنا للمُصرَّحين</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>ابدأ بمبلغ صغير (Paper Mode أولاً)</li>
                <li>لا تستثمر أكثر من 5-10% من مدخراتك</li>
                <li>راقب البوت بانتظام ولا تتركه دون رقابة</li>
                <li>استخدم مستوى مخاطرة محافظاً في البداية</li>
                <li>تعلّم أساسيات تداول العملات الرقمية قبل البدء</li>
              </ul>
            </section>
          </div>

          <div className="mt-10 p-4 bg-white/[0.03] rounded-xl text-center text-sm text-muted-foreground">
            بالمتابعة واستخدام المنصة، تؤكد أنك قرأت وفهمت وقبلت هذا الإفصاح الكامل.
          </div>
        </div>
      </div>
    </div>
  );
}

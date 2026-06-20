import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "شروط الاستخدام" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-muted-foreground hover:text-foreground text-sm mb-8 inline-block">
          → العودة للرئيسية
        </Link>
        <h1 className="text-3xl font-bold mb-2">شروط الاستخدام</h1>
        <p className="text-muted-foreground mb-8">آخر تحديث: يناير 2025</p>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-foreground font-bold text-xl mb-3">1. القبول والموافقة</h2>
            <p>
              باستخدام منصة SPEAR5، فإنك توافق على هذه الشروط كاملاً.
              إذا لم توافق على أي من هذه الشروط، يرجى التوقف عن استخدام المنصة فوراً.
            </p>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-xl mb-3">2. الخدمة المقدمة</h2>
            <p>
              SPEAR5 تقدم أداة تقنية لأتمتة التداول على منصة Binance.
              الخدمة تجريبية وقد تتوقف في أي وقت. لا نضمن استمرارية الخدمة.
            </p>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-xl mb-3">3. المسؤوليات</h2>
            <p>
              أنت مسؤول كلياً عن قرارات التداول ونتائجها المالية.
              SPEAR5 غير مسؤولة عن أي خسائر مالية تنتج عن استخدام المنصة.
            </p>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-xl mb-3">4. الأمان وحماية البيانات</h2>
            <p>
              أنت مسؤول عن الحفاظ على سرية بيانات حسابك.
              يجب إنشاء مفاتيح Binance API بصلاحيات محدودة (بدون Withdrawal).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

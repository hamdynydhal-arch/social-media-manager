import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "سياسة الخصوصية" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-navy-950 p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-muted-foreground hover:text-foreground text-sm mb-8 inline-block">
          → العودة للرئيسية
        </Link>
        <h1 className="text-3xl font-bold mb-2">سياسة الخصوصية</h1>
        <p className="text-muted-foreground mb-8">آخر تحديث: يناير 2025</p>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-foreground font-bold text-xl mb-3">البيانات التي نجمعها</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>بيانات حساب Google (الاسم، الإيميل، الصورة)</li>
              <li>مفاتيح Binance API (مُشفَّرة بـ AES-256-GCM)</li>
              <li>بيانات الصفقات من البوت</li>
              <li>سجلات الأنشطة للأمان</li>
            </ul>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-xl mb-3">كيف نحمي بياناتك</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>مفاتيح API مُشفَّرة تشفيراً قوياً ولا تُشارَك مع أطراف ثالثة</li>
              <li>HTTPS على كل الاتصالات</li>
              <li>لا نبيع بياناتك ولا نشاركها</li>
              <li>يمكنك طلب حذف حسابك وبياناتك في أي وقت</li>
            </ul>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-xl mb-3">حقوقك</h2>
            <p>
              يمكنك طلب الوصول لبياناتك، تصحيحها، أو حذفها في أي وقت
              عبر التواصل معنا أو من خلال إعدادات حسابك.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

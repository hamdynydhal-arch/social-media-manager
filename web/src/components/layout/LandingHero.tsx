"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { LiveClock } from "@/components/ui/LiveClock";
import {
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Lock,
  Bot,
  ChevronLeft,
  Activity,
  Cpu,
} from "lucide-react";

// Fact-based technical specs — derived directly from Spear5 config.py and architecture
const specs = [
  {
    value: "5",
    label: "عملات نخبوية",
    detail: "SOL · BTC · TAO · RENDER · FET",
  },
  {
    value: "3",
    label: "مستويات مخاطرة",
    detail: "محافظ · متوازن · جريء",
  },
  {
    value: "AES-256-GCM",
    label: "بروتوكول التشفير",
    detail: "مفاتيح Binance API محلياً",
  },
  {
    value: "Python 3.12",
    label: "بيئة التنفيذ",
    detail: "Workers معزولة لكل حساب مُصرَّح",
  },
];

// Fact-based feature descriptions — no exaggeration
const features = [
  {
    icon: Bot,
    title: "تداول كمي مغلق",
    desc: "خوارزمية خاصة تعمل على 5 عملات ذات ارتباط منخفض مُختارة بعناية",
  },
  {
    icon: Shield,
    title: "تشفير عسكري AES-256-GCM",
    desc: "مفاتيح Binance API مشفّرة محلياً — لا تُرسل أو تُخزّن على أي خادم خارجي",
  },
  {
    icon: BarChart3,
    title: "غرفة تحكم مركزية",
    desc: "إحصائيات المحفظة الحية، سجل الصفقات المفصّل، ومراقبة وضع البوت",
  },
  {
    icon: TrendingUp,
    title: "إدارة مخاطر صارمة",
    desc: "وقف خسارة كارثي ثابت + وقف متحرك ديناميكي مبني على ATR لكل مستوى مخاطرة",
  },
  {
    icon: Zap,
    title: "تحكم فوري",
    desc: "إطلاق وإيقاف البوت في الوقت الفعلي مع تأثير فوري على المراكز المفتوحة",
  },
  {
    icon: Activity,
    title: "Backtest على بيانات تاريخية",
    desc: "اختبر الاستراتيجية على بيانات OHLCV الحقيقية قبل النشر الفعلي",
  },
];

export function LandingHero() {
  return (
    <div className="min-h-screen bg-navy-950 text-foreground overflow-hidden">
      {/* Hexagon background pattern */}
      <div className="fixed inset-0 hex-bg opacity-100 pointer-events-none" />
      {/* Radial gold glow center */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,164,48,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-gold-DEFAULT/15 max-w-7xl mx-auto">
        <Logo className="h-14 w-14" />
        <div className="flex items-center gap-4">
          <Link
            href="/legal/risk-disclosure"
            className="text-sm text-muted-foreground hover:text-gold-DEFAULT transition-colors"
          >
            إفصاح المخاطر
          </Link>
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="text-sm bg-[#D4AF37]/15 hover:bg-[#D4AF37] border border-[#D4AF37]/40 text-[#D4AF37] hover:text-[#030C1B] px-4 py-2 rounded-lg transition-all duration-300 font-medium"
          >
            دخول المصرّح
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold-DEFAULT/10 border border-gold-DEFAULT/25 text-gold-DEFAULT text-sm px-4 py-2 rounded-full mb-8">
            <Cpu className="w-3.5 h-3.5" />
            أداة تداول كمية خاصة — للاستخدام المؤسسي المغلق
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white">
            محطة تحكم التداول
            <br />
            <span className="gradient-text-shine">SPEAR5</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            نظام تداول كمي خاص يعمل على 5 عملات مختارة. أدخل مفاتيح Binance المشفّرة،
            حدّد مستوى المخاطرة، وراقب الأداء من غرفة التحكم المركزية.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="group flex items-center gap-3 bg-[#D4AF37] hover:bg-[#F4CE14] text-[#030C1B] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.35)] hover:shadow-[0_0_50px_rgba(212,175,55,0.55)]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              مصادقة وصول المصرّحين (Google)
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            </button>
            <Link
              href="/legal/risk-disclosure"
              className="text-muted-foreground hover:text-gold-DEFAULT text-sm underline underline-offset-4 transition-colors"
            >
              اقرأ إفصاح المخاطر الإلزامي
            </Link>
          </div>
        </motion.div>

        {/* Technical Specs — fact-based only */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20"
        >
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="bg-navy-800/60 border border-gold-DEFAULT/15 rounded-xl p-5 hover:border-gold-DEFAULT/30 transition-colors text-center"
            >
              <div className="text-2xl font-black gradient-text mb-1 number-ltr tracking-tight">{spec.value}</div>
              <div className="text-sm font-semibold text-foreground mb-1">{spec.label}</div>
              <div className="text-xs text-muted-foreground">{spec.detail}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-2 text-white">
            غرفة تحكم مركزية للإدارة الخاصة
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            مواصفات مشتقة مباشرة من البنية التقنية لـ Spear5
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-navy-800/60 hover:bg-navy-700/60 border border-gold-DEFAULT/10 hover:border-gold-DEFAULT/30 rounded-xl p-6 transition-all group"
              >
                <div className="w-12 h-12 bg-gold-DEFAULT/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold-DEFAULT/20 transition-colors">
                  <f.icon className="w-6 h-6 text-gold-DEFAULT" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Risk Warning — mandatory, prominent */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-red-950/30 border border-red-900/30 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-red-400 font-bold mb-2">
            <Lock className="w-4 h-4" />
            تحذير المخاطر المالية — إلزامي
          </div>
          <p className="text-sm text-red-300/70 max-w-2xl mx-auto">
            تداول العملات الرقمية ينطوي على مخاطر عالية. قد تخسر جزءاً أو كل رأس مالك.
            Spear5 ليست مستشاراً مالياً ولا تضمن أي عوائد. تداول فقط بما تستطيع تحمّل خسارته.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gold-DEFAULT/10 py-8 text-center text-muted-foreground text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center justify-center gap-2 flex-wrap text-sm text-slate-400">
            <Logo className="h-8 w-8" />
            <span>© Spear5. جميع الحقوق محفوظة.</span>
            <span className="hidden md:inline">|</span>
            <LiveClock />
          </div>
          <div className="flex items-center gap-6">
            <Link href="/legal/terms" className="hover:text-gold-DEFAULT transition-colors">شروط الاستخدام</Link>
            <Link href="/legal/privacy" className="hover:text-gold-DEFAULT transition-colors">سياسة الخصوصية</Link>
            <Link href="/legal/risk-disclosure" className="hover:text-gold-DEFAULT transition-colors">إفصاح المخاطر</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

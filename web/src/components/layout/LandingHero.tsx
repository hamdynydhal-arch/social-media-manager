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
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "بوت ذكي متطور",
    desc: "خوارزميات تداول احترافية تعمل على مدار الساعة",
  },
  {
    icon: Shield,
    title: "أمان عالي المستوى",
    desc: "تشفير AES-256-GCM لمفاتيح Binance API",
  },
  {
    icon: BarChart3,
    title: "لوحة تحكم احترافية",
    desc: "إحصائيات حية وتاريخ صفقات مفصّل",
  },
  {
    icon: TrendingUp,
    title: "3 مستويات مخاطرة",
    desc: "محافظ، متوازن، جريء — اختر ما يناسبك",
  },
  {
    icon: Zap,
    title: "تحكم فوري",
    desc: "إطلاق وإيقاف البوت بنقرة واحدة",
  },
  {
    icon: Activity,
    title: "Backtest متقدم",
    desc: "اختبر الاستراتيجية على بيانات تاريخية",
  },
];

const stats = [
  { label: "عملة مدعومة", value: "100+" },
  { label: "نسبة دقة التنبؤ", value: "78%" },
  { label: "وقت التشغيل", value: "99.9%" },
  { label: "مستخدم نشط", value: "500+" },
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
        <Logo size={56} />
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
            تسجيل الدخول
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
            <span className="w-2 h-2 bg-gold-DEFAULT rounded-full animate-pulse" />
            منصة إدارة ثروات رقمية — متاحة الآن
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white">
            منصة التداول الذكي
            <br />
            <span className="gradient-text-shine">SPEAR5</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            منصة احترافية لإدارة بوت تداول العملات الرقمية. سجّل دخولك، أدخل مفاتيح Binance،
            واختر مستوى المخاطرة — البوت يتولى الباقي.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Primary CTA — Solid Gold, max contrast */}
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
              ابدأ مع Google
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            </button>
            <Link
              href="/legal/risk-disclosure"
              className="text-muted-foreground hover:text-gold-DEFAULT text-sm underline underline-offset-4 transition-colors"
            >
              اقرأ إفصاح المخاطر أولاً
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-navy-800/60 border border-gold-DEFAULT/15 rounded-xl p-5 hover:border-gold-DEFAULT/30 transition-colors"
            >
              <div className="text-3xl font-black gradient-text mb-1 number-ltr">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
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
            كل ما تحتاجه في مكان واحد
          </h2>
          <p className="text-center text-muted-foreground mb-12">أدوات ثروة متكاملة على منصة واحدة</p>
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

      {/* Risk Warning */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-red-950/30 border border-red-900/30 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-red-400 font-bold mb-2">
            <Lock className="w-4 h-4" />
            تحذير المخاطر المالية
          </div>
          <p className="text-sm text-red-300/70 max-w-2xl mx-auto">
            تداول العملات الرقمية ينطوي على مخاطر عالية. قد تخسر جزءاً أو كل رأس مالك.
            Spear5 ليست مستشاراً مالياً. تداول فقط بما تستطيع تحمّل خسارته.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gold-DEFAULT/10 py-8 text-center text-muted-foreground text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center justify-center gap-2 flex-wrap text-sm text-slate-400">
            <Logo size={32} />
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

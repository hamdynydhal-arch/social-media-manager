"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

// TODO: Re-enable strict Google OAuth authentication after UI development phase
export function LoginCard({
  callbackUrl,
}: {
  callbackUrl?: string;
  error?: string;
}) {
  const router = useRouter();

  function handleEnter() {
    router.push(callbackUrl ?? "/dashboard");
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative w-full max-w-md"
    >
      <div className="bg-navy-800/80 border border-gold-DEFAULT/15 rounded-2xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold-DEFAULT/10 border border-gold-DEFAULT/20 rounded-2xl flex items-center justify-center font-black text-gold-DEFAULT text-2xl mx-auto mb-4 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
            S5
          </div>
          <h1 className="text-2xl font-bold text-white">مصادقة وصول المُصرَّح</h1>
          <p className="text-muted-foreground text-sm mt-2">
            منصة كمية خاصة — وصول حصري للمُصرَّحين فقط
          </p>
        </div>

        {/* Enter button — dev bypass */}
        <button
          onClick={handleEnter}
          className="w-full flex items-center justify-center gap-3 bg-[#D4AF37] hover:bg-[#F4CE14] text-[#030C1B] font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.3)]"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          دخول غرفة التحكم
        </button>

        {/* Security note */}
        <div className="flex items-start gap-3 mt-6 p-4 bg-white/[0.03] rounded-xl border border-gold-DEFAULT/10">
          <Shield className="w-4 h-4 text-gold-DEFAULT mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            بالدخول، تقرّ بالاطلاع على{" "}
            <Link href="/legal/terms" className="text-gold-DEFAULT hover:underline">
              شروط الاستخدام
            </Link>{" "}
            و{" "}
            <Link href="/legal/risk-disclosure" className="text-gold-DEFAULT hover:underline">
              إفصاح المخاطر المالية
            </Link>.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

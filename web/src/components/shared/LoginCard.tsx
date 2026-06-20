"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { AlertTriangle, Shield } from "lucide-react";
import { motion } from "framer-motion";

const errorMessages: Record<string, string> = {
  OAuthSignin: "حدث خطأ أثناء تسجيل الدخول بـ Google",
  OAuthCallback: "حدث خطأ في استجابة Google",
  OAuthCreateAccount: "تعذّر إنشاء الحساب",
  EmailSignin: "تعذّر إرسال رابط تسجيل الدخول",
  CredentialsSignin: "بيانات الدخول غير صحيحة",
  AccountDisabled: "حسابك موقوف. تواصل مع الإدارة.",
  Default: "حدث خطأ غير متوقع. حاول مرة أخرى.",
};

export function LoginCard({
  callbackUrl,
  error,
}: {
  callbackUrl?: string;
  error?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    await signIn("google", { callbackUrl: callbackUrl ?? "/dashboard" });
  }

  const errorMsg = error ? (errorMessages[error] ?? errorMessages.Default) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative w-full max-w-md"
    >
      <div className="bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
            S5
          </div>
          <h1 className="text-2xl font-bold">مرحباً بك في SPEAR5</h1>
          <p className="text-muted-foreground text-sm mt-2">
            منصة إدارة بوت تداول العملات الرقمية
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="flex items-center gap-3 bg-red-950/40 border border-red-900/50 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول بـ Google"}
        </button>

        {/* Security note */}
        <div className="flex items-start gap-3 mt-6 p-4 bg-white/[0.03] rounded-xl border border-white/5">
          <Shield className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            بتسجيل دخولك، توافق على{" "}
            <Link href="/legal/terms" className="text-green-400 hover:underline">
              شروط الاستخدام
            </Link>{" "}
            و{" "}
            <Link href="/legal/risk-disclosure" className="text-green-400 hover:underline">
              إفصاح المخاطر المالية
            </Link>.
            مفاتيح Binance API مُشفَّرة ومحمية.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

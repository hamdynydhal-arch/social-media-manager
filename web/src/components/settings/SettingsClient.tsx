"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle2, Save, Loader2, Info } from "lucide-react";
import { RiskLevelSelector } from "./RiskLevelSelector";
import type { RiskLevel } from "@prisma/client";
import { formatUSD } from "@/lib/utils";

interface MaskedSettings {
  binanceApiKeyMasked: string | null;
  binanceSecretMasked: string | null;
  telegramBotTokenMasked: string | null;
  telegramChatId: string | null;
  riskLevel: RiskLevel;
  initialCapital: number;
  currentCapital: number;
  vault: number;
  isLaunched: boolean;
  isLiveMode: boolean;
  hasApiKeys: boolean;
}

export function SettingsClient({
  settings,
  isOnboarding,
}: {
  settings: MaskedSettings;
  isOnboarding: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [tgToken, setTgToken] = useState("");
  const [tgChatId, setTgChatId] = useState(settings.telegramChatId ?? "");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(settings.riskLevel);
  const [initialCapital, setInitialCapital] = useState(
    settings.initialCapital > 0 ? settings.initialCapital.toString() : ""
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

  async function handleSave() {
    const capital = parseFloat(initialCapital);
    if (initialCapital && (isNaN(capital) || capital <= 0)) {
      toast.error("رأس المال يجب أن يكون رقماً موجباً");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/settings/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            binanceApiKey: apiKey || undefined,
            binanceSecret: apiSecret || undefined,
            telegramBotToken: tgToken || undefined,
            telegramChatId: tgChatId || undefined,
            riskLevel,
            initialCapital: capital || settings.initialCapital,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("تم حفظ الإعدادات بنجاح");
          setApiKey("");
          setApiSecret("");
          setTgToken("");
          if (isOnboarding) router.push("/dashboard");
          else router.refresh();
        } else {
          toast.error(data.error ?? "فشل حفظ الإعدادات");
        }
      } catch {
        toast.error("خطأ في الاتصال بالخادم");
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Onboarding header */}
      <AnimatePresence>
        {isOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-950/30 border border-green-900/30 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-green-400 mb-2">مرحباً بك في SPEAR5! 🎉</h2>
            <p className="text-muted-foreground text-sm">
              قبل البدء، أدخل مفاتيح Binance API واختر مستوى المخاطرة المناسب لك.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page title */}
      <div className="page-header">
        <h1 className="page-title">الإعدادات</h1>
        <p className="page-subtitle">ضبط مفاتيح API وإعدادات البوت</p>
      </div>

      {/* Security Warning */}
      <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <AlertTriangle className="w-5 h-5" />
          ⚠️ تنبيه أمني مهم — اقرأ قبل الإدخال
        </div>
        <ul className="space-y-2 text-sm text-amber-200/70">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            أنشئ API Key على Binance مع صلاحيات <strong>Spot Trading فقط</strong>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <strong>لا تُفعّل Withdrawal أبداً</strong> — هذا يحمي أموالك من السرقة
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            قيّد الـ IP للخادم إن أمكن لمزيد من الأمان
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            مفاتيحك مُشفَّرة بـ AES-256-GCM في قاعدة البيانات
          </li>
        </ul>
      </div>

      {/* Binance API Keys */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h3 className="font-bold">مفاتيح Binance API</h3>
            <p className="text-xs text-muted-foreground">اتركها فارغة إذا لم تريد تغييرها</p>
          </div>
        </div>

        {settings.hasApiKeys && (
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-900/30 px-3 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            مفاتيح API محفوظة ومُشفَّرة
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              API Key {settings.binanceApiKeyMasked && (
                <span className="text-xs text-muted-foreground/60 font-mono mr-2">
                  ({settings.binanceApiKeyMasked})
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={settings.hasApiKeys ? "اتركه فارغاً للإبقاء على الحالي" : "أدخل Binance API Key"}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring pr-12"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              API Secret {settings.binanceSecretMasked && (
                <span className="text-xs text-muted-foreground/60 font-mono mr-2">
                  ({settings.binanceSecretMasked})
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showApiSecret ? "text" : "password"}
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder={settings.hasApiKeys ? "اتركه فارغاً للإبقاء على الحالي" : "أدخل Binance API Secret"}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring pr-12"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowApiSecret(!showApiSecret)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Level */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Info className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold">مستوى المخاطرة</h3>
            <p className="text-xs text-muted-foreground">يحدد حجم كل صفقة وعدد الصفقات المتزامنة</p>
          </div>
        </div>
        <RiskLevelSelector value={riskLevel} onChange={setRiskLevel} />
      </div>

      {/* Capital */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
            <span className="text-green-400 text-sm font-bold">$</span>
          </div>
          <div>
            <h3 className="font-bold">رأس المال الأولي</h3>
            <p className="text-xs text-muted-foreground">المبلغ الذي ستبدأ به التداول</p>
          </div>
        </div>

        {settings.currentCapital > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5 text-center">
            <div className="bg-muted/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">رأس المال الحالي</div>
              <div className="font-bold text-green-400 number-ltr text-sm">{formatUSD(settings.currentCapital)}</div>
            </div>
            <div className="bg-muted/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">الخزنة</div>
              <div className="font-bold text-blue-400 number-ltr text-sm">{formatUSD(settings.vault)}</div>
            </div>
            <div className="bg-muted/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">المجموع</div>
              <div className="font-bold number-ltr text-sm">{formatUSD(settings.currentCapital + settings.vault)}</div>
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            رأس المال الأولي (USD)
          </label>
          <div className="relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={initialCapital}
              onChange={(e) => setInitialCapital(e.target.value)}
              placeholder="مثال: 1000"
              className="w-full bg-input border border-border rounded-lg pr-8 pl-4 py-3 text-sm number-ltr placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Telegram (optional) */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 text-sm">
              ✈️
            </div>
            <div>
              <h3 className="font-bold">إشعارات Telegram</h3>
              <p className="text-xs text-muted-foreground">اختياري — للإشعارات الشخصية</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded">اختياري</span>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Bot Token {settings.telegramBotTokenMasked && (
              <span className="text-xs font-mono mr-2 text-muted-foreground/60">
                ({settings.telegramBotTokenMasked})
              </span>
            )}
          </label>
          <input
            type="password"
            value={tgToken}
            onChange={(e) => setTgToken(e.target.value)}
            placeholder="اتركه فارغاً للإبقاء على الحالي"
            className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring"
            dir="ltr"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Chat ID</label>
          <input
            type="text"
            value={tgChatId}
            onChange={(e) => setTgChatId(e.target.value)}
            placeholder="مثال: -100123456789"
            className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring"
            dir="ltr"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end pb-10">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-3 bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-70 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isPending ? "جارٍ الحفظ..." : isOnboarding ? "حفظ والمتابعة" : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Shield, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type InviteStatus = "pending" | "invalid" | "expired" | "already_accepted" | "wrong_user";

interface InviteAcceptClientProps {
  status: InviteStatus;
  inviterName?: string;
  token?: string;
  expectedEmail?: string;
}

export function InviteAcceptClient({
  status,
  inviterName,
  token,
  expectedEmail,
}: InviteAcceptClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleAccept() {
    if (!token) return;
    startTransition(async () => {
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم قبول الدعوة! أنت الآن Super Admin");
        router.push("/admin/stats");
      } else {
        toast.error(data.error ?? "فشل قبول الدعوة");
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-8 text-center"
      >
        {status === "pending" && (
          <>
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3">دعوة Super Admin</h1>
            <p className="text-muted-foreground mb-6">
              قام <strong className="text-foreground">{inviterName}</strong> بدعوتك للانضمام
              كـ Super Admin على منصة SPEAR5.
            </p>
            <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-4 mb-6 text-sm text-amber-200/70 text-right">
              <p className="font-bold text-amber-400 mb-2">بصفتك Super Admin ستمتلك:</p>
              <ul className="space-y-1">
                <li>• إدارة جميع المستخدمين</li>
                <li>• تعديل كود البوت</li>
                <li>• رؤية إحصائيات المنصة</li>
                <li>• دعوة مديرين آخرين</li>
              </ul>
            </div>
            <button
              onClick={handleAccept}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-all disabled:opacity-70"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {isPending ? "جارٍ القبول..." : "قبول الدعوة"}
            </button>
          </>
        )}

        {status === "invalid" && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">رابط غير صالح</h1>
            <p className="text-muted-foreground">هذا الرابط غير موجود أو تالف.</p>
          </>
        )}

        {status === "expired" && (
          <>
            <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">انتهت صلاحية الرابط</h1>
            <p className="text-muted-foreground">هذا الرابط منتهي الصلاحية أو تم إلغاؤه. اطلب دعوة جديدة.</p>
          </>
        )}

        {status === "already_accepted" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">تم قبول الدعوة مسبقاً</h1>
            <p className="text-muted-foreground">هذه الدعوة مقبولة بالفعل.</p>
          </>
        )}

        {status === "wrong_user" && (
          <>
            <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">هذه الدعوة ليست لك</h1>
            <p className="text-muted-foreground">
              هذه الدعوة مخصصة لـ{" "}
              <span className="font-mono text-foreground">{expectedEmail}</span>.
              سجّل دخولك بالحساب الصحيح.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}

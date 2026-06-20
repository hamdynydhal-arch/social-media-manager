"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Shield, Plus, Trash2, Clock, Mail, Crown, Loader2 } from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface Admin {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
}

interface SuperAdminsClientProps {
  admins: Admin[];
  pendingInvites: PendingInvite[];
  currentUserId: string;
  initialAdminEmail: string;
}

export function SuperAdminsClient({
  admins,
  pendingInvites,
  currentUserId,
  initialAdminEmail,
}: SuperAdminsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);

  async function handleInvite() {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("أدخل إيميلاً صحيحاً");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/admin/super-admins/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`تم إرسال الدعوة إلى ${inviteEmail}`);
        setInviteEmail("");
        setShowInviteForm(false);
        router.refresh();
      } else {
        toast.error(data.error ?? "فشل إرسال الدعوة");
      }
    });
  }

  async function handleRemoveAdmin(userId: string) {
    startTransition(async () => {
      const res = await fetch("/api/admin/super-admins/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم إزالة الصلاحيات");
        router.refresh();
      } else {
        toast.error(data.error ?? "فشل الإزالة");
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">إدارة Super Admins</h1>
          <p className="page-subtitle">{admins.length} مدير حالياً</p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-medium px-4 py-2.5 rounded-xl transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          دعوة مدير جديد
        </button>
      </div>

      {/* Invite form */}
      {showInviteForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 border-amber-900/20"
        >
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            دعوة Super Admin جديد
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            سيُرسَل إيميل للمستخدم يحتوي رابط موافقة. يجب أن يكون المستخدم مسجّلاً في المنصة.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="الإيميل المراد دعوته"
              className="flex-1 bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              dir="ltr"
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
            <button
              onClick={handleInvite}
              disabled={isPending}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2.5 rounded-lg transition-all disabled:opacity-70 text-sm"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              إرسال الدعوة
            </button>
          </div>
        </motion.div>
      )}

      {/* Current admins */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm">المديرون الحاليون</h3>
        </div>
        <div className="divide-y divide-border/50">
          {admins.map((admin, i) => {
            const isOwner = admin.email === initialAdminEmail;
            const isCurrentUser = admin.id === currentUserId;
            return (
              <motion.div
                key={admin.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  {admin.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={admin.image} alt="" className="w-9 h-9 rounded-full" />
                  ) : (
                    <div className="w-9 h-9 bg-amber-500/10 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-amber-400" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 font-medium text-sm">
                      {admin.name ?? "—"}
                      {isOwner && <Crown className="w-3 h-3 text-amber-400" />}
                      {isCurrentUser && <span className="text-xs text-green-400">(أنت)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{admin.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{formatDate(admin.createdAt)}</span>
                  {!isOwner && !isCurrentUser && (
                    <button
                      onClick={() => handleRemoveAdmin(admin.id)}
                      disabled={isPending}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-bold text-sm">دعوات معلّقة ({pendingInvites.length})</h3>
          </div>
          <div className="divide-y divide-border/50">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="font-medium text-sm" dir="ltr">{invite.email}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    دعا بواسطة: {invite.invitedBy} · تنتهي {formatRelativeTime(invite.expiresAt)}
                  </div>
                </div>
                <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded">
                  منتظر
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  OctagonX,
  Trash2,
  Shield,
} from "lucide-react";
import { cn, formatDate, formatRelativeTime, formatUSD } from "@/lib/utils";
import type { WorkerStatus } from "@prisma/client";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  botStatus: {
    isLaunched: boolean;
    workerStatus: WorkerStatus;
    currentCapital: number;
    lastHeartbeat: string | null;
  } | null;
}

export function UsersAdminClient({
  users,
  currentUserId,
}: {
  users: UserData[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name?.toLowerCase() ?? "").includes(search.toLowerCase())
  );

  async function handleEmergencyStop(userId: string) {
    startTransition(async () => {
      const res = await fetch("/api/admin/users/emergency-stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم إيقاف البوت");
        router.refresh();
      } else {
        toast.error(data.error ?? "فشل الإيقاف");
      }
    });
  }

  async function handleDeleteUser(userId: string) {
    startTransition(async () => {
      const res = await fetch("/api/admin/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم حذف المستخدم");
        setConfirmDelete(null);
        router.refresh();
      } else {
        toast.error(data.error ?? "فشل الحذف");
      }
    });
  }

  const activeBotsCount = users.filter((u) => u.botStatus?.isLaunched).length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">إدارة المستخدمين</h1>
        <p className="page-subtitle">
          {users.length} مستخدم مسجّل — {activeBotsCount} بوت نشط
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="ابحث بالاسم أو الإيميل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pr-10 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Users table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-right px-5 py-3 font-medium">المستخدم</th>
                <th className="text-right px-5 py-3 font-medium">تاريخ التسجيل</th>
                <th className="text-right px-5 py-3 font-medium">رأس المال</th>
                <th className="text-right px-5 py-3 font-medium">حالة البوت</th>
                <th className="text-right px-5 py-3 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "border-b border-border/50 hover:bg-white/[0.02] transition-colors",
                    user.id === currentUserId && "bg-green-950/10"
                  )}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
                          {user.name?.[0] ?? user.email[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.name ?? "—"}
                          {user.isSuperAdmin && (
                            <Shield className="w-3 h-3 text-amber-400" />
                          )}
                          {user.id === currentUserId && (
                            <span className="text-xs text-green-400">(أنت)</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    {user.botStatus ? (
                      <span className="font-medium number-ltr">
                        {formatUSD(user.botStatus.currentCapital)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {user.botStatus ? (
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            user.botStatus.isLaunched ? "bg-green-400 animate-pulse" : "bg-muted-foreground"
                          )}
                        />
                        <span className={user.botStatus.isLaunched ? "text-green-400" : "text-muted-foreground"}>
                          {user.botStatus.isLaunched ? "نشط" : "متوقف"}
                        </span>
                        {user.botStatus.lastHeartbeat && (
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(user.botStatus.lastHeartbeat)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">لم يُعدّ</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {user.botStatus?.isLaunched && (
                        <button
                          onClick={() => handleEmergencyStop(user.id)}
                          disabled={isPending}
                          title="إيقاف طارئ"
                          className="p-2 text-red-400 hover:bg-red-950/40 rounded-lg transition-all"
                        >
                          <OctagonX className="w-4 h-4" />
                        </button>
                      )}
                      {user.id !== currentUserId && !user.isSuperAdmin && (
                        confirmDelete === user.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={isPending}
                              className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                            >
                              تأكيد
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs text-muted-foreground px-2 py-1"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(user.id)}
                            title="حذف المستخدم"
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              لا توجد نتائج
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

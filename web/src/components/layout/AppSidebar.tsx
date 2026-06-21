"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Settings,
  History,
  BarChart2,
  Users,
  Code2,
  UserCog,
  PieChart,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";

const userNavItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/settings", label: "الإعدادات", icon: Settings },
  { href: "/trades", label: "سجل الصفقات", icon: History },
  { href: "/backtest", label: "Backtest", icon: BarChart2 },
];

const adminNavItems = [
  { href: "/admin/stats", label: "إحصائيات المنصة", icon: PieChart },
  { href: "/admin/users", label: "إدارة المستخدمين", icon: Users },
  { href: "/admin/bot-code", label: "كود البوت", icon: Code2 },
  { href: "/admin/super-admins", label: "Super Admins", icon: UserCog },
];

interface AppSidebarProps {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
    isSuperAdmin: boolean;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 right-0 h-screen w-64 bg-navy-900 border-l border-gold-DEFAULT/15 flex flex-col z-40 max-lg:hidden">
      {/* Logo */}
      <div className="p-4 border-b border-gold-DEFAULT/15">
        <Logo className="h-9 w-9" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-1">
        {/* User section */}
        <div className="text-xs text-muted-foreground font-medium px-3 py-2 uppercase tracking-wider">
          الرئيسية
        </div>
        {userNavItems.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        {/* Admin section */}
        {user.isSuperAdmin && (
          <>
            <div className="text-xs text-muted-foreground font-medium px-3 py-2 mt-4 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-3 h-3 text-gold-DEFAULT" />
              إدارة المنصة
            </div>
            {adminNavItems.map((item) => (
              <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} isAdmin />
            ))}
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-gold-DEFAULT/15">
        <div className="flex items-center gap-3 mb-3">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="w-8 h-8 rounded-full ring-1 ring-gold-DEFAULT/30" />
          ) : (
            <div className="w-8 h-8 bg-navy-700 rounded-full flex items-center justify-center text-sm font-bold text-gold-DEFAULT ring-1 ring-gold-DEFAULT/30">
              {user.name?.[0] ?? user.email[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate text-foreground">{user.name ?? "مستخدم"}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </div>
          {user.isSuperAdmin && (
            <span className="text-xs bg-gold-DEFAULT/10 text-gold-DEFAULT border border-gold-DEFAULT/20 px-1.5 py-0.5 rounded shrink-0">
              Admin
            </span>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 px-3 py-2.5 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
}: {
  item: { href: string; label: string; icon: React.ElementType };
  active: boolean;
  isAdmin?: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
        active
          ? "bg-gold-DEFAULT/10 text-gold-DEFAULT font-medium border border-gold-DEFAULT/20"
          : "text-muted-foreground hover:text-foreground hover:bg-navy-700/60"
      )}
    >
      <item.icon
        className={cn(
          "w-4 h-4 shrink-0",
          active ? "text-gold-DEFAULT" : "group-hover:text-gold-DEFAULT transition-colors"
        )}
      />
      {item.label}
    </Link>
  );
}

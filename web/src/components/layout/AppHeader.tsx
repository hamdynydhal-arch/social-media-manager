"use client";

import { Bell, Menu } from "lucide-react";

interface AppHeaderProps {
  user: {
    name?: string | null;
    email: string;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="h-16 border-b border-gold-DEFAULT/15 bg-navy-900/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Mobile menu (placeholder) */}
      <button className="lg:hidden text-muted-foreground hover:text-gold-DEFAULT transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      {/* Greeting */}
      <div className="hidden lg:block">
        <span className="text-sm text-muted-foreground">
          مرحباً،{" "}
          <span className="text-gold-DEFAULT font-semibold">{user.name ?? user.email}</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="relative text-muted-foreground hover:text-gold-DEFAULT transition-colors p-2 rounded-lg hover:bg-gold-DEFAULT/5">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.isActive) redirect("/login?error=AccountDisabled");

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar user={session.user} />
      <div className="flex-1 flex flex-col min-h-screen mr-64 max-lg:mr-0">
        <AppHeader user={session.user} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
